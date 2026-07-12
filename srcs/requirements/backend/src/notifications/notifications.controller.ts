import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { SafeUser } from '../common/types';
import { THROTTLE_LIMIT_AUTH_GLOBAL } from '../common/throttle.constants';
import {
    NotificationListResponseDto,
    NotificationMarkReadResponseDto,
    NotificationUnreadCountDto,
} from '../common/dto/notifications-response.dto';
import { MarkNotificationsReadDto } from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) {}

    private toPositiveInt(value?: string): number | undefined {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
    }

    @ApiOperation({ summary: 'List notifications (cursor pagination)' })
    @ApiResponse({ status: 200, type: NotificationListResponseDto })
    @ApiQuery({ name: 'cursor', required: false, example: 120 })
    @ApiQuery({ name: 'take', required: false, example: 20 })
    @ApiQuery({ name: 'unreadOnly', required: false, example: 'false' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/')
    listNotifications(
        @CurrentUser() user: SafeUser,
        @Query('cursor') cursor?: string,
        @Query('take') take?: string,
        @Query('unreadOnly') unreadOnly?: string,
    ) {
        return this.notificationsService.listForUser(
            user.id,
            this.toPositiveInt(cursor),
            this.toPositiveInt(take),
            unreadOnly === 'true',
        );
    }

    @ApiOperation({ summary: 'Get unread notifications count' })
    @ApiResponse({ status: 200, type: NotificationUnreadCountDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/unread-count')
    async unreadCount(@CurrentUser() user: SafeUser) {
        return { unreadCount: await this.notificationsService.countUnread(user.id) };
    }

    @ApiOperation({ summary: 'Mark notifications as read' })
    @ApiResponse({ status: 200, type: NotificationMarkReadResponseDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Patch('/read')
    markAsRead(@CurrentUser() user: SafeUser, @Body() body: MarkNotificationsReadDto) {
        return this.notificationsService.markAsRead(user.id, body.ids);
    }

    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: 200, type: NotificationMarkReadResponseDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Patch('/read-all')
    markAllAsRead(@CurrentUser() user: SafeUser) {
        return this.notificationsService.markAllAsRead(user.id);
    }
}
