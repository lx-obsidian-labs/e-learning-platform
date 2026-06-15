"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.coerce.number().int().positive().optional().nullable(),
  isPreviewable: z.coerce.boolean().default(false),
})

export async function createLesson(moduleId: string, formData: FormData) {
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

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    videoUrl: formData.get("videoUrl"),
    duration: formData.get("duration") || null,
    isPreviewable: formData.get("isPreviewable") === "true" || formData.get("isPreviewable") === "on",
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: lastLesson } = await supabase
    .from("lessons")
    .select('"order"')
    .eq('"moduleId"', moduleId)
    .order('"order"', { ascending: false })
    .limit(1)
    .maybeSingle()

  try {
    const { error } = await supabase
      .from("lessons")
      .insert({
        id: randomUUID(),
        title: parsed.data.title,
        description: parsed.data.description || null,
        content: parsed.data.content || null,
        videoUrl: parsed.data.videoUrl || null,
        duration: parsed.data.duration ?? null,
        isPreviewable: parsed.data.isPreviewable,
        order: (lastLesson?.order ?? 0) + 1,
        moduleId,
      })

    if (error) return { error: "Failed to create lesson" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create lesson" }
  }
}

export async function updateLesson(lessonId: string, formData: FormData) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq('"id"', lessonId)
    .single()

  if (lessonError || !lesson) return { error: "Not found or unauthorized" }

  const { data: mod } = await supabase
    .from("modules")
    .select('"courseId"')
    .eq('"id"', lesson.moduleId)
    .single()

  if (!mod) return { error: "Not found or unauthorized" }

  const { data: course } = await supabase
    .from("courses")
    .select('"instructorId"')
    .eq('"id"', mod.courseId)
    .single()

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    content: formData.get("content"),
    videoUrl: formData.get("videoUrl"),
    duration: formData.get("duration") || null,
    isPreviewable: formData.get("isPreviewable") === "true" || formData.get("isPreviewable") === "on",
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  try {
    const { error } = await supabase
      .from("lessons")
      .update(parsed.data)
      .eq('"id"', lessonId)

    if (error) return { error: "Failed to update lesson" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update lesson" }
  }
}

export async function reorderLesson(lessonId: string, direction: "up" | "down") {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq('"id"', lessonId)
    .single()

  if (lessonError || !lesson) return { error: "Not found or unauthorized" }

  const { data: mod } = await supabase
    .from("modules")
    .select('"courseId"')
    .eq('"id"', lesson.moduleId)
    .single()

  if (!mod) return { error: "Not found or unauthorized" }

  const { data: course } = await supabase
    .from("courses")
    .select('"instructorId"')
    .eq('"id"', mod.courseId)
    .single()

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  const { data: siblings } = await supabase
    .from("lessons")
    .select('"id","order"')
    .eq('"moduleId"', lesson.moduleId)
    .order('"order"', { ascending: true })

  if (!siblings || siblings.length < 2) return { error: "No adjacent lesson" }

  const currentIdx = siblings.findIndex((s) => s.id === lessonId)
  if (currentIdx === -1) return { error: "Not found" }

  const targetIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1
  if (targetIdx < 0 || targetIdx >= siblings.length) return { error: "Can't move further" }

  const target = siblings[targetIdx]
  const currentOrder = lesson.order
  const targetOrder = target.order

  const { error: e1 } = await supabase
    .from("lessons")
    .update({ order: targetOrder })
    .eq('"id"', lessonId)

  const { error: e2 } = await supabase
    .from("lessons")
    .update({ order: currentOrder })
    .eq('"id"', target.id)

  if (e1 || e2) return { error: "Failed to reorder" }

  revalidatePath(`/instructor/courses/${mod.courseId}`)
  return { success: true }
}

export async function deleteLesson(lessonId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const supabase = createAdminClient()
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq('"id"', lessonId)
    .single()

  if (lessonError || !lesson) return { error: "Not found or unauthorized" }

  const { data: mod } = await supabase
    .from("modules")
    .select('"courseId"')
    .eq('"id"', lesson.moduleId)
    .single()

  if (!mod) return { error: "Not found or unauthorized" }

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
      .from("lessons")
      .delete()
      .eq('"id"', lessonId)

    if (error) return { error: "Failed to delete lesson" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to delete lesson" }
  }
}
