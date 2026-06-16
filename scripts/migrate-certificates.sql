CREATE TABLE IF NOT EXISTS "certificates" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "hash" TEXT NOT NULL,
  "metadata" JSONB,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "certificates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "certificates_userId_courseId_key" UNIQUE ("userId", "courseId")
);

CREATE INDEX IF NOT EXISTS "certificates_hash_idx" ON "certificates"("hash");
CREATE INDEX IF NOT EXISTS "certificates_userId_idx" ON "certificates"("userId");
CREATE INDEX IF NOT EXISTS "certificates_courseId_idx" ON "certificates"("courseId");
