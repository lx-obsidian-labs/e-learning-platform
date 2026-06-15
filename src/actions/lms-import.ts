"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const now = () => new Date().toISOString()

export async function importOpenEdxCourses(config: { baseUrl: string; clientId: string; clientSecret: string }) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()

  try {
    const { authenticate } = await import("@/lib/import/openedx/auth")
    const { getAllCourses, mapOpenEdxCourse } = await import("@/lib/import/openedx/courses")

    const courses = await getAllCourses({
      baseUrl: config.baseUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    })

    let imported = 0
    let skipped = 0

    for (const oc of courses.slice(0, 50)) {
      const mapped = mapOpenEdxCourse(oc, "open_edx")
      const slug = slugify(mapped.title)

      const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
      if (existing) { skipped++; continue }

      const { data: course } = await admin.from("courses").insert({
        id: randomUUID(), title: mapped.title, slug, description: mapped.description,
        price: 0, isFree: true, thumbnail: mapped.thumbnail || null,
        instructorId: user.id, status: "PUBLISHED", updatedAt: now(),
      }).select('"id"').single()

      if (!course) { skipped++; continue }

      await admin.from("modules").insert({
        id: randomUUID(), title: "Course Content", order: 1, courseId: course.id,
      })

      imported++
    }

    revalidatePath("/admin/courses")
    return { imported, skipped }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function importMoodleCourses(config: { baseUrl: string; token: string }) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()

  try {
    const { getCourses } = await import("@/lib/import/moodle/courses")
    const { getCategories } = await import("@/lib/import/moodle/categories")

    const categories = await getCategories({ baseUrl: config.baseUrl, token: config.token })
    const catMap: Record<number, string> = {}

    for (const cat of categories) {
      const slug = slugify(cat.name)
      const { data: existing } = await admin.from("categories").select('"id"').eq('"slug"', slug).maybeSingle()
      if (existing) {
        catMap[cat.id] = existing.id
      } else {
        const { data: nc } = await admin.from("categories").insert({
          id: randomUUID(), name: cat.name, slug, updatedAt: now(),
        }).select('"id"').single()
        if (nc) catMap[cat.id] = nc.id
      }
    }

    const courses = await getCourses({ baseUrl: config.baseUrl, token: config.token })
    let imported = 0
    let skipped = 0

    for (const mc of courses.slice(0, 50)) {
      const slug = slugify(mc.fullname)
      const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
      if (existing) { skipped++; continue }

      const { data: course } = await admin.from("courses").insert({
        id: randomUUID(), title: mc.fullname, slug, description: mc.summary?.replace(/<[^>]*>/g, "") || "",
        price: 0, isFree: true, thumbnail: mc.courseimage || null,
        categoryId: catMap[mc.categoryid] || null,
        instructorId: user.id, status: "PUBLISHED", updatedAt: now(),
      }).select('"id"').single()

      if (!course) { skipped++; continue }

      const { getCourseContents } = await import("@/lib/import/moodle/courses")
      const contents = await getCourseContents({ baseUrl: config.baseUrl, token: config.token }, mc.id)

      for (const section of contents) {
        const { data: mod } = await admin.from("modules").insert({
          id: randomUUID(), title: section.name, description: section.summary?.replace(/<[^>]*>/g, "") || null,
          order: section.id, courseId: course.id,
        }).select('"id"').single()

        if (mod) {
          for (const moduleItem of section.modules) {
            await admin.from("lessons").insert({
              id: randomUUID(), title: moduleItem.name, content: moduleItem.description || null,
              videoUrl: moduleItem.url || null, order: moduleItem.id, moduleId: mod.id, updatedAt: now(),
            })
          }
        }
      }

      imported++
    }

    revalidatePath("/admin/courses")
    return { imported, skipped }
  } catch (err: any) {
    return { error: err.message }
  }
}
