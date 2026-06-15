"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAllUsers(params?: {
  search?: string
  role?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { users: [], total: 0 }

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") return { users: [], total: 0 }

  const { search, role, page = 1, limit = 20 } = params || {}
  const offset = (page - 1) * limit

  let query = admin.from("users").select("*", { count: "exact" })

  if (role && role !== "ALL") {
    query = query.eq('"role"', role)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: users, count } = await query
    .order('"createdAt"', { ascending: false })
    .range(offset, offset + limit - 1)

  return { users: users || [], total: count || 0 }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") return { error: "Unauthorized" }

  if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(newRole)) {
    return { error: "Invalid role" }
  }

  const { error } = await admin
    .from("users")
    .update({ role: newRole, updatedAt: new Date().toISOString() })
    .eq('"id"', userId)

  if (error) return { error: "Failed to update role" }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") return { error: "Unauthorized" }

  if (userId === user.id) return { error: "Cannot delete your own account" }

  const { error: authError } = await admin.auth.admin.deleteUser(userId)
  if (authError) return { error: "Failed to delete user" }

  revalidatePath("/admin/users")
  return { success: true }
}
