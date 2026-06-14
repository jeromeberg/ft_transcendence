import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuoteService } from './quote.service';
import { CreateQuoteDto, EditQuoteDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { SafeUser } from '../common/types';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_LIMIT_AUTH_GLOBAL } from '../common/throttle.constants';

@ApiTags('quotes')
@Controller('quotes')
export class QuoteController {
  constructor(private quoteService: QuoteService) {}

  @ApiOperation({ summary: 'Get all quotes' })
  @ApiResponse({ status: 200, description: 'List of all quotes' })
  @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
  @Get()
  getAllQuotes() {
    return this.quoteService.getAllQuotes();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quote' })
  @ApiResponse({ status: 201, description: 'Quote created' })
  @ApiResponse({ status: 403, description: 'Only mods can create quotes' })
  @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
  @UseGuards(JwtAuthGuard)
  @Post()
  createQuote(
    @Body() dto: CreateQuoteDto,
    @CurrentUser() user: SafeUser,
  ) {
    if (user.role !== 'MOD') {
      throw new ForbiddenException('Only mods can create quotes');
    }
    return this.quoteService.createQuote(dto, user);
  }

  @ApiOperation({ summary: 'Get a random quote' })
  @ApiResponse({ status: 200, description: 'Random quote' })
  @ApiResponse({ status: 404, description: 'No quotes' })
  @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
  @Get('random')
  getRandomQuote(
    @Query('minLength') minLength?: number,
    @Query('maxLength') maxLength?: number,
    @Query('type') type?: string,
  ) {
    return this.quoteService.getRandomQuote({
      minLength: minLength ? Number(minLength) : undefined,
      maxLength: maxLength ? Number(maxLength) : undefined,
      type,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a quote (text, type, active status)' })
  @ApiResponse({ status: 200, description: 'Quote updated' })
  @ApiResponse({ status: 403, description: 'Only mods can edit quotes' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  editQuote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditQuoteDto,
    @CurrentUser() user: SafeUser,
  ) {
    if (user.role !== 'MOD') {
      throw new ForbiddenException('Only mods can edit quotes');
    }
    return this.quoteService.editQuote(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a quote' })
  @ApiResponse({ status: 200, description: 'Quote deleted' })
  @ApiResponse({ status: 403, description: 'Only mods can delete quotes' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteQuote(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: SafeUser,
  ) {
    if (user.role !== 'MOD') {
      throw new ForbiddenException('Only mods can delete quotes');
    }
    return this.quoteService.deactivateQuote(id);
  }
}
