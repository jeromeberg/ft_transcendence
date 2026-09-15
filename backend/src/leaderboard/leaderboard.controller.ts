import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_LIMIT_AUTH_GLOBAL } from '../common/throttle.constants';
import {
    LeaderBoardService,
    LEADERBOARD_DEFAULT_LIMIT,
    LEADERBOARD_MAX_LIMIT,
} from './leaderboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeaderboardEntryDto } from '../common/dto/leaderboard-response.dto';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderBoardController {
    constructor(private leaderBoardService: LeaderBoardService) {}

    @ApiOperation({ summary: 'Get leaderboard (with pagination)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiQuery({ name: 'q', required: false, description: 'Filter by username' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
    @ApiQuery({ name: 'minLevel', required: false, example: 1 })
    @ApiResponse({ status: 200, type: PaginatedResponse })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @Get()
    getLeaderboard(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('q') q?: string,
        @Query('sortOrder') sortOrder?: string,
        @Query('minLevel') minLevel?: string,
    ): Promise<PaginatedResponse<LeaderboardEntryDto>> {
        const parsedPage = Math.max(1, parseInt(page) || 1);
        const parsedLimit = Math.min(
            parseInt(limit) || LEADERBOARD_DEFAULT_LIMIT,
            LEADERBOARD_MAX_LIMIT,
        );
        const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
        const parseMinLevel = Math.max(1, parseInt(minLevel ?? '1') || 1);
        return this.leaderBoardService.getLeaderboard(
            parsedPage,
            parsedLimit,
            q,
            safeSortOrder,
            parseMinLevel,
        );
    }
}
