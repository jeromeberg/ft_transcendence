import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { LeaderboardEntryDto } from '../common/dto/leaderboard-response.dto';

export const LEADERBOARD_DEFAULT_LIMIT = 20;
export const LEADERBOARD_MAX_LIMIT = 100;

@Injectable()
export class LeaderBoardService {
    constructor(private prisma: PrismaService) {}

    // wrap LeaderboardEntry in PaginatedResponse to get the total nb of pages
    async getLeaderboard(
        page: number,
        limit: number,
        query?: string,
        sortOrder: 'asc' | 'desc' = 'desc',
        minLevel = 1,
    ): Promise<PaginatedResponse<LeaderboardEntryDto>> {
        const safeLimit = Math.min(limit, LEADERBOARD_MAX_LIMIT);
        const offset = (page - 1) * safeLimit;

        // When filtering by username, fetch matching userIds first
        let filteredUserIds: number[] | undefined;
        if (query?.trim()) {
            const matches = await this.prisma.user.findMany({
                where: { username: { contains: query.trim(), mode: 'insensitive' } },
                select: { id: true },
            });
            filteredUserIds = matches.map((u: { id: number }) => u.id);
            if (filteredUserIds.length === 0) {
                return {
                    data: [],
                    total: 0,
                    page,
                    limit: safeLimit,
                    totalPages: 0,
                    hasNext: false,
                };
            }
        }

        const groupByWhere = filteredUserIds
            ? { userId: { in: filteredUserIds } }
            : { userId: { not: null } };

        const [grouped, total] = await Promise.all([
            this.prisma.matchResult.groupBy({
                by: ['userId'],
                where: groupByWhere,
                _avg: { wpm: true, accuracy: true },
                _count: { id: true },
                having:
                    minLevel > 1
                        ? {
                              id: { _count: { gte: (minLevel - 1) * 3 } },
                          }
                        : undefined,
                orderBy: { _avg: { wpm: sortOrder } },
                skip: offset,
                take: safeLimit,
            }),
            this.prisma.matchResult
                .groupBy({
                    by: ['userId'],
                    where: groupByWhere,
                    _avg: { wpm: true, accuracy: true },
                })
                .then((results) => results.length),
        ]);

        const userIds = grouped
            .map((r: (typeof grouped)[number]) => r.userId)
            .filter((id): id is number => id !== null);
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, avatarUrl: true, language: true },
        });

        type UserRow = { id: number; username: string; avatarUrl: string | null; language: string };
        const userMap = new Map<number, UserRow>(users.map((u: UserRow) => [u.id, u]));

        const data = grouped.map((r: (typeof grouped)[number], i: number) => {
            const user = r.userId != null ? userMap.get(r.userId) : undefined;
            const gamesPlayed = (r as unknown as { _count: { id: number } })._count.id;
            const avgWpm = r._avg.wpm ? Math.round(r._avg.wpm) : 0;
            const avgAccuracy = r._avg.accuracy ? Math.round(r._avg.accuracy) : 0;
            const level = Math.floor(gamesPlayed / 3) + 1;

            return {
                rank: offset + i + 1,
                username: user?.username ?? 'unknown',
                avatarUrl: user?.avatarUrl ?? null,
                language: user?.language ?? 'EN',
                avgWpm,
                gamesPlayed,
                level,
                avgAccuracy,
            };
        });

        const totalPages = Math.ceil(total / safeLimit);

        return {
            data,
            total,
            page,
            limit: safeLimit,
            totalPages,
            hasNext: page < totalPages,
        };
    }
}
