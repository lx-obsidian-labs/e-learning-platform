"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export async function enrollInCourse(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select('"id","isFree","price","status"')
    .eq('"id"', courseId)
    .single()

  if (courseError || !course) return { error: "Course not found" }
  if (course.status !== "PUBLISHED") return { error: "Course is not available" }

  const { data: existing } = await supabase
    .from("enrollments")
    .select('"id"')
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (existing) return { error: "Already enrolled" }

  if (!course.isFree && Number(course.price) > 0) {
    const { data: paidOrder } = await supabase
      .from("orders")
      .select('"id"')
      .eq('"userId"', user.id)
      .eq('"status"', "COMPLETED")
      .maybeSingle()

    if (!paidOrder) {
      return { error: "This course requires a paid plan. Please visit the pricing page to purchase access." }
    }
  }

  try {
    const { error } = await supabase
      .from("enrollments")
      .insert({
        id: randomUUID(),
        userId: user.id,
        courseId,
        status: "NOT_STARTED",
      })

    if (error) return { error: "Failed to enroll" }

    const { data: courseInfo } = await supabase
      .from("courses")
      .select('"title","instructorId"')
      .eq('"id"', courseId)
      .single()

    const { createNotification } = await import("@/actions/notifications")
    await createNotification(user.id, `Welcome to ${courseInfo?.title || "your course"}!`, "You have successfully enrolled. Start learning today!")
    if (courseInfo?.instructorId) {
      await createNotification(courseInfo.instructorId, "New enrollment", `${user.name || "A student"} enrolled in ${courseInfo.title}`)
    }

    revalidatePath(`/courses/${courseId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch {
    return { error: "Failed to enroll" }
  }
}

export async function getStudentEnrollments() {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq('"userId"', user.id)
    .order('"enrolledAt"', { ascending: false })

  if (error) return []

  const enriched = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const { data: course } = await supabase
        .from("courses")
        .select("*")
        .eq('"id"', enrollment.courseId)
        .single()

      if (!course) return enrollment

      const { data: instructor } = await supabase
        .from("users")
        .select('"name"')
        .eq('"id"', course.instructorId)
        .single()

      const { data: modules } = await supabase
        .from("modules")
        .select('"id"')
        .eq('"courseId"', course.id)

      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (mod) => {
          const { data: lessons } = await supabase
            .from("lessons")
            .select('"id"')
            .eq('"moduleId"', mod.id)
          return { ...mod, lessons: lessons || [] }
        })
      )

      return {
        ...enrollment,
        course: {
          ...course,
          instructor: instructor || null,
          modules: modulesWithLessons,
        },
      }
    })
  )

  return enriched
}

export async function isEnrolled(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return false

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("enrollments")
    .select('"id"')
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .maybeSingle()

  return !!data
}

export async function getEnrolledCourseIds() {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select('"courseId"')
    .eq('"userId"', user.id)

  return (enrollments || []).map((e) => e.courseId)
}
