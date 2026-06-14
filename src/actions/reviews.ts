"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function submitReview(courseId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Not authenticated" }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  if (!enrollment) return { error: "Must be enrolled to review" }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  try {
    await prisma.review.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: { rating: parsed.data.rating, comment: parsed.data.comment || null },
      create: {
        userId: session.user.id,
        courseId,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
    })

    const agg = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
    })
    await prisma.course.update({
      where: { id: courseId },
      data: { rating: agg._avg.rating ?? 0 },
    })

    revalidatePath(`/courses/${courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to submit review" }
  }
}

export async function getCourseReviews(courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: { id: true },
  })
  if (!course) return []

  return prisma.review.findMany({
    where: { courseId: course.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true } },
    },
  })
}
