import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { WS_CORS } from '../common/ws.config';
import { UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { Socket, Namespace } from 'socket.io';
import { SendMessageDto } from './dto';

@WebSocketGateway({ cors: WS_CORS, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Namespace;

    constructor(
        private chatService: ChatService,
        private authService: AuthService,
    ) {}

    async handleConnection(client: Socket) {
        const ok = await this.authService.validateWsClient(client);
        if (!ok) return client.disconnect();
        this.chatService.registerClient(client.data.user.id, client);
    }

    async handleDisconnect(client: Socket) {
        if (client.data.user) this.chatService.unregisterClient(client.data.user.id, client.id);
    }

    @UseGuards(WsJwtGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @SubscribeMessage('send_message')
    async handleSendMessage(client: Socket, payload: SendMessageDto) {
        const user = client.data.user;
        await this.chatService.sendMessage(user.id, user.username, payload.to, payload.content);
    }
}
