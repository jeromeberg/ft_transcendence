import { ApiProperty } from '@nestjs/swagger';

class ChatUserDto {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 'johndoe' }) username: string;
    @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg', nullable: true }) avatarUrl:
        string | null;
}

export class MessageDto {
    @ApiProperty({ example: 1 }) id: number;
    @ApiProperty({ example: 1 }) senderId: number;
    @ApiProperty({ example: 2 }) receiverId: number;
    @ApiProperty({ example: 'Hello!' }) content: string;
    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' }) sentAt: string;
    @ApiProperty({ type: ChatUserDto }) sender: ChatUserDto;
    @ApiProperty({ type: ChatUserDto }) receiver: ChatUserDto;
}

export class ConversationDto {
    @ApiProperty({ type: ChatUserDto }) user: ChatUserDto;
    @ApiProperty({ example: 'Hello!' }) lastMessage: string;
    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' }) sentAt: string;
}
