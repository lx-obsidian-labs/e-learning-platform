"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { moderateContent } from "@/lib/nvidia-ai"

export async function createDiscussion(lessonId: string, formData: FormData) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const content = formData.get("content") as string
  const parentId = formData.get("parentId") as string | null

  if (!content?.trim()) return { error: "Content is required" }

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

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select('"id"')
    .eq('"userId"', user.id)
    .eq('"courseId"', mod.courseId)
    .maybeSingle()

  if (!enrollment && !lesson.isPreviewable) return { error: "Not enrolled" }

  const { data: course } = await supabase
    .from("courses")
    .select('"slug"')
    .eq('"id"', mod.courseId)
    .single()

  try {
    // Run moderation synchronously before insertion
    try {
      const modResult = await moderateContent(content.trim())
      if (modResult.verdict === "reject") {
        return { error: "Content violates community guidelines" }
      }

      // If flagged, create a lightweight notification for instructors/admins
      if (modResult.verdict === "flag") {
        // fetch course instructor to notify
        const { data: courseRow } = await supabase
          .from("courses")
          .select('instructorId')
          .eq('"id"', mod.courseId)
          .maybeSingle()

        const instructorId = courseRow?.instructorId ?? null
        if (instructorId) {
          await supabase.from("notifications").insert({
            id: randomUUID(),
            title: "Flagged discussion",
            message: `A discussion was flagged for review: ${modResult.reason}`,
            userId: instructorId,
          })
        }
      }
    } catch (err) {
      // If moderation fails, continue but log
      console.warn("Moderation error:", err)
    }

    const { error } = await supabase
      .from("discussions")
      .insert({
        id: randomUUID(),
        content: content.trim(),
        userId: user.id,
        lessonId,
        parentId: parentId || null,
      })

    if (error) return { error: "Failed to post comment" }

    try {
      const { updateQuestProgress } = await import("@/actions/quests")
      await updateQuestProgress("discussion", 1)
    } catch {
      // quests module not available, skip
    }

    revalidatePath(`/courses/${course?.slug || mod.courseId}/lessons/${lessonId}`)
    return { success: true }
  } catch {
    return { error: "Failed to post comment" }
  }
}

export async function getLessonDiscussions(lessonId: string) {
  const supabase = createAdminClient()

  const { data: discussions } = await supabase
    .from("discussions")
    .select("*")
    .eq('"lessonId"', lessonId)
    .is('"parentId"', null)
    .order('"createdAt"', { ascending: false })

  const enriched = await Promise.all(
    (discussions || []).map(async (discussion) => {
      const { data: user } = await supabase
        .from("users")
        .select('"id","name","image"')
        .eq('"id"', discussion.userId)
        .single()

      const { data: replies } = await supabase
        .from("discussions")
        .select("*")
        .eq('"parentId"', discussion.id)
        .order('"createdAt"', { ascending: true })

      const repliesWithUser = await Promise.all(
        (replies || []).map(async (reply) => {
          const { data: replyUser } = await supabase
            .from("users")
            .select('"id","name","image"')
            .eq('"id"', reply.userId)
            .single()

          return { ...reply, user: replyUser || null }
        })
      )

      return {
        ...discussion,
        user: user || null,
        replies: repliesWithUser,
      }
    })
  )

  return enriched
}
