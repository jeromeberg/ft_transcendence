import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MatchResult } from '@prisma/client';
import { ACHIEVEMENTS } from '../common/achievements.constants';

@Injectable()
export class AchievementService implements OnModuleInit {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => UsersService))
        private users: UsersService,
    ) {}

    async onModuleInit() {
        for (const a of ACHIEVEMENTS) {
            await this.prisma.achievement.upsert({
                where: { key: a.key },
                update: {},
                create: { ...a },
            });
        }
    }

    async checkAndUnlockAchievements(
        userId: number,
        matchResult: MatchResult,
    ): Promise<{
        newAchievements: { key: string; label: string; description: string; icon: string }[];
        newLevel: number | null;
    }> {
        const allResults = await this.prisma.matchResult.findMany({ where: { userId } });
        const wins = allResults.filter((r) => r.position === 1);
        const toUnlock: string[] = [];

        if (allResults.length === 1) {
            toUnlock.push('first_race');
        }
        if (allResults.length >= 10) {
            toUnlock.push('veteran_10');
        }
        if (allResults.length >= 50) {
            toUnlock.push('veteran_50');
        }

        if (wins.length === 1) {
            toUnlock.push('first_win');
        }
        if (wins.length >= 3) {
            toUnlock.push('podium_3');
        }

        const wpm = matchResult.wpm ?? 0;

        if (wpm >= 50) {
            toUnlock.push('speed_50');
        }
        if (wpm >= 80) {
            toUnlock.push('speed_80');
        }
        if (wpm >= 100) {
            toUnlock.push('speed_100');
        }
        if (wpm >= 150) {
            toUnlock.push('speed_150');
        }

        const newAchievements = await this.unlockAchievements(userId, toUnlock);

        const prevLevel = Math.floor((allResults.length - 1) / 3) + 1;
        const newLevel = Math.floor(allResults.length / 3) + 1;

        return {
            newAchievements,
            newLevel: newLevel > prevLevel ? newLevel : null,
        };
    }

    private async unlockAchievements(
        userId: number,
        keys: string[],
    ): Promise<{ key: string; label: string; description: string; icon: string }[]> {
        if (keys.length === 0) return [];

        const achievements = await this.prisma.achievement.findMany({
            where: { key: { in: keys } },
        });
        const existing = await this.prisma.userAchievement.findMany({
            where: { userId, achievementId: { in: achievements.map((a) => a.id) } },
        });
        const existingIds = new Set(existing.map((e) => e.achievementId));
        const toCreate = achievements.filter((a) => !existingIds.has(a.id));

        if (toCreate.length > 0) {
            await this.prisma.userAchievement.createMany({
                data: toCreate.map((a) => ({ userId, achievementId: a.id })),
                skipDuplicates: true,
            });
        }

        return toCreate.map((a) => ({
            key: a.key,
            label: a.label,
            description: a.description,
            icon: a.icon ?? '',
        }));
    }

    async getUserAchievements(username: string) {
        const user = await this.users.findByUsername(username);
        if (!user) return [];

        const [allAchievements, userAchievements] = await Promise.all([
            this.prisma.achievement.findMany(),
            this.prisma.userAchievement.findMany({ where: { userId: user.id } }),
        ]);

        const unlockedMap = new Map(
            userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]),
        );

        return allAchievements
            .map((achievement) => ({
                achievement,
                unlockedAt: unlockedMap.get(achievement.id) ?? null,
            }))
            .sort((a, b) => {
                if (a.unlockedAt && b.unlockedAt)
                    return b.unlockedAt.getTime() - a.unlockedAt.getTime();
                if (a.unlockedAt) return -1;
                if (b.unlockedAt) return 1;
                return 0;
            });
    }
}
