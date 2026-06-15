"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { parseJSONCourses, parseCSVCourses, validateCourse } from "@/lib/course-importer"
import type { ImportedCourse, ImportedQuiz } from "@/lib/course-importer"

import { randomUUID } from "crypto"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const now = () => new Date().toISOString()

async function importQuiz(admin: ReturnType<typeof createAdminClient>, moduleId: string, quiz: ImportedQuiz) {
  const { data: quizRecord, error: quizErr } = await admin
    .from("quizzes")
    .insert({ id: randomUUID(), title: quiz.title, description: quiz.description || null, passingScore: quiz.passingScore || null, moduleId })
    .select('"id"')
    .single()

  if (quizErr || !quizRecord) return { error: "Failed creating quiz" }

  for (let qi = 0; qi < quiz.questions.length; qi++) {
    const q = quiz.questions[qi]
    const { data: questionRecord } = await admin
      .from("quiz_questions")
      .insert({ id: randomUUID(), text: q.text, type: q.type, points: q.points || 1, order: qi + 1, quizId: quizRecord.id })
      .select('"id"')
      .single()

    if (questionRecord && q.options) {
      for (const opt of q.options) {
        await admin.from("quiz_answer_options").insert({ id: randomUUID(), text: opt.text, isCorrect: opt.isCorrect, questionId: questionRecord.id })
      }
    }
  }

  return { success: true }
}

export async function importCourses(raw: string, format: "json" | "csv") {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()

  let courses: ImportedCourse[]
  try {
    courses = format === "json" ? parseJSONCourses(raw) : parseCSVCourses(raw)
  } catch {
    return { error: "Failed to parse file" }
  }

  if (!courses.length) return { error: "No courses found" }

  const results: { title: string; status: string; error?: string }[] = []

  for (const course of courses) {
    const validationError = validateCourse(course)
    if (validationError) {
      results.push({ title: course.title, status: "skipped", error: validationError })
      continue
    }

    const slug = slugify(course.title)

    const { data: existing } = await admin
      .from("courses")
      .select('"id"')
      .eq('"slug"', slug)
      .maybeSingle()

    if (existing) {
      results.push({ title: course.title, status: "skipped", error: "Already exists" })
      continue
    }

    let categoryId: string | null = null
    if (course.category) {
      const catSlug = slugify(course.category)
      const { data: cat } = await admin.from("categories").select('"id"').eq('"slug"', catSlug).maybeSingle()
      if (cat) {
        categoryId = cat.id
      } else {
        const { data: newCat } = await admin.from("categories").insert({ id: randomUUID(), name: course.category, slug: catSlug, updatedAt: now() }).select('"id"').single()
        if (newCat) categoryId = newCat.id
      }
    }

    const { data: newCourse, error: courseErr } = await admin
      .from("courses")
      .insert({
        id: randomUUID(),
        title: course.title,
        slug,
        description: course.description,
        price: course.price,
        isFree: course.isFree,
        thumbnail: course.thumbnail || null,
        categoryId,
        instructorId: user.id,
        status: "PUBLISHED",
        updatedAt: now(),
      })
      .select('"id"')
      .single()

    if (courseErr || !newCourse) {
      results.push({ title: course.title, status: "error", error: courseErr?.message || "Failed" })
      continue
    }

    let importFailed = false
    for (let mi = 0; mi < course.modules.length; mi++) {
      const mod = course.modules[mi]
      const modId = randomUUID()
      const { data: newModule, error: modErr } = await admin
        .from("modules")
        .insert({ id: modId, title: mod.title, description: mod.description || null, order: mi + 1, courseId: newCourse.id })
        .select('"id"')
        .single()

      if (modErr || !newModule) { importFailed = true; break }

      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li]
        const { error: lessonErr } = await admin
          .from("lessons")
          .insert({
            id: randomUUID(),
            title: lesson.title,
            content: lesson.content || null,
            videoUrl: lesson.videoUrl || null,
            duration: lesson.duration || null,
            isPreviewable: lesson.isPreviewable || false,
            order: li + 1,
            moduleId: newModule.id,
            updatedAt: now(),
          })

        if (lessonErr) { importFailed = true; break }
      }

      if (importFailed) break

      if (mod.quiz) {
        await importQuiz(admin, newModule.id, mod.quiz)
      }
    }

    results.push({
      title: course.title,
      status: importFailed ? "error" : "imported",
      error: importFailed ? "Failed during module/lesson creation" : undefined,
    })
  }

  revalidatePath("/admin/courses")
  return { results }
}
