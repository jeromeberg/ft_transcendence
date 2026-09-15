import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { WS_CORS } from '../common/ws.config';
import { unreadWhere } from './notifications.helpers';

@WebSocketGateway({ cors: WS_CORS, namespace: '/notifications' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Namespace;

    constructor(
        private authService: AuthService,
        private prisma: PrismaService,
    ) {}

    private roomForUser(userId: number): string {
        return `user:${userId}`;
    }

    async handleConnection(client: Socket) {
        const ok = await this.authService.validateWsClient(client);
        if (!ok) return client.disconnect();

        const userId = client.data.user.id;
        client.join(this.roomForUser(userId));

        const unreadCount = await this.prisma.notification.count({
            where: unreadWhere(userId),
        });

        this.server
            .to(this.roomForUser(userId))
            .emit('notifications:unread_count', { unreadCount });
    }

    async handleDisconnect(_client: Socket) {
        return;
    }

    emitNewNotification(userId: number, notification: unknown) {
        this.server.to(this.roomForUser(userId)).emit('notifications:new', notification);
    }

    emitUnreadCount(userId: number, unreadCount: number) {
        this.server
            .to(this.roomForUser(userId))
            .emit('notifications:unread_count', { unreadCount });
    }
}
