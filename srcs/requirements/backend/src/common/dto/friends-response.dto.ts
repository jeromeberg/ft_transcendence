import { ApiProperty } from '@nestjs/swagger';

export class FriendUserDto {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 'johndoe' }) username: string;
    @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg', nullable: true }) avatarUrl:
        string | null;
    @ApiProperty({ example: 'ONLINE' }) status: string;
}

export class FriendRequestDto extends FriendUserDto {
    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' }) requestedAt: string;
}

export class RelationshipResponseDto {
    @ApiProperty({
        example: 'NONE',
        enum: ['NONE', 'PENDING_SENT', 'PENDING_RECEIVED', 'ACCEPTED'],
    })
    relationship: string;
}

export class FriendMessageResponseDto {
    @ApiProperty({ example: 'ACCEPTED' }) message: string;
}
