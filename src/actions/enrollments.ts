"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function enrollInCourse(courseId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Not authenticated" }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, isFree: true, price: true, status: true },
  })

  if (!course) return { error: "Course not found" }
  if (course.status !== "PUBLISHED") return { error: "Course is not available" }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  if (existing) return { error: "Already enrolled" }

  if (!course.isFree && Number(course.price) > 0) {
    return { error: "Paid courses require payment" }
  }

  try {
    await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        status: "NOT_STARTED",
      },
    })
    revalidatePath(`/courses/${courseId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch {
    return { error: "Failed to enroll" }
  }
}

export async function getStudentEnrollments() {
  const session = await auth()
  if (!session?.user) return []

  return prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          modules: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })
}

export async function isEnrolled(courseId: string) {
  const session = await auth()
  if (!session?.user) return false

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  return !!enrollment
}

export async function getEnrolledCourseIds() {
  const session = await auth()
  if (!session?.user) return []

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    select: { courseId: true },
  })
  return enrollments.map((e) => e.courseId)
}
