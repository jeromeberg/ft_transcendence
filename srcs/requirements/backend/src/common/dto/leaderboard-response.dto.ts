import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
    @ApiProperty({ example: 1 }) rank: number;
    @ApiProperty({ example: 'johndoe' }) username: string;
    @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg', nullable: true }) avatarUrl:
        string | null;
    @ApiProperty({ example: 'EN' }) language: string;
    @ApiProperty({ example: 120 }) avgWpm: number;
    @ApiProperty({ example: 42 }) gamesPlayed: number;
    @ApiProperty({ example: 15 }) level: number;
    @ApiProperty({ example: 92 }) avgAccuracy: number;
}
