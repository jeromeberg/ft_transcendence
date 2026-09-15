import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [UsersModule, NotificationsModule],
    providers: [FriendsService],
    controllers: [FriendsController],
    exports: [FriendsService],
})
export class FriendsModule {}
