import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { ChatController } from './chat.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [AuthModule, PrismaModule, UsersModule, NotificationsModule],
    providers: [ChatGateway, ChatService, WsJwtGuard],
    controllers: [ChatController],
})
export class ChatModule {}
