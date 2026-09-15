import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TAKE_MSG, CHAT_RATE_LIMIT_MS } from '../common/chat.constant';
import { Socket } from 'socket.io';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private users: UsersService,
        private notificationsService: NotificationsService,
    ) {}

    private clients = new Map<number, Socket>();
    private lastMessage = new Map<number, number>();

    registerClient(userId: number, client: Socket) {
        this.clients.set(userId, client);
    }

    unregisterClient(userId: number, socketId: string) {
        if (this.clients.get(userId)?.id === socketId) {
            this.clients.delete(userId);
            this.lastMessage.delete(userId);
        }
    }
    async sendMessage(userId: number, senderUsername: string, toUsername: string, content: string) {
        const last = this.lastMessage.get(userId) ?? 0;
        if (Date.now() - last < CHAT_RATE_LIMIT_MS) return;
        this.lastMessage.set(userId, Date.now());

        const user = await this.users.findByUsername(toUsername);
        if (!user) return;

        if (user.id === userId) return;

        const blocked = await this.prisma.friendship.findFirst({
            where: {
                initiatorId: user.id,
                receiverId: userId,
                status: 'BLOCKED',
            },
        });
        if (blocked) return;

        const targetId = user.id;
        const msg = await this.prisma.message.create({
            data: {
                content,
                senderId: userId,
                receiverId: targetId,
            },
        });

        this.clients.get(user.id)?.emit('receive_message', {
            from: userId,
            fromUsername: senderUsername,
            content,
            sentAt: msg.sentAt,
        });

        await this.notificationsService.notifyChatMessage(
            targetId,
            { id: userId, username: senderUsername },
            { id: msg.id, content },
        );
    }

    async getUserChatHistory(userId: number, targetUsername: string, before?: number) {
        const target = await this.users.findByUsername(targetUsername);
        if (!target) return [];

        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: target.id },
                    { senderId: target.id, receiverId: userId },
                ],
                ...(before && { id: { lt: before } }),
            },
            orderBy: { sentAt: 'desc' },
            take: TAKE_MSG,
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
                receiver: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }

    async getHistoryChat(userId: number) {
        const msgs = await this.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { sentAt: 'desc' },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
                receiver: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        const seen = new Set<string>();
        const conversations = [];

        for (const msg of msgs) {
            const key = `${Math.min(msg.senderId, msg.receiverId)}-${Math.max(msg.senderId, msg.receiverId)}`;
            if (!seen.has(key)) {
                seen.add(key);
                conversations.push({
                    user: msg.senderId === userId ? msg.receiver : msg.sender,
                    lastMessage: msg.content,
                    sentAt: msg.sentAt,
                });
            }
        }

        return conversations;
    }
}
