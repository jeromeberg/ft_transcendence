import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto, EditQuoteDto } from './dto';
import { SafeUser } from '../common/types';

@Injectable()
export class QuoteService {
  constructor(private prisma: PrismaService) {}

  async getAllQuotes() {
    return this.prisma.quote.findMany({
      where: { active: true },
      select: {
        id: true,
        text: true,
        type: true,
        active: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(dto: CreateQuoteDto, user: SafeUser) {
    return this.prisma.quote.create({
      data: {
        text: dto.text,
        type: dto.type || null,
        active: true,
        creatorId: user.id,
      },
      select: {
        id: true,
        text: true,
        type: true,
        active: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deactivateQuote(id: number) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('QUOTE_NOT_FOUND');
    }

    return this.prisma.quote.update({
      where: { id },
      data: { active: false },
      select: {
        id: true,
        text: true,
        type: true,
        active: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async editQuote(id: number, dto: EditQuoteDto) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('QUOTE_NOT_FOUND');
    }

    const updateData: any = {};
    if (dto.text !== undefined) {
      updateData.text = dto.text;
    }
    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }
    if (dto.active !== undefined) {
      updateData.active = dto.active;
    }

    return this.prisma.quote.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        text: true,
        type: true,
        active: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getRandomQuote(options?: { minLength?: number; maxLength?: number; type?: string }) {
    const where: any = { active: true };

    if (options?.type) {
      where.type = options.type;
    }

    const quotes = await this.prisma.quote.findMany({
      where,
      select: {
        id: true,
        text: true,
        type: true,
      },
    });

    if (quotes.length === 0) {
      throw new NotFoundException('NO_QUOTES_AVAILABLE');
    }

    // filter by length
    let filtered = quotes;
    if (options?.minLength || options?.maxLength) {
      filtered = quotes.filter((q: typeof quotes[0]) => {
        const len = q.text.length;
        const minOk = !options.minLength || len >= options.minLength;
        const maxOk = !options.maxLength || len <= options.maxLength;
        return minOk && maxOk;
      });
    }

    if (filtered.length === 0) {
      throw new NotFoundException('NO_QUOTES_MATCHING_CRITERIA');
    }

    // pick random quote
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
}
