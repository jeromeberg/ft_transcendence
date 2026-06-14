/*
  Warnings:

  - You are about to drop the column `textSnippet` on the `Match` table. All the data in the column will be lost.
  - Added the required column `quoteId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MOD');

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "textSnippet",
ADD COLUMN     "quoteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL,
    "text" TEXT NOT NULL,
    "creatorId" INTEGER,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
