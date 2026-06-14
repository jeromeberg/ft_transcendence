import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { BotService } from './bot.service';
import { GameGateway } from './game.gateway';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AchievementModule } from '../achievement/achievement.module';
import { QuoteModule } from '../quote/quote.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, AchievementModule, QuoteModule],
  providers: [GameService, BotService, GameGateway, WsJwtGuard],
})
export class GameModule {}
