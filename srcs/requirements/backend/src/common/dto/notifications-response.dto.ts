import { ApiProperty } from '@nestjs/swagger';

export class NotificationItemDto {
    @ApiProperty({ example: 42 })
    id: number;

    @ApiProperty({ example: 7 })
    recipientId: number;

    @ApiProperty({ example: 3, nullable: true })
    actorId: number | null;

    @ApiProperty({ example: 'FRIEND_REQUEST' })
    type: string;

    @ApiProperty({ example: 'FRIENDSHIP', nullable: true })
    sourceType: string | null;

    @ApiProperty({ example: 120, nullable: true })
    sourceId: number | null;

    @ApiProperty({ example: 'New friend request', nullable: true })
    title: string | null;

    @ApiProperty({ example: 'alice sent you a friend request', nullable: true })
    content: string | null;

    @ApiProperty({
        example: { username: 'alice', action: 'open_friend_request' },
        nullable: true,
        additionalProperties: true,
    })
    payload: Record<string, unknown> | null;

    @ApiProperty({ example: '2026-06-11T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-06-11T10:04:00.000Z', nullable: true })
    readAt: Date | null;
}

export class NotificationListResponseDto {
    @ApiProperty({ type: [NotificationItemDto] })
    data: NotificationItemDto[];

    @ApiProperty({ example: 120, nullable: true })
    nextCursor: number | null;
}

export class NotificationUnreadCountDto {
    @ApiProperty({ example: 5 })
    unreadCount: number;
}

export class NotificationMarkReadResponseDto {
    @ApiProperty({ example: 2 })
    updated: number;

    @ApiProperty({ example: 3 })
    unreadCount: number;
}
