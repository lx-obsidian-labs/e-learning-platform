-- ============================================================
-- Migration: Stripe Subscriptions Support
-- Run this against your Supabase database to add Stripe support
-- ============================================================

-- 1. Stripe subscriptions tracking table
CREATE TABLE IF NOT EXISTS "stripe_subscriptions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT NOT NULL,
  "stripeCustomerId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "stripe_subscriptions_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId")
);

CREATE INDEX IF NOT EXISTS "stripe_subscriptions_userId_idx" ON "stripe_subscriptions"("userId");

-- 2. Add Stripe fields to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "affiliateId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(10,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS "orders_stripeSessionId_idx" ON "orders"("stripeSessionId");

-- 3. Foreign keys
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stripe_subscriptions_userId_fkey') THEN
    ALTER TABLE "stripe_subscriptions" ADD CONSTRAINT "stripe_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stripe_subscriptions_planId_fkey') THEN
    ALTER TABLE "stripe_subscriptions" ADD CONSTRAINT "stripe_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "pricing_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
