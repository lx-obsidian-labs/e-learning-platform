"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

function generateReferralCode(name: string): string {
  const prefix = (name || "user").slice(0, 4).toUpperCase()
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${suffix}`
}

export async function getOrCreateAffiliate() {
  const user = await getCurrentUserWithRole()
  if (!user) return null
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("affiliates")
    .select("*")
    .eq('"userId"', user.id)
    .maybeSingle()

  if (existing) return existing

  const code = generateReferralCode(user.name || "USER")
  const { data: newAffiliate, error } = await admin
    .from("affiliates")
    .insert({ id: randomUUID(), userId: user.id, referralCode: code })
    .select()
    .single()

  if (error) return null
  return newAffiliate
}

export async function getAffiliateStats() {
  const user = await getCurrentUserWithRole()
  if (!user) return null
  const admin = createAdminClient()

  const { data: affiliate } = await admin
    .from("affiliates")
    .select("*")
    .eq('"userId"', user.id)
    .maybeSingle()

  if (!affiliate) return null

  const { data: referrals } = await admin
    .from("affiliate_referrals")
    .select("*")
    .eq('"affiliateId"', affiliate.id)

  const totalReferrals = (referrals || []).length
  const pendingCommission = (referrals || [])
    .filter((r: any) => r.status === "pending")
    .reduce((sum: number, r: any) => sum + Number(r.commission), 0)
  const approvedCommission = (referrals || [])
    .filter((r: any) => r.status === "approved")
    .reduce((sum: number, r: any) => sum + Number(r.commission), 0)

  return {
    ...affiliate,
    totalReferrals,
    pendingCommission,
    approvedCommission,
    referrals: (referrals || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  }
}

export async function trackReferral(referralCode: string) {
  if (!referralCode) return
  const user = await getCurrentUserWithRole()
  if (!user) return

  const admin = createAdminClient()
  const { data: affiliate } = await admin
    .from("affiliates")
    .select("*")
    .eq('"referralCode"', referralCode.toUpperCase())
    .eq('"active"', true)
    .maybeSingle()

  if (!affiliate || affiliate.userId === user.id) return

  const { data: existing } = await admin
    .from("affiliate_referrals")
    .select("id")
    .eq('"affiliateId"', affiliate.id)
    .eq('"referredUserId"', user.id)
    .maybeSingle()

  if (existing) return

  await admin.from("affiliate_referrals").insert({
    id: randomUUID(),
    affiliateId: affiliate.id,
    referredUserId: user.id,
    commission: 0,
    status: "pending",
  })
}

export async function getAdminAffiliates() {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return []
  const admin = createAdminClient()
  const { data } = await admin
    .from("affiliates")
    .select("*, users:userId(name, email)")
    .order('"totalEarned"', { ascending: false })
  return data || []
}

export async function approveAffiliateCommission(referralId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" }
  const admin = createAdminClient()

  const { data: referral } = await admin
    .from("affiliate_referrals")
    .select("*")
    .eq('"id"', referralId)
    .single()

  if (!referral || referral.status !== "pending") return { error: "Invalid referral" }

  await admin.from("affiliate_referrals").update({ status: "approved" }).eq('"id"', referralId)

  const { data: affiliate } = await admin
    .from("affiliates")
    .select('"totalEarned"')
    .eq('"id"', referral.affiliateId)
    .single()

  if (affiliate) {
    await admin.from("affiliates")
      .update({ totalEarned: Number(affiliate.totalEarned) + Number(referral.commission) })
      .eq('"id"', referral.affiliateId)
  }

  revalidatePath("/admin/affiliates")
  return { success: true }
}
