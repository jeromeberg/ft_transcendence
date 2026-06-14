import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto, UpdateSettingsDto } from './dto'
import { AchievementService } from '../achievement/achievement.service';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { UserSearchDto } from '../common/dto/users-response.dto';

const SEARCH_DEFAULT_LIMIT = 10;
const SEARCH_MAX_LIMIT = 50;

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AchievementService))
    private achievementService: AchievementService,
  ) {}

  private async HashThePass(password? : string) {
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    return passwordHash;
  }

  async create(username: string, email: string, password?: string) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists)
      throw new ConflictException('USER_ALREADY_EXISTS');

    const passwordHash = await this.HashThePass(password);
    return this.prisma.$transaction(async (tx) => {
      const usersCount = await tx.user.count();
      return tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          role: usersCount === 0 ? Role.MOD : Role.USER,
        },
        select: {
          id: true, username: true, email: true,
          avatarUrl: true, bio: true, language: true,
          status: true, createdAt: true, updatedAt: true,
        },
      });
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true, username: true, email: true,
        avatarUrl: true, bio: true,
        language: true, status: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true,
        role: true,
        avatarUrl: true, bio: true, language: true,
        status: true, createdAt: true, updatedAt: true,
        passwordHash: true,
        oauthAccounts: { select: { provider: true } },
      },
    });
    if (!user)
      return null;
    const { passwordHash, oauthAccounts, ...rest } = user;
    return {
      ...rest,
      hasPassword: passwordHash !== null,
      isOAuthOnly: oauthAccounts.length > 0 && passwordHash === null,
    };
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, email: true,
        avatarUrl: true, bio: true, language: true,
        status: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async findByEmailForLogin(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true, username: true, email: true,
        role: true,
        passwordHash: true, avatarUrl: true, bio: true,
        language: true, status: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async findByUsernameForLogin(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, email: true,
        role: true,
        passwordHash: true, avatarUrl: true, bio: true, language: true,
        status: true, createdAt: true, updatedAt: true,
      },
    });
  }

  async calculateStats(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user)
      throw new NotFoundException('USER_NOT_FOUND');

    const results = await this.prisma.matchResult.findMany({
      where: { userId: user.id, wpm: { not: null } },
      select: { wpm: true },
    });

    const gamesPlayed = results.length;
    const totalWpm    = results.reduce((sum: number, r) => sum + (r.wpm ?? 0), 0);
    const avgWpm      = gamesPlayed > 0 ? Math.round(totalWpm / gamesPlayed) : 0;
    const level       = Math.floor(gamesPlayed / 3) + 1;

    const usersWithHigherWpm = await this.prisma.matchResult.groupBy({
      by: ['userId'],
      where: { userId: { not: null } },
      _avg: { wpm: true },
      having: { wpm: { _avg: { gt: avgWpm } } },
    });
    const rank = usersWithHigherWpm.length + 1;

    return { rank, avgWpm, level, gamesPlayed };
  }


  async getProfile(username: string, isOwner = false) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, avatarUrl: true,
        bio: true, status: true, createdAt: true,
        email : isOwner, language : true
      },
    });
    if (!user)
      throw new NotFoundException('USER_NOT_FOUND');

    const stats = await this.calculateStats(username);
    const achievements = await this.achievementService.getUserAchievements(username);

    return { ...user, stats, achievements };
  }

  async getProfiles(usernames: string[]) {
    return this.prisma.user.findMany({
      where: { username: { in: usernames } },
      select: {
        id: true, username: true, avatarUrl: true,
        bio: true, status: true, language: true,
        email: false, createdAt: false,
      },
    });
  }

  async getHistory(username: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user)
      throw new NotFoundException('USER_NOT_FOUND');

    const where = { userId: user.id };
    const total = await this.prisma.matchResult.count({ where });
    const data  = await this.prisma.matchResult.findMany({
      where,
      select: {
        wpm: true, position: true, accuracy: true, finishedAt: true, nbPlayers: true, nbBots: true,
        match: {
          select: {
            id: true,
            startedAt: true,
            quote: {
              select: {
                id: true,
                text: true,
              },
            },
            matchResult: {
              select: {
                position: true,
                wpm: true,
                kind: true,
                displayName: true,
                avatarUrl: true,
                user: {
                  select: { id: true, username: true, avatarUrl: true }
                },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
      orderBy: { finishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, totalPages: Math.ceil(total / limit) };
  }

  async updateAvatar(username: string, avatarUrl: string) {
    return this.prisma.user.update({
        where: { username },
        data: { avatarUrl },
        select: { avatarUrl: true },
    });
  }

  async updateProfile(username : string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { username },
      data: { bio:dto.bio },
      select: { bio:true }
    })
  }

  async searchUsers(query: string, page: number, limit: number): Promise<PaginatedResponse<UserSearchDto>> {
    const safeLimit = Math.min(limit, SEARCH_MAX_LIMIT);
    const offset = (page - 1) * safeLimit;
    const where: Prisma.UserWhereInput = {
      username: { contains: query, mode: Prisma.QueryMode.insensitive },
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, username: true, avatarUrl: true, status: true },
        skip: offset,
        take: safeLimit,
        orderBy: { username: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return { data, total, page, limit: safeLimit, totalPages, hasNext: page < totalPages };
  }

  async updateSettings(username : string, dto: UpdateSettingsDto) {
    if (dto.password) {
      const user = await this.prisma.user.findUnique({
        where: { username },
        select: { passwordHash: true },
      });
      if (user?.passwordHash) {
        if (!dto.currentPassword)
          throw new BadRequestException('CURRENT_PASSWORD_REQUIRED');
        const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!valid)
          throw new UnauthorizedException('INVALID_CURRENT_PASSWORD');
      }
    }

    const passHashed = await this.HashThePass(dto.password);
    try {
      return await this.prisma.user.update({
        where: { username },
        data: {
          email: dto.email,
          ...(dto.password && { passwordHash: passHashed }),
          language: dto.language,
        },
        select: { email: true, language: true },
      });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException('EMAIL_ALREADY_TAKEN');
      throw error;
    }
  }
}
