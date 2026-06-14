"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
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
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  })
  if (!mod || (mod.course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
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

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  })

  try {
    await prisma.lesson.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        content: parsed.data.content || null,
        videoUrl: parsed.data.videoUrl || null,
        duration: parsed.data.duration ?? null,
        isPreviewable: parsed.data.isPreviewable,
        order: (lastLesson?.order ?? 0) + 1,
        moduleId,
      },
    })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create lesson" }
  }
}

export async function updateLesson(lessonId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  })
  if (!lesson || (lesson.module.course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
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
    await prisma.lesson.update({
      where: { id: lessonId },
      data: parsed.data,
    })
    revalidatePath(`/instructor/courses/${lesson.module.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update lesson" }
  }
}

export async function deleteLesson(lessonId: string) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  })
  if (!lesson || (lesson.module.course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  try {
    await prisma.lesson.delete({ where: { id: lessonId } })
    revalidatePath(`/instructor/courses/${lesson.module.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to delete lesson" }
  }
}
