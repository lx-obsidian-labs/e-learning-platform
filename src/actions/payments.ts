"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { generateReference } from "@/lib/reference"
import { uploadProofFile } from "@/lib/payments/storage"
import type { Order, PricingPlan } from "@/types/payments"

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("pricing_plans")
    .select("*")
    .eq('"active"', true)
    .order('"price"', { ascending: true })

  return (data || []).map((p: any) => ({ ...p, features: p.features || [] }))
}

export async function createOrder(planId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()

  const { data: plan } = await admin
    .from("pricing_plans")
    .select("*")
    .eq('"id"', planId)
    .single()

  if (!plan || !plan.active) return { error: "Plan not found" }

  const { data: existingPending } = await admin
    .from("orders")
    .select('"id","reference"')
    .eq('"userId"', user.id)
    .eq('"planId"', planId)
    .eq('"status"', "PENDING")
    .maybeSingle()

  if (existingPending) {
    return {
      success: true,
      orderId: existingPending.id,
      reference: existingPending.reference,
    }
  }

  const reference = await generateReference()

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      id: randomUUID(),
      userId: user.id,
      planId,
      courseId: null,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod: "EFT",
      reference,
      status: "PENDING",
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { error: "Failed to create order" }

  revalidatePath("/pricing")
  return { success: true, orderId: order.id, reference }
}

export async function uploadProof(orderId: string, base64Data: string, mimeType: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select('"id","userId","status"')
    .eq('"id"', orderId)
    .single()

  if (!order) return { error: "Order not found" }
  if (order.userId !== user.id) return { error: "Unauthorized" }
  if (order.status !== "PENDING") return { error: "Order cannot accept proof" }

  const { data: existingProof } = await admin
    .from("payment_proofs")
    .select('"id"')
    .eq('"orderId"', orderId)
    .maybeSingle()

  if (existingProof) return { error: "Proof already uploaded" }

  const fileUrl = await uploadProofFile(base64Data, mimeType)
  if (!fileUrl) return { error: "Failed to upload file. Please try again." }

  const { error: proofError } = await admin
    .from("payment_proofs")
    .insert({
      id: randomUUID(),
      orderId,
      fileUrl,
    })

  if (proofError) return { error: "Failed to save proof record" }

  revalidatePath(`/pricing/checkout/${orderId}`)
  return { success: true }
}

export async function getUserOrders(): Promise<(Order & { pricing_plans?: { name: string } | null })[]> {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from("orders")
    .select("*, pricing_plans(name)")
    .eq('"userId"', user.id)
    .order('"createdAt"', { ascending: false })

  return (data || []) as any
}

export async function getOrderWithProof(orderId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return null

  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select("*, pricing_plans(*)")
    .eq('"id"', orderId)
    .single()

  if (!order || order.userId !== user.id) return null

  const { data: proofs } = await admin
    .from("payment_proofs")
    .select("*")
    .eq('"orderId"', orderId)
    .order('"uploadedAt"', { ascending: false })

  return { ...order, proofs: proofs || [] }
}

export async function getPendingOrders() {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return []

  const admin = createAdminClient()

  const { data: orders } = await admin
    .from("orders")
    .select("*, users!inner(name, email), pricing_plans(name)")
    .eq('"paymentMethod"', "EFT")
    .in('"status"', ["PENDING"])
    .order('"createdAt"', { ascending: false })

  const enriched = await Promise.all(
    (orders || []).map(async (order: any) => {
      const { data: proofs } = await admin
        .from("payment_proofs")
        .select("*")
        .eq('"orderId"', order.id)
        .order('"uploadedAt"', { ascending: false })
      return { ...order, proofs: proofs || [] }
    })
  )

  return enriched
}

export async function getCompletedOrders() {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return []

  const admin = createAdminClient()

  const { data: orders } = await admin
    .from("orders")
    .select("*, users!inner(name, email), pricing_plans(name)")
    .eq('"paymentMethod"', "EFT")
    .in('"status"', ["COMPLETED", "FAILED"])
    .order('"createdAt"', { ascending: false })

  const enriched = await Promise.all(
    (orders || []).map(async (order: any) => {
      const { data: proofs } = await admin
        .from("payment_proofs")
        .select("*")
        .eq('"orderId"', order.id)
        .order('"uploadedAt"', { ascending: false })
      return { ...order, proofs: proofs || [] }
    })
  )

  return enriched
}

export async function approveOrder(orderId: string) {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser || currentUser.role !== "ADMIN") return { error: "Unauthorized" }

  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select("*, pricing_plans(*)")
    .eq('"id"', orderId)
    .single()

  if (!order) return { error: "Order not found" }
  if (order.status !== "PENDING") return { error: "Order is not pending" }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "COMPLETED", updatedAt: new Date().toISOString() })
    .eq('"id"', orderId)

  if (updateError) return { error: "Failed to approve order" }

  const { error: proofError } = await admin
    .from("payment_proofs")
    .update({ verifiedBy: currentUser.id, verifiedAt: new Date().toISOString() })
    .eq('"orderId"', orderId)
    .is('"verifiedAt"', null)

  if (proofError) console.error("Failed to mark proof verified:", proofError)

  const plan = order.pricing_plans
  if (plan) {
    const { data: courses } = await admin
      .from("courses")
      .select('"id"')
      .eq('"isFree"', false)

    if (courses) {
      for (const course of courses) {
        const { data: existing } = await admin
          .from("enrollments")
          .select('"id"')
          .eq('"userId"', order.userId)
          .eq('"courseId"', course.id)
          .maybeSingle()

        if (!existing) {
          await admin.from("enrollments").insert({
            id: randomUUID(),
            userId: order.userId,
            courseId: course.id,
            status: "IN_PROGRESS",
            progress: 0,
          })
        }
      }
    }
  }

  const { createNotification } = await import("@/actions/notifications")
  await createNotification(
    order.userId,
    "Payment approved! 🎉",
    `Your ${plan?.name || "plan"} payment of R${Number(order.amount).toFixed(2)} has been approved. Welcome aboard!`
  )

  revalidatePath("/admin/payments")
  revalidatePath("/pricing")
  return { success: true }
}

export async function rejectOrder(orderId: string) {
  const currentUser = await getCurrentUserWithRole()
  if (!currentUser || currentUser.role !== "ADMIN") return { error: "Unauthorized" }

  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select("*, pricing_plans(*)")
    .eq('"id"', orderId)
    .single()

  if (!order) return { error: "Order not found" }
  if (order.status !== "PENDING") return { error: "Order is not pending" }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "FAILED", updatedAt: new Date().toISOString() })
    .eq('"id"', orderId)

  if (updateError) return { error: "Failed to reject order" }

  const { createNotification } = await import("@/actions/notifications")
  await createNotification(
    order.userId,
    "Payment not approved",
    `Your ${order.pricing_plans?.name || "plan"} payment could not be verified. Please contact support for assistance.`
  )

  revalidatePath("/admin/payments")
  return { success: true }
}

export async function checkUserHasActivePlan(userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("orders")
    .select('"id"')
    .eq('"userId"', userId)
    .eq('"status"', "COMPLETED")
    .eq('"paymentMethod"', "EFT")
    .maybeSingle()

  return !!data
}
