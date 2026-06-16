"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export async function scheduleLessonReview(lessonId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("review_items")
    .select("id")
    .eq('"userId"', user.id)
    .eq('"lessonId"', lessonId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("review_items")
      .update({
        nextReviewAt: new Date().toISOString(),
      })
      .eq('"id"', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from("review_items")
      .insert({
        id: randomUUID(),
        userId: user.id,
        lessonId,
        nextReviewAt: new Date().toISOString(),
      })
    if (error) return { error: error.message }
  }

  revalidatePath("/review")
  return { success: true }
}

export async function getDueReviews() {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()

  const { data: items } = await supabase
    .from("review_items")
    .select(`
      id,
      lessonId,
      easiness,
      interval,
      nextReviewAt,
      lesson:lessonId(id, title, content, moduleId, module:moduleId(id, title, courseId, course:courseId(slug)))
    `)
    .eq('"userId"', user.id)
    .lte('"nextReviewAt"', new Date().toISOString())
    .order('"nextReviewAt"', { ascending: true })

  return (items || []).map((item: any) => ({
    id: item.id,
    lessonId: item.lessonId,
    title: item.lesson?.title || "Unknown Lesson",
    moduleTitle: item.lesson?.module?.title || "",
    courseSlug: item.lesson?.module?.course?.slug || "",
    easiness: item.easiness,
    interval: item.interval,
  }))
}

export async function submitReview(lessonId: string, quality: number) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  quality = Math.max(0, Math.min(5, Math.round(quality)))

  const { data: item } = await supabase
    .from("review_items")
    .select("*")
    .eq('"userId"', user.id)
    .eq('"lessonId"', lessonId)
    .maybeSingle()

  if (!item) return { error: "Review item not found" }

  let { easiness, interval, repetitions } = item

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easiness)
    }
    repetitions += 1
  }

  easiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  easiness = Math.round(easiness * 100) / 100

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)

  const { error: updateError } = await supabase
    .from("review_items")
    .update({
      easiness,
      interval,
      repetitions,
      nextReviewAt: nextReviewAt.toISOString(),
      lastReviewedAt: new Date().toISOString(),
    })
    .eq('"id"', item.id)

  if (updateError) return { error: updateError.message }

  const { error: sessionError } = await supabase
    .from("review_sessions")
    .insert({
      id: randomUUID(),
      userId: user.id,
      lessonId,
      score: quality,
    })

  if (sessionError) return { error: sessionError.message }

  try {
    const { awardXp } = await import("@/actions/gamification")
    await awardXp(user.id, 10, "review_complete", lessonId)
  } catch {
    // gamification module not available, skip XP award
  }

  try {
    const { updateQuestProgress } = await import("@/actions/quests")
    await updateQuestProgress("reviews", 1)
  } catch {
    // quests module not available, skip
  }

  revalidatePath("/review")
  return { interval, nextReviewAt: nextReviewAt.toISOString() }
}

export async function getReviewStats() {
  const user = await getCurrentUserWithRole()
  if (!user) return { totalDue: 0, totalCompleted: 0, streak: 0 }

  const supabase = createAdminClient()

  const { count: totalDue } = await supabase
    .from("review_items")
    .select("*", { count: "exact", head: true })
    .eq('"userId"', user.id)
    .lte('"nextReviewAt"', new Date().toISOString())

  const { count: totalCompleted } = await supabase
    .from("review_sessions")
    .select("*", { count: "exact", head: true })
    .eq('"userId"', user.id)

  const today = new Date().toISOString().split("T")[0]
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0]
    const { count } = await supabase
      .from("review_sessions")
      .select("*", { count: "exact", head: true })
      .eq('"userId"', user.id)
      .gte('"completedAt"', `${date}T00:00:00.000Z`)
      .lt('"completedAt"', `${date}T23:59:59.999Z`)

    if ((count || 0) > 0) {
      streak += 1
    } else {
      break
    }
  }

  return { totalDue: totalDue || 0, totalCompleted: totalCompleted || 0, streak }
}
