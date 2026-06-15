-- Create table to store transient AI chat sessions
CREATE TABLE IF NOT EXISTS "ai_chats" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT,
  "messages" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_chats_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ai_chats_userId_idx" ON "ai_chats"("userId");
CREATE INDEX IF NOT EXISTS "ai_chats_createdAt_idx" ON "ai_chats"("createdAt");
