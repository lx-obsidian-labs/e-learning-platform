"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { searchExternalCourses, importExternalCourse } from "@/lib/external-courses"
import { revalidatePath } from "next/cache"

export async function seedFreeCourses() {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()

  const { data: existingCourses } = await admin.from("courses").select('"id"').limit(1)
  if (existingCourses && existingCourses.length > 0) {
    return { error: "Courses already exist. Delete them first or import manually." }
  }

  let categories: Record<string, string> = {}
  const { data: cats } = await admin.from("categories").select('"id","name"')
  if (cats) {
    for (const c of cats) categories[c.name] = c.id
  }

  const courses = await searchExternalCourses()
  let imported = 0
  let skipped = 0

  for (const course of courses) {
    let catId: string | undefined
    if (course.category && categories[course.category]) {
      catId = categories[course.category]
    }

    const result = await importExternalCourse(course, user.id, catId)
    if (result.error) {
      skipped++
    } else {
      imported++
    }
  }

  revalidatePath("/courses")
  revalidatePath("/admin/courses")
  return { imported, skipped }
}
