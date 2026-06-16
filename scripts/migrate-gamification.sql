CREATE TABLE IF NOT EXISTS "xp_transactions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "xp_transactions_userId_idx" ON "xp_transactions"("userId");
CREATE INDEX IF NOT EXISTS "xp_transactions_createdAt_idx" ON "xp_transactions"("createdAt");

CREATE TABLE IF NOT EXISTS "user_levels" (
  "userId" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 1,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_levels_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "streaks" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastActivityDate" DATE,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "streaks_userId_idx" ON "streaks"("userId");

CREATE TABLE IF NOT EXISTS "badges" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "xpRequired" INTEGER,
  "category" TEXT NOT NULL DEFAULT 'milestone',
  CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_badges" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_badges_userId_badgeId_key" UNIQUE ("userId", "badgeId")
);

CREATE INDEX IF NOT EXISTS "user_badges_userId_idx" ON "user_badges"("userId");

INSERT INTO "badges" ("id", "name", "description", "icon", "xpRequired", "category") VALUES
  ('badge_first_lesson', 'First Steps', 'Complete your first lesson', '🎯', NULL, 'milestone'),
  ('badge_ten_lessons', 'Dedicated Learner', 'Complete 10 lessons', '📚', NULL, 'milestone'),
  ('badge_fifty_lessons', 'Bookworm', 'Complete 50 lessons', '📖', NULL, 'milestone'),
  ('badge_hundred_lessons', 'Scholar', 'Complete 100 lessons', '🎓', NULL, 'milestone'),
  ('badge_first_course', 'Course Graduate', 'Complete your first course', '🏆', NULL, 'milestone'),
  ('badge_streak_3', 'Consistent', '3-day learning streak', '🔥', NULL, 'streak'),
  ('badge_streak_7', 'Committed', '7-day learning streak', '🔥', NULL, 'streak'),
  ('badge_streak_30', 'Unstoppable', '30-day learning streak', '💪', NULL, 'streak'),
  ('badge_streak_100', 'Legendary', '100-day learning streak', '👑', NULL, 'streak'),
  ('badge_quiz_master', 'Quiz Master', 'Score 100% on 5 quizzes', '🧠', NULL, 'achievement'),
  ('badge_fast_learner', 'Fast Learner', 'Complete a module in under 1 hour', '⚡', NULL, 'achievement'),
  ('badge_helper', 'Community Helper', 'Post 10 helpful comments', '💬', NULL, 'social'),
  ('badge_top_reviewer', 'Top Reviewer', 'Write 5 course reviews', '✍️', NULL, 'social')
ON CONFLICT ("id") DO NOTHING;
