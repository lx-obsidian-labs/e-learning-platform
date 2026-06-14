"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markLessonComplete(lessonId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Not authenticated" }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: true },
      },
    },
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
  if (!enrollment) return { error: "Not enrolled in this course" }

  try {
    await prisma.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        lessonId,
      },
    })

    const totalLessons = await prisma.lesson.count({
      where: { module: { courseId: lesson.module.courseId } },
    })
    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        userId: session.user.id,
        lesson: { module: { courseId: lesson.module.courseId } },
      },
    })

    const progress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    const newStatus = progress === 100 ? "COMPLETED" : "IN_PROGRESS"

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress, status: newStatus },
    })

    revalidatePath(`/courses/${lesson.module.course.slug}/lessons/${lessonId}`)
    revalidatePath("/dashboard")
    return { success: true, progress }
  } catch {
    return { error: "Failed to mark lesson complete" }
  }
}

export async function getCompletedLessonIds(courseId: string) {
  const session = await auth()
  if (!session?.user) return []

  const completions = await prisma.lessonCompletion.findMany({
    where: {
      userId: session.user.id,
      lesson: { module: { courseId } },
    },
    select: { lessonId: true },
  })
  return completions.map((c) => c.lessonId)
}
