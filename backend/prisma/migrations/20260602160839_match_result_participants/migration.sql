-- AlterTable
ALTER TABLE "MatchResult" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "userId" DROP NOT NULL;
