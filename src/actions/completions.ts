"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"

export async function markLessonComplete(lessonId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq('"id"', lessonId)
    .single()

  if (lessonError || !lesson) return { error: "Lesson not found" }

  const { data: mod } = await supabase
    .from("modules")
    .select('"courseId"')
    .eq('"id"', lesson.moduleId)
    .single()

  if (!mod) return { error: "Lesson not found" }

  const { data: course } = await supabase
    .from("courses")
    .select('"slug"')
    .eq('"id"', mod.courseId)
    .single()

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select('"id"')
    .eq('"userId"', user.id)
    .eq('"courseId"', mod.courseId)
    .maybeSingle()

  if (!enrollment) return { error: "Not enrolled in this course" }

  try {
    const { data: existing } = await supabase
      .from("lesson_completions")
      .select('"id"')
      .eq('"userId"', user.id)
      .eq('"lessonId"', lessonId)
      .maybeSingle()

    if (!existing) {
      const { error: insertError } = await supabase
        .from("lesson_completions")
        .insert({ userId: user.id, lessonId })

      if (insertError) return { error: "Failed to mark lesson complete" }
    }

    const { data: allModules } = await supabase
      .from("modules")
      .select('"id"')
      .eq('"courseId"', mod.courseId)

    const moduleIds = (allModules || []).map((m) => m.id)

    let total = 0
    let completed = 0

    if (moduleIds.length > 0) {
      const { count: tc } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .in('"moduleId"', moduleIds)
      total = tc || 0

      const { data: allLessonIds } = await supabase
        .from("lessons")
        .select('"id"')
        .in('"moduleId"', moduleIds)

      const lessonIdList = (allLessonIds || []).map((l) => l.id)

      if (lessonIdList.length > 0) {
        const { count: cc } = await supabase
          .from("lesson_completions")
          .select("*", { count: "exact", head: true })
          .eq('"userId"', user.id)
          .in('"lessonId"', lessonIdList)
        completed = cc || 0
      }
    }

    const progress = total > 0
      ? Math.round((completed / total) * 100)
      : 0

    const newStatus = progress === 100 ? "COMPLETED" : "IN_PROGRESS"

    const { error: updateError } = await supabase
      .from("enrollments")
      .update({ progress, status: newStatus })
      .eq('"id"', enrollment.id)

    if (updateError) return { error: "Failed to mark lesson complete" }

    revalidatePath(`/courses/${course?.slug || mod.courseId}/lessons/${lessonId}`)
    revalidatePath("/dashboard")
    return { success: true, progress }
  } catch {
    return { error: "Failed to mark lesson complete" }
  }
}

export async function getCompletedLessonIds(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()

  const { data: modules } = await supabase
    .from("modules")
    .select('"id"')
    .eq('"courseId"', courseId)

  if (!modules || modules.length === 0) return []

  const moduleIds = modules.map((m) => m.id)

  const { data: lessons } = await supabase
    .from("lessons")
    .select('"id"')
    .in('"moduleId"', moduleIds)

  if (!lessons || lessons.length === 0) return []

  const lessonIds = lessons.map((l) => l.id)

  const { data: completions } = await supabase
    .from("lesson_completions")
    .select('"lessonId"')
    .eq('"userId"', user.id)
    .in('"lessonId"', lessonIds)

  return (completions || []).map((c) => c.lessonId)
}
