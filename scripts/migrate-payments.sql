-- ============================================================
-- Migration: Add EFT Payment Support
-- Run this against your Supabase database to add EFT support
-- ============================================================

-- 1. Add EFT fields to existing orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'EFT';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'ZAR';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "planId" TEXT;
ALTER TABLE "orders" ALTER COLUMN "courseId" DROP NOT NULL;

-- 2. Unique index on reference for payment matching
CREATE UNIQUE INDEX IF NOT EXISTS "orders_reference_key" ON "orders"("reference");
CREATE INDEX IF NOT EXISTS "orders_paymentMethod_idx" ON "orders"("paymentMethod");

-- 3. Pricing plans table
CREATE TABLE IF NOT EXISTS "pricing_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "interval" TEXT,
    "features" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- 4. Payment proofs table
CREATE TABLE IF NOT EXISTS "payment_proofs" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "orderId" TEXT NOT NULL,
    "verifiedBy" TEXT,
    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id")
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS "payment_proofs_orderId_idx" ON "payment_proofs"("orderId");

-- 6. Foreign keys
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_planId_fkey') THEN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_planId_fkey" FOREIGN KEY ("planId") REFERENCES "pricing_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_proofs_orderId_fkey') THEN
    ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_proofs_verifiedBy_fkey') THEN
    ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
