import { ApiProperty } from '@nestjs/swagger';
import { UserAchievementDto } from './achievement-response.dto';

export class UserStatsDto {
    @ApiProperty({ example: 1 }) rank: number;
    @ApiProperty({ example: 85 }) avgWpm: number;
    @ApiProperty({ example: 3 }) level: number;
    @ApiProperty({ example: 12 }) gamesPlayed: number;
}

export class UserProfileDto {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 'johndoe' }) username: string;
    @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg', nullable: true }) avatarUrl:
        string | null;
    @ApiProperty({ example: 'Hello world', nullable: true }) bio: string | null;
    @ApiProperty({ example: 'ONLINE' }) status: string;
    @ApiProperty({ example: 'EN' }) language: string;
    @ApiProperty({ example: '2026-01-01T00:00:00.000Z', nullable: true }) createdAt: string | null;
    @ApiProperty({ type: UserStatsDto }) stats: UserStatsDto;
    @ApiProperty({ type: [UserAchievementDto] }) achievements: UserAchievementDto[];
}

export class AvatarResponseDto {
    @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg' })
    avatarUrl: string;
}

export class UserSearchDto {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 'johndoe' }) username: string;
    @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg', nullable: true }) avatarUrl:
        string | null;
    @ApiProperty({ example: 'ONLINE' }) status: string;
}
