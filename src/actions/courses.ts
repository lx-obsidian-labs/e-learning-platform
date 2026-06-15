"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
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
  const user = await getCurrentUserWithRole()

  if (!user || user.role === "STUDENT") {
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

  const supabase = createAdminClient()
  try {
    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        id: randomUUID(),
        title: parsed.data.title,
        slug: parsed.data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        description: parsed.data.description || null,
        price: parsed.data.price ?? 0,
        isFree: parsed.data.isFree ?? true,
        categoryId: parsed.data.categoryId || null,
        instructorId: user.id,
      })
      .select("*")
      .single()

    if (error) return { error: "Failed to create course" }

    revalidatePath("/instructor/courses")
    return { success: true, course }
  } catch {
    return { error: "Failed to create course" }
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const user = await getCurrentUserWithRole()

  if (!user || user.role === "STUDENT") {
    return { error: "Unauthorized" }
  }

  const supabase = createAdminClient()
  const { data: course, error: findError } = await supabase
    .from("courses")
    .select("*")
    .eq('"id"', courseId)
    .single()

  if (findError || !course) return { error: "Not found or unauthorized" }
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
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

  if (raw.price !== undefined) raw.price = Number(raw.price)
  if (raw.isFree !== undefined) raw.isFree = raw.isFree === "true" || raw.isFree === true

  const parsed = updateCourseSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  try {
    const { data: updated, error } = await supabase
      .from("courses")
      .update(parsed.data)
      .eq('"id"', courseId)
      .select("*")
      .single()

    if (error) return { error: "Failed to update course" }

    revalidatePath("/instructor/courses")
    revalidatePath(`/courses/${course.slug}`)
    return { success: true, course: updated }
  } catch {
    return { error: "Failed to update course" }
  }
}

export async function deleteCourse(courseId: string) {
  const user = await getCurrentUserWithRole()

  if (!user || user.role === "STUDENT") {
    return { error: "Unauthorized" }
  }

  const supabase = createAdminClient()
  const { data: course, error: findError } = await supabase
    .from("courses")
    .select("*")
    .eq('"id"', courseId)
    .single()

  if (findError || !course) return { error: "Not found or unauthorized" }
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { error: "Not found or unauthorized" }
  }

  try {
    const { error } = await supabase
      .from("courses")
      .update({ status: "ARCHIVED" })
      .eq('"id"', courseId)

    if (error) return { error: "Failed to delete course" }

    revalidatePath("/instructor/courses")
    return { success: true }
  } catch {
    return { error: "Failed to delete course" }
  }
}

export async function getInstructorCourses() {
  const user = await getCurrentUserWithRole()

  if (!user) return []

  const supabase = createAdminClient()
  const query = supabase
    .from("courses")
    .select("*")
    .order('"createdAt"', { ascending: false })

  if (user.role !== "ADMIN") {
    query.eq('"instructorId"', user.id)
  }

  const { data: courses, error } = await query
  if (error) return []

  const coursesWithMeta = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq('"courseId"', course.id)

      const { data: modules } = await supabase
        .from("modules")
        .select("*")
        .eq('"courseId"', course.id)

      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (mod) => {
          const { data: lessons } = await supabase
            .from("lessons")
            .select("*")
            .eq('"moduleId"', mod.id)
          return { ...mod, lessons: lessons || [] }
        })
      )

      return {
        ...course,
        category: null,
        modules: modulesWithLessons,
        _count: { enrollments: enrollmentCount || 0 },
      }
    })
  )

  return coursesWithMeta
}

export async function getCourseBySlug(slug: string) {
  const supabase = createAdminClient()
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq('"slug"', slug)
    .single()

  if (error || !course) return null

  const { data: instructor } = await supabase
    .from("users")
    .select('"id","name","image"')
    .eq('"id"', course.instructorId)
    .single()

  let category = null
  if (course.categoryId) {
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq('"id"', course.categoryId)
      .single()
    category = cat
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq('"courseId"', course.id)
    .order('"order"', { ascending: true })

  const modulesWithLessons = await Promise.all(
    (modules || []).map(async (mod) => {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq('"moduleId"', mod.id)
        .order('"order"', { ascending: true })

      return {
        ...mod,
        lessons: lessons || [],
      }
    })
  )

  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq('"courseId"', course.id)

  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq('"courseId"', course.id)

  return {
    ...course,
    instructor: instructor || null,
    category,
    modules: modulesWithLessons,
    _count: { enrollments: enrollmentCount || 0, reviews: reviewCount || 0 },
  }
}

export async function getPublishedCourses() {
  const supabase = createAdminClient()
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq('"status"', "PUBLISHED")
    .order('"createdAt"', { ascending: false })

  if (error) return []

  const coursesWithMeta = await Promise.all(
    (courses || []).map(async (course) => {
      const { data: instructor } = await supabase
        .from("users")
        .select('"id","name","image"')
        .eq('"id"', course.instructorId)
        .single()

      let category = null
      if (course.categoryId) {
        const { data: cat } = await supabase
          .from("categories")
          .select("*")
          .eq('"id"', course.categoryId)
          .single()
        category = cat
      }

      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq('"courseId"', course.id)

      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq('"courseId"', course.id)

      return {
        ...course,
        instructor: instructor || null,
        category,
        _count: { enrollments: enrollmentCount || 0, reviews: reviewCount || 0 },
      }
    })
  )

  return coursesWithMeta
}
