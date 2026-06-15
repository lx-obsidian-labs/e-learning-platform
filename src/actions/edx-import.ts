"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { OpenEdxProvider } from "@/lib/courses/providers/openedx"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const now = () => new Date().toISOString()

export async function importEdxCourse(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()
  const provider = new OpenEdxProvider()

  try {
    const edxCourseId = courseId.replace(/^edx_/, "")
    const course = await provider.getCourse(edxCourseId)
    if (!course) return { error: "Course not found from edX API" }

    const slug = slugify(course.title)
    const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
    if (existing) return { error: "Course already exists", id: existing.id }

    const { data: newCourse, error } = await admin
      .from("courses")
      .insert({
        id: randomUUID(),
        title: course.title,
        slug,
        description: course.description,
        price: 0,
        isFree: true,
        thumbnail: course.thumbnail || null,
        instructorId: user.id,
        status: "PUBLISHED",
        updatedAt: now(),
      })
      .select('"id"')
      .single()

    if (error || !newCourse) return { error: "Failed to create course" }

    const sections = await provider.getCourseStructure(edxCourseId)
    const allLessons = await provider.getLessons(edxCourseId)

    if (sections.length > 0) {
      for (const section of sections) {
        const { data: mod } = await admin
          .from("modules")
          .insert({
            id: randomUUID(),
            title: section.title,
            order: section.position,
            courseId: newCourse.id,
          })
          .select('"id"')
          .single()

        if (!mod) continue

        const sectionLessons = allLessons.filter((l) => l.id.startsWith(section.id))
        if (sectionLessons.length > 0) {
          for (const lesson of sectionLessons) {
            await admin.from("lessons").insert({
              id: randomUUID(),
              title: lesson.title,
              content: lesson.description || null,
              videoUrl: lesson.contentType === "video" ? lesson.contentUrl || null : null,
              order: lesson.position,
              moduleId: mod.id,
              updatedAt: now(),
            })
          }
        }
      }
    } else {
      const { data: mod } = await admin
        .from("modules")
        .insert({
          id: randomUUID(),
          title: "Course Content",
          order: 1,
          courseId: newCourse.id,
        })
        .select('"id"')
        .single()

      if (mod && course.videoUrl) {
        await admin.from("lessons").insert({
          id: randomUUID(),
          title: "Course Introduction",
          content: course.description || null,
          videoUrl: course.videoUrl,
          order: 1,
          moduleId: mod.id,
          updatedAt: now(),
        })
      }
    }

    revalidatePath("/courses")
    revalidatePath("/admin/courses")
    return { success: true, id: newCourse.id }
  } catch (err: any) {
    return { error: err.message || "Import failed" }
  }
}

export async function searchEdxCourses(query?: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return []

  try {
    const provider = new OpenEdxProvider()
    const courses = await provider.searchCourses(query)
    return courses.map((c) => ({
      id: c.id,
      providerCourseId: c.providerCourseId,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      instructor: c.instructor,
      videoUrl: c.videoUrl,
      url: c.url,
    }))
  } catch {
    return []
  }
}
