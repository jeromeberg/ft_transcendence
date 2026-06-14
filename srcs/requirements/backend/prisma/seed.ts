import { PrismaClient, Language, UserStatus, FriendshipStatus, MatchStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { ACHIEVEMENTS } from '../src/common/achievements.constants';

const SEED_USERS       = 999;
const SEED_MATCHES     = 40;
const SEED_FRIENDSHIPS = 30;
const DEFAULT_PASSWORD = 'Password123!';

const prisma = new PrismaClient();

function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  faker.seed(42);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const languages    = Object.values(Language);
  const statuses     = Object.values(UserStatus);

  const achievements = await Promise.all(
    ACHIEVEMENTS.map(a =>
      prisma.achievement.upsert({
        where:  { key: a.key },
        update: {},
        create: { ...a },
      }),
    ),
  );

  const DEFAULT_USERS = [
    { username: 'akhmed', email: 'akhmed@example.com' },
    { username: 'kevin', email: 'kevin@example.com' },
    { username: 'axel', email: 'axel@example.com' },
    { username: 'jerome', email: 'jerome@example.com' },
    { username: 'timothee', email: 'timothee@example.com' },
  ];

  const defaultUsers = await Promise.all(
    DEFAULT_USERS.map((u, i) =>
      prisma.user.upsert({
        where:  { username: u.username },
        update: {},
        create: {
          username:     u.username,
          email:        u.email,
          role:         "MOD",
          bio:          faker.lorem.sentence(),
          passwordHash,
          avatarUrl:    `https://api.dicebear.com/7.x/pixel-art/svg?seed=default${i + 1}`,
          language:     Language.EN,
          status:       UserStatus.OFFLINE,
        },
      }),
    ),
  );

  const usernames = new Set<string>(DEFAULT_USERS.map(u => u.username));
  const usersData: { username: string; email: string }[] = [];
  while (usersData.length < SEED_USERS) {
    const username = faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20);
    if (usernames.has(username)) continue;
    usernames.add(username);
    usersData.push({ username, email: faker.internet.email().toLowerCase() });
  }

  const randomUsers = await Promise.all(
    usersData.map((u, i) =>
      prisma.user.upsert({
        where:  { username: u.username },
        update: {},
        create: {
          username:     u.username,
          email:        u.email,
          bio:          faker.lorem.sentence(),
          passwordHash,
          avatarUrl:    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 1}`,
          language:     randFrom(languages),
          status:       UserStatus.OFFLINE,
        },
      }),
    ),
  );

  const users = [...defaultUsers, ...randomUsers];

  const seededQuotes = await prisma.quote.findMany({
    where: { active: true },
    select: { id: true },
  });
  const quoteIds = seededQuotes.map((q) => q.id);

  if (quoteIds.length === 0) {
    throw new Error('No quotes available. Run `npm run quotes` first.');
  }

  const friendshipPairs = new Set<string>();
  let attempts = 0;
  while (friendshipPairs.size < SEED_FRIENDSHIPS && attempts < SEED_FRIENDSHIPS * 5) {
    attempts++;
    const a = randFrom(users);
    const b = randFrom(users);
    if (a.id === b.id) continue;
    const key = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
    if (friendshipPairs.has(key)) continue;
    friendshipPairs.add(key);
    await prisma.friendship.upsert({
      where:  { initiatorId_receiverId: { initiatorId: a.id, receiverId: b.id } },
      update: {},
      create: {
        initiatorId: a.id,
        receiverId:  b.id,
        status:      randFrom([FriendshipStatus.ACCEPTED, FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING]),
        createdAt:   daysAgo(faker.number.int({ min: 1, max: 30 })),
      },
    });
  }

  for (let i = 0; i < SEED_MATCHES; i++) {
    const startedAt = daysAgo(faker.number.int({ min: 0, max: 30 }));
    const endedAt   = new Date(startedAt.getTime() + faker.number.int({ min: 30, max: 300 }) * 1000);

    const match = await prisma.match.create({
      data: {
        quoteId: randFrom(quoteIds),
        startedAt,
        endedAt,
        status: MatchStatus.FINISHED,
      },
    });

    const playerCount = faker.number.int({ min: 2, max: Math.min(4, users.length) });
    const players = [...users].sort(() => Math.random() - 0.5).slice(0, playerCount);

    const results = players
      .map(user => ({
        matchId:    match.id,
        userId:     user.id,
        wpm:        parseFloat(faker.number.float({ min: 30, max: 150, fractionDigits: 2 }).toFixed(2)),
        position:   0,
        nbPlayers:  playerCount,
        nbBots:     0,
        accuracy:   parseFloat(faker.number.float({ min: 75, max: 100, fractionDigits: 2 }).toFixed(2)),
        finishedAt: endedAt,
      }))
      .sort((a, b) => b.wpm - a.wpm)
      .map((r, idx) => ({ ...r, position: idx + 1 }));

    await prisma.matchResult.createMany({ data: results, skipDuplicates: true });
  }

  for (const user of users) {
    const count    = faker.number.int({ min: 0, max: 3 });
    const selected = [...achievements].sort(() => Math.random() - 0.5).slice(0, count);
    for (const achievement of selected) {
      await prisma.userAchievement.upsert({
        where:  { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
        update: {},
        create: {
          userId:        user.id,
          achievementId: achievement.id,
          unlockedAt:    daysAgo(faker.number.int({ min: 0, max: 30 })),
        },
      });
    }
  }

  console.log(`Seeded: ${SEED_USERS} users, ${SEED_MATCHES} matches, ${friendshipPairs.size} friendships`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
