"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  isFree: z.boolean().default(false),
  categoryId: z.string().optional(),
})

const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  thumbnail: z.string().optional(),
})

export async function createCourse(formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
    return { error: "Unauthorized" }
  }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: formData.get("price") ? Number(formData.get("price")) : 0,
    isFree: formData.get("isFree") === "true",
    categoryId: (formData.get("categoryId") as string) || undefined,
  }

  const parsed = createCourseSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const course = await prisma.course.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        description: parsed.data.description,
        price: parsed.data.price,
        isFree: parsed.data.isFree,
        categoryId: parsed.data.categoryId,
        instructorId: session.user.id,
      },
    })

    revalidatePath("/instructor/courses")
    return { success: true, course }
  } catch (error) {
    return { error: "Failed to create course" }
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
    return { error: "Unauthorized" }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  const raw: Record<string, unknown> = {}
  const fields = ["title", "description", "price", "isFree", "status", "categoryId", "thumbnail"]

  for (const field of fields) {
    const value = formData.get(field)
    if (value !== null) {
      raw[field] = value
    }
  }

  if (raw.price) raw.price = Number(raw.price)
  if (raw.isFree) raw.isFree = raw.isFree === "true" || raw.isFree === true

  const parsed = updateCourseSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: parsed.data,
    })

    revalidatePath("/instructor/courses")
    revalidatePath(`/courses/${course.slug}`)
    return { success: true, course: updated }
  } catch {
    return { error: "Failed to update course" }
  }
}

export async function deleteCourse(courseId: string) {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
    return { error: "Unauthorized" }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return { error: "Not found or unauthorized" }
  }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { status: "ARCHIVED" },
    })

    revalidatePath("/instructor/courses")
    return { success: true }
  } catch {
    return { error: "Failed to delete course" }
  }
}

export async function getInstructorCourses() {
  const session = await auth()

  if (!session?.user) return []

  const where =
    session.user.role === "ADMIN"
      ? {}
      : { instructorId: session.user.id }

  return prisma.course.findMany({
    where,
    include: {
      category: true,
      modules: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            where: { OR: [{ isPreviewable: true }, { module: { course: { instructorId: undefined } } }] },
          },
        },
      },
      _count: { select: { enrollments: true, reviews: true } },
    },
  })
}

export async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      category: true,
      _count: { select: { enrollments: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
