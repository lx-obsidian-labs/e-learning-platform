-- ============================================================
-- Migration: Affiliate/Referral System
-- Run this against your Supabase database to add affiliate support
-- ============================================================

CREATE TABLE IF NOT EXISTS "affiliates" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "referralCode" TEXT NOT NULL,
  "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalWithdrawn" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "affiliates_userId_key" UNIQUE ("userId"),
  CONSTRAINT "affiliates_referralCode_key" UNIQUE ("referralCode")
);

CREATE TABLE IF NOT EXISTS "affiliate_referrals" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "referredUserId" TEXT,
  "orderId" TEXT,
  "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliate_referrals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "affiliate_referrals_affiliateId_idx" ON "affiliate_referrals"("affiliateId");
CREATE INDEX IF NOT EXISTS "affiliate_referrals_orderId_idx" ON "affiliate_referrals"("orderId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliates_userId_fkey') THEN
    ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_referrals_affiliateId_fkey') THEN
    ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_referrals_referredUserId_fkey') THEN
    ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_referrals_orderId_fkey') THEN
    ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
