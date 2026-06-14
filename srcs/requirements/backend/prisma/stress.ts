import { PrismaClient, Language, UserStatus, FriendshipStatus, MatchStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const CORE_COUNT = 48;
const PASSWORD   = 'Password123!';

const prisma = new PrismaClient();

const PHRASES = [
  'gg', 'bien joué !', 'rematch ?', 'tu types vite toi',
  'lol j\'ai raté', 'encore une partie ?', 'gg wp', 'top 1 ez',
  'comment tu fais pour aller aussi vite', 'practice makes perfect',
  'je suis chaud', 'trop fort', 'la prochaine fois c\'est moi',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 3600 * 1000);
}

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const userDefs = [
    ...Array.from({ length: CORE_COUNT }, (_, i) => ({
      username: `stress_user${String(i + 1).padStart(2, '0')}`,
      email:    `stress_user${String(i + 1).padStart(2, '0')}@stress.test`,
    })),
    { username: 'pending_sender',   email: 'pending_sender@stress.test'   },
    { username: 'pending_receiver', email: 'pending_receiver@stress.test' },
  ];

  const users = await Promise.all(
    userDefs.map((u, i) =>
      prisma.user.upsert({
        where:  { username: u.username },
        update: {},
        create: {
          username:     u.username,
          email:        u.email,
          passwordHash: hash,
          avatarUrl:    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}`,
          language:     Language.EN,
          status:       UserStatus.OFFLINE,
          bio:          `Stress test user #${i + 1}`,
        },
      }),
    ),
  );

  const core    = users.slice(0, CORE_COUNT);
  const sender  = users[CORE_COUNT];
  const receiver = users[CORE_COUNT + 1];

  const seededQuotes = await prisma.quote.findMany({
    where: { active: true },
    select: { id: true },
  });
  const quoteIds = seededQuotes.map((q) => q.id);

  if (quoteIds.length === 0) {
    throw new Error('No quotes available. Run `npm run quotes` first.');
  }

  const friendships: { initiatorId: number; receiverId: number; status: FriendshipStatus }[] = [];

  for (let i = 0; i < core.length; i++) {
    for (let j = i + 1; j < core.length; j++) {
      friendships.push({ initiatorId: core[i].id, receiverId: core[j].id, status: FriendshipStatus.ACCEPTED });
    }
  }

  for (const u of core) {
    friendships.push({ initiatorId: sender.id, receiverId: u.id, status: FriendshipStatus.PENDING });
  }
  friendships.push({ initiatorId: sender.id, receiverId: receiver.id, status: FriendshipStatus.PENDING });
  for (const u of core) {
    friendships.push({ initiatorId: u.id, receiverId: receiver.id, status: FriendshipStatus.PENDING });
  }

  await prisma.friendship.createMany({ data: friendships, skipDuplicates: true });
  for (let i = 0; i < 50; i++) {
    const startedAt  = daysAgo(Math.random() * 30);
    const endedAt    = new Date(startedAt.getTime() + (60 + Math.random() * 240) * 1000);
    const playerCount = 2 + Math.floor(Math.random() * Math.min(5, core.length - 2));
    const players    = [...core].sort(() => Math.random() - 0.5).slice(0, playerCount);

    const match = await prisma.match.create({
      data: { quoteId: pick(quoteIds), startedAt, endedAt, status: MatchStatus.FINISHED },
    });

    const results = players
      .map(u => ({
        matchId:    match.id,
        userId:     u.id,
        wpm:        parseFloat((30 + Math.random() * 120).toFixed(2)),
        position:   0,
        nbPlayers:  playerCount,
        nbBots:     0,
        accuracy:   parseFloat((75 + Math.random() * 25).toFixed(2)),
        finishedAt: endedAt,
      }))
      .sort((a, b) => b.wpm - a.wpm)
      .map((r, idx) => ({ ...r, position: idx + 1 }));

    await prisma.matchResult.createMany({ data: results, skipDuplicates: true });
  }
  const messages: { senderId: number; receiverId: number; content: string; sentAt: Date }[] = [];

  const hub = core[0];
  for (const other of core.slice(1)) {
    const count = 15 + Math.floor(Math.random() * 20);
    for (let k = 0; k < count; k++) {
      const fromHub = k % 2 === 0;
      messages.push({
        senderId:   fromHub ? hub.id : other.id,
        receiverId: fromHub ? other.id : hub.id,
        content:    pick(PHRASES),
        sentAt:     new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000),
      });
    }
  }

  await prisma.message.createMany({ data: messages, skipDuplicates: true });

  console.log('');
  console.log('Stress seed done');
  console.log(`  ${CORE_COUNT} core users — all mutual friends — username: stress_user01..${String(CORE_COUNT).padStart(2, '0')}`);
  console.log(`  pending_sender   — 49 PENDING sent`);
  console.log(`  pending_receiver — 49 PENDING received`);
  console.log(`  50 matches seeded`);
  console.log(`  ${messages.length} chat messages on stress_user01`);
  console.log(`  Password (all accounts): ${PASSWORD}`);
  console.log('');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
