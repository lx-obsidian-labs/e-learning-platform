"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

export async function createModule(courseId: string, formData: FormData) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq('"id"', courseId)
    .single()

  if (courseError || !course) return { error: "Not found or unauthorized" }
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { error: "Not found or unauthorized" }
  }

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: lastModule } = await supabase
    .from("modules")
    .select('"order"')
    .eq('"courseId"', courseId)
    .order('"order"', { ascending: false })
    .limit(1)
    .maybeSingle()

  try {
    const { error } = await supabase
      .from("modules")
      .insert({
        id: randomUUID(),
        title: parsed.data.title,
        description: parsed.data.description || null,
        order: (lastModule?.order ?? 0) + 1,
        courseId,
      })

    if (error) return { error: "Failed to create module" }

    revalidatePath(`/instructor/courses/${courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create module" }
  }
}

export async function updateModule(moduleId: string, formData: FormData) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: mod, error: modError } = await supabase
    .from("modules")
    .select("*")
    .eq('"id"', moduleId)
    .single()

  if (modError || !mod) return { error: "Not found or unauthorized" }

  const { data: course } = await supabase
    .from("courses")
    .select('"instructorId"')
    .eq('"id"', mod.courseId)
    .single()

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  try {
    const { error } = await supabase
      .from("modules")
      .update(parsed.data)
      .eq('"id"', moduleId)

    if (error) return { error: "Failed to update module" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update module" }
  }
}

export async function deleteModule(moduleId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: mod, error: modError } = await supabase
    .from("modules")
    .select("*")
    .eq('"id"', moduleId)
    .single()

  if (modError || !mod) return { error: "Not found or unauthorized" }

  const { data: course } = await supabase
    .from("courses")
    .select('"instructorId"')
    .eq('"id"', mod.courseId)
    .single()

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  try {
    const { error } = await supabase
      .from("modules")
      .delete()
      .eq('"id"', moduleId)

    if (error) return { error: "Failed to delete module" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to delete module" }
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select('"instructorId"')
    .eq('"id"', courseId)
    .single()

  if (courseError || !course) return { error: "Not found or unauthorized" }
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { error: "Not found or unauthorized" }
  }

  try {
    for (let i = 0; i < moduleIds.length; i++) {
      const { error } = await supabase
        .from("modules")
        .update({ order: i + 1 })
        .eq('"id"', moduleIds[i])

      if (error) return { error: "Failed to reorder modules" }
    }

    revalidatePath(`/instructor/courses/${courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to reorder modules" }
  }
}
