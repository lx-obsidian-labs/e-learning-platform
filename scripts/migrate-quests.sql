CREATE TABLE IF NOT EXISTS "quests" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "xpReward" INTEGER NOT NULL DEFAULT 50,
  "icon" TEXT NOT NULL DEFAULT '🎯',
  "requirementType" TEXT NOT NULL,
  "requirementCount" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_quests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "questId" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "claimed" BOOLEAN NOT NULL DEFAULT false,
  "date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_quests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_quests_userId_questId_date_key" UNIQUE ("userId", "questId", "date")
);

CREATE INDEX IF NOT EXISTS "user_quests_userId_date_idx" ON "user_quests"("userId", "date");

-- Seed daily quest pool
INSERT INTO "quests" ("id", "title", "description", "xpReward", "icon", "requirementType", "requirementCount") VALUES
  ('quest_lessons_3', 'Triple Lesson Day', 'Complete 3 lessons today', 75, '📚', 'lessons', 3),
  ('quest_lessons_5', 'Learning Marathon', 'Complete 5 lessons today', 150, '🏃', 'lessons', 5),
  ('quest_quiz_perfect', 'Perfect Score', 'Get 100% on any quiz', 100, '🧠', 'quiz_perfect', 1),
  ('quest_review_3', 'Review Master', 'Complete 3 review sessions', 100, '🔄', 'reviews', 3),
  ('quest_streak_maintain', 'Streak Keeper', 'Log in and complete any activity', 25, '🔥', 'streak', 1),
  ('quest_discussion', 'Community Voice', 'Post a discussion comment', 50, '💬', 'discussion', 1),
  ('quest_course_progress', 'Course Crusher', 'Make progress on any course (20%)', 80, '📖', 'course_progress', 20)
ON CONFLICT ("id") DO NOTHING;
