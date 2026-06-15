"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string || "STUDENT"

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: "Sign up failed" }

  const { error: insertError } = await admin.from("users").insert({
    id: data.user.id,
    name,
    email,
    role,
    updatedAt: new Date().toISOString(),
  })

  if (insertError) return { error: "Account created but profile save failed: " + insertError.message }

  revalidatePath("/auth/login")
  return { success: true }
}

export async function signIn(prevState: { error: string } | { success: true } | null, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: "Invalid credentials" }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/auth/login")
  redirect("/auth/login")
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUserWithRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("*")
    .eq('"id"', user.id)
    .maybeSingle()

  return { ...user, ...(profile || { role: "STUDENT" }) }
}


