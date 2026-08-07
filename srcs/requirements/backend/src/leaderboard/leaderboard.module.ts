import { Module } from '@nestjs/common';
import { LeaderBoardService } from './leaderboard.service';
import { LeaderBoardController } from './leaderboard.controller';

@Module({
    providers: [LeaderBoardService],
    controllers: [LeaderBoardController],
    exports: [LeaderBoardService],
})
export class LeaderBoardModule {}
