import {
    Controller,
    Get,
    UseGuards,
    Param,
    Post,
    Patch,
    Body,
    Delete,
    HttpCode,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiExcludeEndpoint,
} from '@nestjs/swagger';
import {
    FriendUserDto,
    FriendRequestDto,
    RelationshipResponseDto,
    FriendMessageResponseDto,
} from '../common/dto/friends-response.dto';

//API LIMIT
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_LIMIT_AUTH_GLOBAL } from '../common/throttle.constants';

//AUTH
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

//DTO
import { CreateFriendRequestDto } from './dto';

import { CurrentUser } from '../common/current-user.decorator';
import { SafeUser } from '../common/types';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
    constructor(private FriendsService: FriendsService) {}

    @ApiOperation({ summary: 'Get my friends list' })
    @ApiResponse({ status: 200, type: [FriendUserDto] })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/')
    getMyFriends(@CurrentUser() user: SafeUser) {
        return this.FriendsService.getMyFriends(user);
    }

    @ApiOperation({ summary: 'Get received friend requests' })
    @ApiResponse({ status: 200, type: [FriendRequestDto] })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/requests')
    getFriendRequests(@CurrentUser() user: SafeUser) {
        return this.FriendsService.getFriendRequests(user);
    }

    @ApiOperation({ summary: 'Get sent friend requests' })
    @ApiResponse({ status: 200, type: [FriendRequestDto] })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/requests/sent')
    getFriendRequestsSent(@CurrentUser() user: SafeUser) {
        return this.FriendsService.getFriendRequestsSent(user);
    }

    @ApiExcludeEndpoint()
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/blocked')
    getBlocked(@CurrentUser() user: SafeUser) {
        return this.FriendsService.getBlocked(user);
    }

    @ApiOperation({ summary: 'Get relationship with a user' })
    @ApiResponse({ status: 200, type: RelationshipResponseDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get(':username/relationship')
    getFriendRelationship(@Param('username') username: string, @CurrentUser() user: SafeUser) {
        return this.FriendsService.getFriendRelationship(user, username);
    }

    @ApiOperation({ summary: 'Get friends list by username' })
    @ApiResponse({ status: 200, type: [FriendUserDto] })
    @ApiResponse({ status: 404, description: 'USER_NOT_FOUND' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get(':username')
    getFriendsByUsername(@Param('username') username: string) {
        return this.FriendsService.getFriendsByUsername(username);
    }

    @ApiOperation({ summary: 'Send a friend request' })
    @ApiResponse({
        status: 200,
        schema: { example: { initiatorId: 1, receiverId: 2, status: 'PENDING' } },
    })
    @ApiResponse({ status: 409, description: 'REQUEST_ALREADY_SENT | ALREADY_FRIENDS | BLOCKED' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Post('request')
    @HttpCode(200)
    friendRequest(@Body() dto: CreateFriendRequestDto, @CurrentUser() user: SafeUser) {
        return this.FriendsService.friendRequest(user, dto);
    }

    @ApiOperation({ summary: 'Accept a friend request' })
    @ApiResponse({ status: 200, type: FriendMessageResponseDto })
    @ApiResponse({ status: 403, description: 'NOT_YOUR_REQUEST' })
    @ApiResponse({ status: 404, description: 'REQUEST_NOT_FOUND' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Patch('request/:username/accept')
    friendAccept(@Param('username') username: string, @CurrentUser() user: SafeUser) {
        return this.FriendsService.friendAccept(user, username);
    }

    @ApiOperation({ summary: 'Decline a friend request' })
    @ApiResponse({ status: 200, type: FriendMessageResponseDto })
    @ApiResponse({ status: 403, description: 'NOT_YOUR_REQUEST' })
    @ApiResponse({ status: 404, description: 'REQUEST_NOT_FOUND' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Patch('request/:username/decline')
    friendDecline(@Param('username') username: string, @CurrentUser() user: SafeUser) {
        return this.FriendsService.friendDecline(user, username);
    }

    @ApiOperation({ summary: 'Remove a friend' })
    @ApiResponse({ status: 200, type: FriendMessageResponseDto })
    @ApiResponse({ status: 404, description: 'REQUEST_NOT_FOUND' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Delete(':username')
    deleteFriend(@Param('username') username: string, @CurrentUser() user: SafeUser) {
        return this.FriendsService.deleteFriend(user, username);
    }

    @ApiExcludeEndpoint()
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Post(':username/block')
    friendBlock(@Param('username') username: string, @CurrentUser() user: SafeUser) {
        return this.FriendsService.friendBlock(user, username);
    }

    @ApiExcludeEndpoint()
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Delete(':username/unblock')
    friendUnblock(@Param('username') username: string, @CurrentUser() user: SafeUser) {
        return this.FriendsService.friendUnblock(user, username);
    }
}
