CREATE TABLE IF NOT EXISTS "review_items" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "easiness" REAL NOT NULL DEFAULT 2.5,
  "interval" INTEGER NOT NULL DEFAULT 0,
  "repetitions" INTEGER NOT NULL DEFAULT 0,
  "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastReviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "review_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "review_items_userId_lessonId_key" UNIQUE ("userId", "lessonId")
);

CREATE INDEX IF NOT EXISTS "review_items_nextReviewAt_idx" ON "review_items"("nextReviewAt");
CREATE INDEX IF NOT EXISTS "review_items_userId_idx" ON "review_items"("userId");

CREATE TABLE IF NOT EXISTS "review_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "review_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "review_sessions_userId_idx" ON "review_sessions"("userId");
