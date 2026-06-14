import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AsyncApiController } from './asyncapi/asyncapi.controller';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';
import { LeaderBoardModule } from './leaderboard/leaderboard.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { THROTTLE_LIMIT_AUTH_GLOBAL } from './common/throttle.constants';
import { FriendsModule } from './friends/friends.module';
import { StatusModule } from './status/status.module';
import { ChatModule } from './chat/chat.module';
import { AchievementModule } from './achievement/achievement.module';
import { QuoteModule } from './quote/quote.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ...THROTTLE_LIMIT_AUTH_GLOBAL },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    LeaderBoardModule,
    GameModule,
    FriendsModule,
    StatusModule,
    ChatModule,
    AchievementModule,
    QuoteModule
  ],
  controllers: [AsyncApiController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
