import { ApiProperty } from '@nestjs/swagger';

class AchievementDto {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 'first_race' }) key: string;
    @ApiProperty({ example: 'First Race' }) label: string;
    @ApiProperty({ example: 'Complete your first race' }) description: string;
    @ApiProperty({ example: '🏆', nullable: true }) icon: string | null;
}

export class UserAchievementDto {
    @ApiProperty({ example: '2026-01-01T00:00:00.000Z', nullable: true }) unlockedAt: string | null;
    @ApiProperty({ type: AchievementDto }) achievement: AchievementDto;
}
