"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function submitReview(courseId: string, courseSlug: string, formData: FormData) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: course } = await supabase
    .from("courses")
    .select('"title","instructorId"')
    .eq('"id"', courseId)
    .single()

  if (!course) return { error: "Course not found" }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select('"id"')
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (!enrollment) return { error: "Must be enrolled to review" }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  try {
    const { data: existing } = await supabase
      .from("reviews")
      .select('"id"')
      .eq('"userId"', user.id)
      .eq('"courseId"', courseId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("reviews")
        .update({ rating: parsed.data.rating, comment: parsed.data.comment || null })
        .eq('"id"', existing.id)

      if (error) return { error: "Failed to submit review" }
    } else {
      const { error } = await supabase
        .from("reviews")
        .insert({
          id: randomUUID(),
          userId: user.id,
          courseId,
          rating: parsed.data.rating,
          comment: parsed.data.comment || null,
        })

      if (error) return { error: "Failed to submit review" }
    }

    const { createNotification } = await import("@/actions/notifications")
    if (course.instructorId && course.instructorId !== user.id) {
      await createNotification(course.instructorId, "New review", `${user.name || "A student"} rated "${course.title}" ${parsed.data.rating}/5`)
    }

    const { data: avgResult } = await supabase
      .from("reviews")
      .select("rating")
      .eq('"courseId"', courseId)

    const reviews = avgResult || []
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    const { error: updateError } = await supabase
      .from("courses")
      .update({ rating: avgRating })
      .eq('"id"', courseId)

    if (updateError) return { error: "Failed to submit review" }

    revalidatePath(`/courses/${courseSlug}`)
    revalidatePath("/courses")
    return { success: true }
  } catch {
    return { error: "Failed to submit review" }
  }
}

export async function getCourseReviews(courseSlug: string) {
  const supabase = createAdminClient()

  const { data: course } = await supabase
    .from("courses")
    .select('"id"')
    .eq('"slug"', courseSlug)
    .single()

  if (!course) return []

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq('"courseId"', course.id)
    .order('"createdAt"', { ascending: false })

  const enriched = await Promise.all(
    (reviews || []).map(async (review) => {
      const { data: user } = await supabase
        .from("users")
        .select('"name","image"')
        .eq('"id"', review.userId)
        .single()

      return { ...review, user: user || null }
    })
  )

  return enriched
}
