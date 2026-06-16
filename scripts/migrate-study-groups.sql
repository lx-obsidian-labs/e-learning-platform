CREATE TABLE IF NOT EXISTS "study_groups" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "courseId" TEXT,
  "createdBy" TEXT NOT NULL,
  "maxMembers" INTEGER NOT NULL DEFAULT 10,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "study_groups_createdAt_idx" ON "study_groups"("createdAt");

CREATE TABLE IF NOT EXISTS "group_members" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "group_members_groupId_userId_key" UNIQUE ("groupId", "userId")
);

CREATE INDEX IF NOT EXISTS "group_members_groupId_idx" ON "group_members"("groupId");
CREATE INDEX IF NOT EXISTS "group_members_userId_idx" ON "group_members"("userId");

CREATE TABLE IF NOT EXISTS "group_activities" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "group_activities_groupId_idx" ON "group_activities"("groupId");
