-- AlterTable
ALTER TABLE "MatchResult" ADD COLUMN     "accuracy" DOUBLE PRECISION,
ADD COLUMN     "nbBots" INTEGER,
ADD COLUMN     "nbPlayers" INTEGER;
