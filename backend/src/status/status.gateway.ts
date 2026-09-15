import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { UserStatus } from '@prisma/client';
import { WS_CORS } from '../common/ws.config';

@WebSocketGateway({ cors: WS_CORS, namespace: '/status' })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private connectionCount = new Map<number, number>();

    constructor(
        private authService: AuthService,
        private prisma: PrismaService,
    ) {}

    private broadcastStatus(userId: number, status: UserStatus) {
        this.server.emit('status:update', { userId, status });
    }

    async handleConnection(client: Socket) {
        const ok = await this.authService.validateWsClient(client);
        if (!ok) return client.disconnect();
        const userId = client.data.user.id;
        client.data.userId = userId;

        const count = (this.connectionCount.get(userId) ?? 0) + 1;
        this.connectionCount.set(userId, count);

        if (count === 1) {
            const current = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { status: true },
            });
            if (current?.status !== UserStatus.IN_GAME) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { status: UserStatus.ONLINE },
                });
                this.broadcastStatus(userId, UserStatus.ONLINE);
            }
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (!userId) return;

        const count = (this.connectionCount.get(userId) ?? 1) - 1;

        if (count <= 0) {
            this.connectionCount.delete(userId);
            await this.prisma.user.update({
                where: { id: userId },
                data: { status: UserStatus.OFFLINE },
            });
            this.broadcastStatus(userId, UserStatus.OFFLINE);
        } else {
            this.connectionCount.set(userId, count);
        }
    }
}
