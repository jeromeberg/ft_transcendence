import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessageDto, ConversationDto } from '../common/dto/chat-response.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { SafeUser } from '../common/types';

//API LIMIT
import { Throttle } from '@nestjs/throttler';
import {} from '../common/throttle.constants';
import { THROTTLE_LIMIT_AUTH_GLOBAL } from '../common/throttle.constants';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
    constructor(private chatservice: ChatService) {}

    @ApiOperation({ summary: 'Get all conversations (last message per user)' })
    @ApiResponse({ status: 200, type: [ConversationDto] })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('/')
    getHistoryChat(@CurrentUser() user: SafeUser) {
        return this.chatservice.getHistoryChat(user.id);
    }

    @ApiOperation({ summary: 'Get message history with a user (paginated)' })
    @ApiQuery({
        name: 'before',
        required: false,
        description: 'ID du dernier message connu pour paginer',
        example: 120,
    })
    @ApiResponse({ status: 200, type: [MessageDto] })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get(':username')
    getUserChatHistory(
        @Param('username') username: string,
        @CurrentUser() user: SafeUser,
        @Query('before') before?: string,
    ) {
        return this.chatservice.getUserChatHistory(
            user.id,
            username,
            before ? parseInt(before) : undefined,
        );
    }
}
