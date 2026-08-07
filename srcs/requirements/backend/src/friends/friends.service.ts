import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';
import { CreateFriendRequestDto } from './dto';
import { UsersService } from '../users/users.service';
import { SafeUser } from '../common/types';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FriendsService {
    constructor(
        private prisma: PrismaService,
        private users: UsersService,
        private notificationsService: NotificationsService,
    ) {}

    async getRelationship(userId: number, targetId: number) {
        return await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { initiatorId: userId, receiverId: targetId },
                    { initiatorId: targetId, receiverId: userId },
                ],
            },
        });
    }

    async getMyFriends(user: SafeUser) {
        return this.getFriendsByUsername(user.username);
    }

    async getFriendsByUsername(username: string) {
        const user = await this.users.findByUsername(username);
        if (!user) throw new NotFoundException('USER_NOT_FOUND');

        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [{ initiatorId: user.id }, { receiverId: user.id }],
                status: FriendshipStatus.ACCEPTED,
            },
            include: {
                initiator: { select: { id: true, username: true, avatarUrl: true, status: true } },
                receiver: { select: { id: true, username: true, avatarUrl: true, status: true } },
            },
        });

        return friendships.map((f) => (f.initiatorId === user.id ? f.receiver : f.initiator));
    }

    async getFriendRequests(user: SafeUser) {
        const requests = await this.prisma.friendship.findMany({
            where: {
                receiverId: user.id,
                status: FriendshipStatus.PENDING,
            },
            include: {
                initiator: { select: { id: true, username: true, avatarUrl: true, status: true } },
            },
        });

        return requests.map((f) => ({ ...f.initiator, requestedAt: f.createdAt }));
    }

    async getFriendRequestsSent(user: SafeUser) {
        const requests = await this.prisma.friendship.findMany({
            where: {
                initiatorId: user.id,
                status: FriendshipStatus.PENDING,
            },
            include: {
                receiver: { select: { id: true, username: true, avatarUrl: true, status: true } },
            },
        });

        return requests.map((f) => ({ ...f.receiver, requestedAt: f.createdAt }));
    }

    async friendRequest(user: SafeUser, dto: CreateFriendRequestDto) {
        const userExist = await this.users.findByUsername(dto.username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');
        if (user.username === dto.username) throw new BadRequestException('CANNOT_ADD_YOURSELF');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);
        if (existing) {
            if (existing.status === 'PENDING') throw new ConflictException('REQUEST_ALREADY_SENT');
            if (existing.status === 'ACCEPTED') throw new ConflictException('ALREADY_FRIENDS');
            if (existing.status === 'BLOCKED') throw new ConflictException('BLOCKED');
        }

        const friendship = await this.prisma.friendship.create({
            data: {
                initiatorId: userId,
                receiverId: targetId,
            },
        });

        await this.notificationsService.notifyFriendRequest(
            targetId,
            { id: userId, username: user.username },
            friendship.id,
        );

        return friendship;
    }

    async friendAccept(user: SafeUser, username: string) {
        const userExist = await this.users.findByUsername(username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);

        if (existing) {
            if (existing.receiverId !== userId) throw new ForbiddenException('NOT_YOUR_REQUEST');
            if (existing.status === 'ACCEPTED') throw new ConflictException('ALREADY_FRIENDS');
            if (existing.status === 'BLOCKED') throw new ConflictException('BLOCKED');

            if (existing.status === 'PENDING') {
                await this.prisma.friendship.update({
                    where: { id: existing.id },
                    data: { status: FriendshipStatus.ACCEPTED },
                });

                await this.notificationsService.notifyFriendAccepted(
                    targetId,
                    { id: userId, username: user.username },
                    existing.id,
                );

                return { message: 'ACCEPTED' };
            }
        }

        throw new NotFoundException('REQUEST_NOT_FOUND');
    }

    async friendDecline(user: SafeUser, username: string) {
        const userExist = await this.users.findByUsername(username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);

        if (existing) {
            if (existing.receiverId !== userId) throw new ForbiddenException('NOT_YOUR_REQUEST');
            if (existing.status === 'ACCEPTED') throw new ConflictException('ALREADY_FRIENDS');
            if (existing.status === 'BLOCKED') throw new ConflictException('BLOCKED');

            if (existing.status === 'PENDING') {
                await this.prisma.friendship.delete({
                    where: { id: existing.id },
                });
                await this.notificationsService.deleteBySource(userId, 'FRIENDSHIP', existing.id);
                return { message: 'DECLINED' };
            }
        }

        throw new NotFoundException('REQUEST_NOT_FOUND');
    }

    async deleteFriend(user: SafeUser, username: string) {
        const userExist = await this.users.findByUsername(username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);

        if (existing) {
            if (existing.status === 'PENDING') throw new ConflictException('NOT_FRIENDS');
            if (existing.status === 'BLOCKED') throw new ConflictException('BLOCKED');

            if (existing.status === 'ACCEPTED') {
                await this.prisma.friendship.delete({
                    where: { id: existing.id },
                });
                return { message: 'DELETED' };
            }
        }

        throw new NotFoundException('REQUEST_NOT_FOUND');
    }

    async friendBlock(user: SafeUser, username: string) {
        const userExist = await this.users.findByUsername(username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');

        if (user.username === username) throw new BadRequestException('CANNOT_BLOCK_YOURSELF');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);

        if (existing) {
            if (existing.status === 'BLOCKED') throw new ConflictException('ALREADY_BLOCKED');
            await this.prisma.friendship.delete({ where: { id: existing.id } });
        }

        await this.prisma.friendship.create({
            data: {
                initiatorId: userId,
                receiverId: targetId,
                status: FriendshipStatus.BLOCKED,
            },
        });

        return { message: 'BLOCKED' };
    }

    async friendUnblock(user: SafeUser, username: string) {
        const userExist = await this.users.findByUsername(username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');

        if (user.username === username) throw new BadRequestException('CANNOT_UNBLOCK_YOURSELF');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);

        if (existing) {
            if (existing.initiatorId !== userId) throw new ForbiddenException('NOT_YOUR_BLOCK');

            if (existing.status === 'BLOCKED') {
                await this.prisma.friendship.delete({
                    where: { id: existing.id },
                });
                return { message: 'UNBLOCKED' };
            }
        }

        throw new NotFoundException('REQUEST_NOT_FOUND');
    }

    async getBlocked(user: SafeUser) {
        const requests = await this.prisma.friendship.findMany({
            where: {
                initiatorId: user.id,
                status: FriendshipStatus.BLOCKED,
            },
            include: {
                receiver: { select: { id: true, username: true, avatarUrl: true, status: true } },
            },
        });

        return requests.map((f) => ({ ...f.receiver }));
    }

    async getFriendRelationship(user: SafeUser, username: string) {
        const userExist = await this.users.findByUsername(username);

        if (!userExist) throw new NotFoundException('USER_NOT_FOUND');

        const userId = user.id;
        const targetId = userExist.id;

        const existing = await this.getRelationship(userId, targetId);

        if (!existing) return { relationship: 'NONE' };

        if (existing.status === 'ACCEPTED') return { relationship: 'ACCEPTED' };
        else if (existing.status === 'BLOCKED') {
            if (existing.initiatorId == userId) return { relationship: 'BLOCKED_BY_ME' };
            else if (existing.initiatorId != userId) return { relationship: 'BLOCKED_BY_THEM' };
        } else if (existing.status === 'PENDING') {
            if (existing.initiatorId == userId) return { relationship: 'PENDING_SENT' };
            else if (existing.initiatorId != userId) return { relationship: 'PENDING_RECEIVED' };
        }
        return { relationship: 'NONE' };
    }
}
