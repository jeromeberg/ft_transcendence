import { Injectable, Logger } from '@nestjs/common';
import { Notification, NotificationSourceType, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { unreadWhere } from './notifications.helpers';

export type NotificationPayload = Record<string, unknown>;

export type CreateNotificationInput = {
    recipientId: number;
    actorId?: number | null;
    type: NotificationType;
    sourceType?: NotificationSourceType | null;
    sourceId?: number | null;
    title?: string | null;
    content?: string | null;
    payload?: NotificationPayload | null;
};

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) {}

    private toJsonInput(
        payload: NotificationPayload | null | undefined,
    ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
        if (payload === undefined) return undefined;
        if (payload === null) return Prisma.JsonNull;
        return payload as Prisma.InputJsonValue;
    }

    private toOutput(notification: Notification) {
        return {
            id: notification.id,
            recipientId: notification.recipientId,
            actorId: notification.actorId,
            type: notification.type,
            sourceType: notification.sourceType,
            sourceId: notification.sourceId,
            title: notification.title,
            content: notification.content,
            payload: notification.payload,
            createdAt: notification.createdAt,
            readAt: notification.readAt,
        };
    }

    async create(
        input: CreateNotificationInput,
        pushRealtime = true,
    ): Promise<Notification | null> {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    recipientId: input.recipientId,
                    actorId: input.actorId ?? null,
                    type: input.type,
                    sourceType: input.sourceType ?? null,
                    sourceId: input.sourceId ?? null,
                    title: input.title ?? null,
                    content: input.content ?? null,
                    payload: this.toJsonInput(input.payload),
                },
            });

            if (pushRealtime) {
                this.notificationsGateway.emitNewNotification(
                    input.recipientId,
                    this.toOutput(notification),
                );
                const unreadCount = await this.countUnread(input.recipientId);
                this.notificationsGateway.emitUnreadCount(input.recipientId, unreadCount);
            }

            return notification;
        } catch (error) {
            this.logger.error(
                `Failed to create ${input.type} notification for user ${input.recipientId}`,
                error instanceof Error ? error.stack : String(error),
            );
            return null;
        }
    }

    notifyChatMessage(
        recipientId: number,
        sender: { id: number; username: string },
        message: { id: number; content: string },
    ) {
        return this.create({
            recipientId,
            actorId: sender.id,
            type: 'CHAT_MESSAGE',
            sourceType: 'MESSAGE',
            sourceId: message.id,
            title: `New message from ${sender.username}`,
            content: message.content,
            payload: {
                fromUserId: sender.id,
                fromUsername: sender.username,
            },
        });
    }

    notifyFriendRequest(
        recipientId: number,
        actor: { id: number; username: string },
        friendshipId: number,
    ) {
        return this.create({
            recipientId,
            actorId: actor.id,
            type: 'FRIEND_REQUEST',
            sourceType: 'FRIENDSHIP',
            sourceId: friendshipId,
            title: 'Friend request',
            content: `${actor.username} sent you a friend request`,
            payload: { username: actor.username },
        });
    }

    notifyFriendAccepted(
        recipientId: number,
        actor: { id: number; username: string },
        friendshipId: number,
    ) {
        return this.create({
            recipientId,
            actorId: actor.id,
            type: 'FRIEND_ACCEPTED',
            sourceType: 'FRIENDSHIP',
            sourceId: friendshipId,
            title: 'Friend request accepted',
            content: `${actor.username} accepted your friend request`,
            payload: { username: actor.username },
        });
    }

    async deleteBySource(
        recipientId: number,
        sourceType: NotificationSourceType,
        sourceId: number,
    ) {
        try {
            const result = await this.prisma.notification.deleteMany({
                where: { recipientId, sourceType, sourceId },
            });

            if (result.count > 0) {
                const unreadCount = await this.countUnread(recipientId);
                this.notificationsGateway.emitUnreadCount(recipientId, unreadCount);
            }
        } catch (error) {
            this.logger.error(
                `Failed to delete ${sourceType}:${sourceId} notifications for user ${recipientId}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async listForUser(userId: number, cursor?: number, take = 20, unreadOnly = false) {
        const safeTake = Math.min(Math.max(take, 1), 100);

        const notifications = await this.prisma.notification.findMany({
            where: {
                recipientId: userId,
                archivedAt: null,
                ...(unreadOnly ? { readAt: null } : {}),
                ...(cursor ? { id: { lt: cursor } } : {}),
            },
            orderBy: { id: 'desc' },
            take: safeTake,
        });

        const nextCursor =
            notifications.length === safeTake ? notifications[notifications.length - 1].id : null;

        return {
            data: notifications.map((notification) => this.toOutput(notification)),
            nextCursor,
        };
    }

    async countUnread(userId: number) {
        return this.prisma.notification.count({ where: unreadWhere(userId) });
    }

    async markAsRead(userId: number, ids: number[]) {
        const uniqueIds = [...new Set(ids)];
        if (uniqueIds.length === 0) {
            const unreadCount = await this.countUnread(userId);
            return { updated: 0, unreadCount };
        }

        const result = await this.prisma.notification.updateMany({
            where: {
                ...unreadWhere(userId),
                id: { in: uniqueIds },
            },
            data: { readAt: new Date() },
        });

        const unreadCount = await this.countUnread(userId);
        this.notificationsGateway.emitUnreadCount(userId, unreadCount);

        return {
            updated: result.count,
            unreadCount,
        };
    }

    async markAllAsRead(userId: number) {
        const result = await this.prisma.notification.updateMany({
            where: unreadWhere(userId),
            data: { readAt: new Date() },
        });

        const unreadCount = await this.countUnread(userId);
        this.notificationsGateway.emitUnreadCount(userId, unreadCount);

        return {
            updated: result.count,
            unreadCount,
        };
    }
}
