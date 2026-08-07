import { Module, forwardRef } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [PrismaModule, forwardRef(() => UsersModule)],
    providers: [AchievementService],
    exports: [AchievementService],
})
export class AchievementModule {}
