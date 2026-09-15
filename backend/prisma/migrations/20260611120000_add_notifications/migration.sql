-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
    'CHAT_MESSAGE',
    'FRIEND_REQUEST',
    'FRIEND_ACCEPTED',
    'LOBBY_INVITE',
    'SYSTEM'
);

-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM (
    'MESSAGE',
    'FRIENDSHIP',
    'INVITE',
    'SYSTEM'
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "type" "NotificationType" NOT NULL,
    "sourceType" "NotificationSourceType",
    "sourceId" INTEGER,
    "title" TEXT,
    "content" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx"
ON "Notification"("recipientId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_recipientId_readAt_idx"
ON "Notification"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_recipientId_type_createdAt_idx"
ON "Notification"("recipientId", "type", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "notification_dedupe"
ON "Notification"("recipientId", "type", "sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
