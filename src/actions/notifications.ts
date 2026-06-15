"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import type { Notification } from "@/types/notifications"

export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("notifications")
    .insert({
      id: randomUUID(),
      userId,
      title,
      message,
      read: false,
    })

  if (error) console.error("Failed to create notification:", error)
}

export async function getNotifications(): Promise<Notification[]> {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq('"userId"', user.id)
    .order('"createdAt"', { ascending: false })
    .limit(50)

  return (data || []) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUserWithRole()
  if (!user) return 0

  const supabase = createAdminClient()
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq('"userId"', user.id)
    .eq('"read"', false)

  return count ?? 0
}

export async function markAsRead(notificationId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq('"id"', notificationId)
    .eq('"userId"', user.id)

  if (error) return { error: "Failed to mark as read" }
  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllAsRead() {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq('"userId"', user.id)
    .eq('"read"', false)

  if (error) return { error: "Failed to mark all as read" }
  revalidatePath("/notifications")
  return { success: true }
}
