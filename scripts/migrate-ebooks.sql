-- Ebooks table for cached/provided free reading materials
-- Data is fetched live from Project Gutenberg and Open Library APIs
-- This table can be used to cache frequently accessed ebooks locally

CREATE TABLE IF NOT EXISTS "ebooks" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "description" TEXT,
  "coverUrl" TEXT,
  "fileUrl" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'api',
  "category" TEXT,
  "pages" INTEGER,
  "isFree" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "readCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ebooks_category_idx" ON "ebooks" ("category");
CREATE INDEX IF NOT EXISTS "ebooks_featured_idx" ON "ebooks" ("featured") WHERE "featured" = true;
