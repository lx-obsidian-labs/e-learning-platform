"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export async function getCoupons() {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return []
  const admin = createAdminClient()
  const { data } = await admin.from("coupons").select("*").order('"createdAt"', { ascending: false })
  return data || []
}

export async function createCoupon(data: {
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  maxUses?: number
  minAmount?: number
  expiresAt?: string
}) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" }
  const admin = createAdminClient()
  const { error } = await admin.from("coupons").insert({
    id: randomUUID(),
    code: data.code.toUpperCase(),
    discountType: data.discountType,
    discountValue: data.discountValue,
    maxUses: data.maxUses || null,
    minAmount: data.minAmount || null,
    expiresAt: data.expiresAt || null,
    createdBy: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/coupons")
  return { success: true }
}

export async function validateCoupon(code: string) {
  const admin = createAdminClient()
  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq('"code"', code.toUpperCase())
    .eq('"active"', true)
    .maybeSingle()

  if (!coupon) return { valid: false, error: "Invalid coupon code" }
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return { valid: false, error: "Coupon has expired" }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "Coupon has expired" }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  }
}

export async function incrementCouponUsage(couponId: string) {
  const admin = createAdminClient()
  const { data: coupon } = await admin.from("coupons").select('"currentUses"').eq('"id"', couponId).single()
  if (coupon) {
    await admin.from("coupons").update({ currentUses: (coupon.currentUses || 0) + 1 }).eq('"id"', couponId)
  }
}

export async function deleteCoupon(couponId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" }
  const admin = createAdminClient()
  await admin.from("coupons").update({ active: false }).eq('"id"', couponId)
  revalidatePath("/admin/coupons")
  return { success: true }
}
