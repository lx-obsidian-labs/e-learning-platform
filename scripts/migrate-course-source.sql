-- Add source attribution columns to courses table
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;

CREATE INDEX IF NOT EXISTS "courses_source_idx" ON "courses"("source");
