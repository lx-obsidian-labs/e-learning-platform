"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  const bio = formData.get("bio") as string
  const image = formData.get("image") as string

  const admin = createAdminClient()

  const updateData: Record<string, string> = { updatedAt: new Date().toISOString() }
  if (name?.trim()) updateData.name = name.trim()
  if (bio !== undefined) updateData.bio = bio
  if (image !== undefined) updateData.image = image

  const { error } = await admin.from("users").update(updateData).eq('"id"', user.id)
  if (error) return { error: "Failed to update profile" }

  revalidatePath("/settings")
  return { success: true }
}
