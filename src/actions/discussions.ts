"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createDiscussion(lessonId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Not authenticated" }

  const content = formData.get("content") as string
  const parentId = formData.get("parentId") as string | null

  if (!content?.trim()) return { error: "Content is required" }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  })
  if (!lesson) return { error: "Lesson not found" }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: lesson.module.courseId,
      },
    },
  })
  if (!enrollment && !lesson.isPreviewable) return { error: "Not enrolled" }

  try {
    await prisma.discussion.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        lessonId,
        parentId: parentId || null,
      },
    })
    revalidatePath(`/courses/${lesson.module.course.slug}/lessons/${lessonId}`)
    return { success: true }
  } catch {
    return { error: "Failed to post comment" }
  }
}

export async function getLessonDiscussions(lessonId: string) {
  return prisma.discussion.findMany({
    where: { lessonId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })
}
