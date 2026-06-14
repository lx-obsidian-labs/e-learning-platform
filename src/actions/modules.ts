"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

export async function createModule(courseId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  })

  try {
    await prisma.module.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        order: (lastModule?.order ?? 0) + 1,
        courseId,
      },
    })
    revalidatePath(`/instructor/courses/${courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create module" }
  }
}

export async function updateModule(moduleId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  })
  if (!module || (module.course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: parsed.data,
    })
    revalidatePath(`/instructor/courses/${module.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update module" }
  }
}

export async function deleteModule(moduleId: string) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  })
  if (!module || (module.course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  try {
    await prisma.module.delete({ where: { id: moduleId } })
    revalidatePath(`/instructor/courses/${module.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to delete module" }
  }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return { error: "Unauthorized" }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  try {
    await prisma.$transaction(
      moduleIds.map((id, index) =>
        prisma.module.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    )
    revalidatePath(`/instructor/courses/${courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to reorder modules" }
  }
}
