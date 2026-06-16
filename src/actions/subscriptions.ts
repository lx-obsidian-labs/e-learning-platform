"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { stripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

export async function getUserSubscription() {
  const user = await getCurrentUserWithRole()
  if (!user) return null
  const admin = createAdminClient()
  const { data } = await admin
    .from("stripe_subscriptions")
    .select("*")
    .eq('"userId"', user.id)
    .eq('"status"', "active")
    .maybeSingle()
  return data
}

export async function cancelSubscription(subscriptionId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()

  const { data: sub } = await admin
    .from("stripe_subscriptions")
    .select("*")
    .eq('"id"', subscriptionId)
    .eq('"userId"', user.id)
    .single()

  if (!sub) return { error: "Subscription not found" }

  try {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
    await admin.from("stripe_subscriptions")
      .update({ cancelAtPeriodEnd: true, updatedAt: new Date().toISOString() })
      .eq('"id"', subscriptionId)

    revalidatePath("/subscription")
    return { success: true }
  } catch (err) {
    return { error: "Failed to cancel subscription" }
  }
}

export async function resumeSubscription(subscriptionId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()

  const { data: sub } = await admin
    .from("stripe_subscriptions")
    .select("*")
    .eq('"id"', subscriptionId)
    .eq('"userId"', user.id)
    .single()

  if (!sub) return { error: "Subscription not found" }

  try {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })
    await admin.from("stripe_subscriptions")
      .update({ cancelAtPeriodEnd: false, updatedAt: new Date().toISOString() })
      .eq('"id"', subscriptionId)

    revalidatePath("/subscription")
    return { success: true }
  } catch {
    return { error: "Failed to resume subscription" }
  }
}

export async function createBillingPortalSession() {
  const user = await getCurrentUserWithRole()
  if (!user) return null
  const admin = createAdminClient()

  const { data: sub } = await admin
    .from("stripe_subscriptions")
    .select("stripeCustomerId")
    .eq('"userId"', user.id)
    .eq('"status"', "active")
    .maybeSingle()

  if (!sub?.stripeCustomerId) return null

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    })
    return session.url
  } catch {
    return null
  }
}
