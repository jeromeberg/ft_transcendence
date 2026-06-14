import {
    Controller,
    Get,
    UseGuards,
    Param,
    Post,
    Query,
    Patch,
    Body,
    BadRequestException,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UpdateProfileDto, UpdateSettingsDto } from './dto'

//API LIMIT
import { Throttle } from '@nestjs/throttler';
import {
    THROTTLE_LIMIT_AUTH_GLOBAL,
    THROTTLE_LIMIT_UP_AVATAR,
    THROTTLE_LIMIT_SETTINGS
} from '../common/throttle.constants';

//AUTH
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/current-user.decorator';
import { SafeUser } from '../common/types';

//AVATAR
import { CloudinaryService } from '../cloudinary/cloudinary.service';

//SWAGGER
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserProfileDto, AvatarResponseDto, UserStatsDto, UserSearchDto } from '../common/dto/users-response.dto';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';

const MAX_PROFILES_REQUEST = 70;

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private UsersService: UsersService,
        private CloudinaryService: CloudinaryService,
    ) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my profile' })
    @ApiResponse({ status: 200, type: UserProfileDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: SafeUser) {
        return this.UsersService.getProfile(user.username, true);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update my bio' })
    @ApiResponse({ status: 200, schema: { example: { bio: 'Hello world' } } })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateProfile(@Body() dto:UpdateProfileDto, @CurrentUser() user: SafeUser){
        return this.UsersService.updateProfile(user.username, dto)
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update settings (email, password, language)' })
    @ApiResponse({ status: 200, schema: { example: { email: 'new@example.com', language: 'EN' } } })
    @ApiResponse({ status: 409, description: 'EMAIL_ALREADY_TAKEN' })
    @Throttle({ default: THROTTLE_LIMIT_SETTINGS })
    @UseGuards(JwtAuthGuard)
    @Patch('me/settings')
    updateSettings(@Body() dto:UpdateSettingsDto, @CurrentUser() user: SafeUser){
        return this.UsersService.updateSettings(user.username, dto)
    }

    @ApiOperation({ summary: 'Search users by username (paginated)' })
    @ApiQuery({ name: 'q', description: 'Search query', required: true })
    @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
    @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 10 })
    @ApiResponse({ status: 200, description: 'PaginatedResponse<UserSearchDto>' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get('search')
    searchUsers(
        @Query('q') q: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ): Promise<PaginatedResponse<UserSearchDto>> {
        if (!q?.trim())
            throw new BadRequestException('MISSING_SEARCH_QUERY');
        return this.UsersService.searchUsers(q.trim(), Number(page), Number(limit));
    }

    @ApiOperation({ summary: 'Get user profile by username' })
    @ApiResponse({ status: 200, type: UserProfileDto })
    @ApiResponse({ status: 404, description: 'USER_NOT_FOUND' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get(':username')
    getProfile(@Param('username') username: string) {
        return this.UsersService.getProfile(username, false);
    }

    @ApiOperation({ summary: 'Get user stats' })
    @ApiResponse({ status: 200, type: UserStatsDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get(':username/stats')
    getStats(@Param('username') username: string) {
        return this.UsersService.calculateStats(username);
    }

    @ApiOperation({ summary: 'Get multiple profiles by usernames' })
    @ApiQuery({ name: 'users', example: 'john,jane,bob' })
    @ApiResponse({ status: 200, type: [UserProfileDto] })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get()
    getProfiles(@Query('users') users: string) {
        if (!users)
            throw new BadRequestException('MISSING_USERS_PARAM');
        const usernameList = users.split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX_PROFILES_REQUEST);
        return this.UsersService.getProfiles(usernameList);
    }

    @ApiOperation({ summary: 'Get match history' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiResponse({ status: 200, schema: { example: { data: [{ wpm: 85, position: 1, accuracy: 96.5, nbPlayers: 3, nbBots: 1, finishedAt: '2026-01-01T00:00:00.000Z', match: { id: 1, startedAt: '2026-01-01T00:00:00.000Z', quote: { id: 10, text: 'The quick brown fox' }, matchResult: [{ position: 1, wpm: 85, kind: 'user', displayName: 'johndoe', avatarUrl: null, user: { id: 1, username: 'johndoe', avatarUrl: null } }, { position: 2, wpm: 60, kind: 'bot', displayName: 'Bot 3', avatarUrl: null, user: null }] } }], total: 1, totalPages: 1 } } })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get(':username/history')
    getHistory(
        @Param('username') username: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.UsersService.getHistory(username, parseInt(page), parseInt(limit));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload avatar' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } })
    @ApiResponse({ status: 201, type: AvatarResponseDto })
    @Throttle({ default: THROTTLE_LIMIT_UP_AVATAR })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
    @Post('me/avatar')
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: SafeUser) {
        const url = await this.CloudinaryService.uploadAvatar(file, user.avatarUrl ?? undefined);
        await this.UsersService.updateAvatar(user.username, url);
        return { avatarUrl: url };
    }
}