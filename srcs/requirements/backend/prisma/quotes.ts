import { PrismaClient } from '@prisma/client';

export const QUOTES = [
  "It's good to be in something from the ground floor. I came too late for that and I know. But lately, I'm getting the feeling that I came in at the end. The best is over.",
  "Let me tell ya something. Nowadays, everybody's gotta go to shrinks, and counselors, and go on \"Sally Jessy Raphael\" and talk about their problems. What happened to Gary Cooper? The strong, silent type. That was an American. He wasn't in touch with his feelings. He just did what he had to do. See, what they didn't know was once they got Gary Cooper in touch with his feelings that they wouldn't be able to shut him up! And then it's dysfunction this, and dysfunction that, and dysfunction vaffancul!",
  "This is gonna sound stupid, but I saw at one point that our mothers are... bus drivers. No, they are the bus. See, they're the vehicle that gets us here. They drop us off and go on their way. They continue on their journey. And the problem is that we keep tryin' to get back on the bus, instead of just lettin' it go.",
  "It ain't like that. See, the king stay the king, aight? Everything stay who he is. Except for the pawns. Now, if the pawn make it all the way down to the other dude's side, he get to be queen. And like I said, the queen ain't no bitch. She got all the moves.",
  "It ain't what you takin', it's who you takin' from, ya feel me? How you expect to run with the wolves come night when you spend all day sparring with the puppies?",
  "Prometheus Bound. An ancient play, one of the oldest we have. About a simple man who was horrifically punished by the powers that be for the terrible crime of trying to bring light to the common people. In the words of... Ascyllius: \"No good deed goes unpunished.\" I cannot tell you how much consolation I find in these slim pages.",
  "But man is a fickle and disreputable creature and perhaps, like a chess-player, is interested in the process of attaining his goal rather than the goal itself.",
  "He filled a shelf with a small army of books and read and read; but none of it made sense. They were all subject to various cramping limitations: those of the past were outdated, and those of the present were obsessed with the past.",
  "All the evil in man, one would think, should disappear on contact with Nature, the most spontaneous expression of beauty and goodness.",
  "I didn't tell Mama anything. I was just about to come up and wake you so that I could tell you.",
  "Sometimes you concentrate more on racing the cars around you, rather than focusing on what you need to do. Having said that, some drivers actually perform best when there is a little extra incentive - like chasing another car. But be careful you don't get too caught up in what the competition is doing. Focus on your own performance rather than on the competition.",
  "I always make offers with escape clauses. In real estate, I make an offer with language that details \"subject-to\" contingencies, such as the approval of a business partner. Never specify who the business partner is. Most people don't know that my partner is my cat.",
  "Always do your best - your best is going to change from moment to moment; it will be different when you are healthy as opposed to sick. Under any circumstance, simply do your best, and you will avoid self-judgment, self-abuse and regret.",
  "Now we drifted according to the breeze, our boat a small blimp in a vast blue universe of ocean. We had been at sea for four days and that gallon of water did not last long. We lay quietly, waiting for death or a miracle.",
  "What is going to happen to Kazi, Mama? He's the only one who looks at me with happy, loving eyes. No one else looks at me that way, not even Papa. When Papa looks at us, his eyes are always looking back inside his head at his own thoughts. He sees and he doesn't see.",
  "The sun during midday will light up the dark night. Night dreams of day. Light dreams of darkness. But the ignorant sun will chase away the darkness... and burn the shadows, eventually burning itself! The shade of the tree with the flowers that bloom at night is where the residents of darkness rest. The people of daytime are not allowed!",
];

export async function seedQuotes(prisma: PrismaClient): Promise<void> {
  await prisma.quote.createMany({
    data: QUOTES.map((text) => ({
      active: true,
      text,
    })),
  });
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedQuotes(prisma);
    console.log(`${QUOTES.length} quotes added.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
