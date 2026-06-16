-- ============================================================
-- Migration: Coupon Code System
-- Run this against your Supabase database to add coupon support
-- ============================================================

CREATE TABLE IF NOT EXISTS "coupons" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountType" TEXT NOT NULL DEFAULT 'percentage',
  "discountValue" DECIMAL(10,2) NOT NULL,
  "maxUses" INTEGER,
  "currentUses" INTEGER NOT NULL DEFAULT 0,
  "minAmount" DECIMAL(10,2),
  "expiresAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT NOT NULL,
  CONSTRAINT "coupons_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "coupons_code_key" UNIQUE ("code")
);

CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons"("code");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coupons_createdBy_fkey') THEN
    ALTER TABLE "coupons" ADD CONSTRAINT "coupons_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
