"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { parseJSONCourses, parseCSVCourses, validateCourse } from "@/lib/course-importer"
import type { ImportedCourse, ImportedQuiz, ImportedModule, ImportedLesson } from "@/lib/course-importer"

import { randomUUID } from "crypto"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const now = () => new Date().toISOString()

type ImportReport = {
  title: string
  status: "imported" | "skipped" | "error"
  error?: string
  details?: {
    modules: number
    lessons: number
    quizzes: number
  }
}

async function importQuiz(
  admin: ReturnType<typeof createAdminClient>,
  moduleId: string,
  quiz: ImportedQuiz
): Promise<{ success: boolean; error?: string }> {
  const { data: quizRecord, error: quizErr } = await admin
    .from("quizzes")
    .insert({
      id: randomUUID(),
      title: quiz.title,
      description: quiz.description || null,
      passingScore: quiz.passingScore || null,
      moduleId,
    })
    .select('"id"')
    .single()

  if (quizErr || !quizRecord) return { success: false, error: `Failed creating quiz: ${quizErr?.message || "Unknown"}` }

  for (let qi = 0; qi < quiz.questions.length; qi++) {
    const q = quiz.questions[qi]
    const { data: questionRecord, error: qErr } = await admin
      .from("quiz_questions")
      .insert({
        id: randomUUID(),
        text: q.text,
        type: q.type,
        points: q.points || 1,
        order: qi + 1,
        quizId: quizRecord.id,
      })
      .select('"id"')
      .single()

    if (qErr || !questionRecord) return { success: false, error: `Failed creating question: ${q.text}` }

    if (q.options) {
      for (const opt of q.options) {
        const { error: optErr } = await admin.from("quiz_answer_options").insert({
          id: randomUUID(),
          text: opt.text,
          isCorrect: opt.isCorrect,
          questionId: questionRecord.id,
        })
        if (optErr) return { success: false, error: `Failed creating option: ${optErr.message}` }
      }
    }
  }

  return { success: true }
}

export async function previewImport(raw: string, format: "json" | "csv") {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  let courses: ImportedCourse[]
  try {
    courses = format === "json" ? parseJSONCourses(raw) : parseCSVCourses(raw)
  } catch {
    return { error: "Failed to parse file" }
  }

  if (!courses.length) return { error: "No courses found" }

  const preview = courses.map((course) => {
    const validationError = validateCourse(course)
    return {
      title: course.title,
      valid: !validationError,
      error: validationError,
      modules: course.modules.length,
      lessons: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
      quizzes: course.modules.filter((m) => m.quiz).length,
    }
  })

  return { courses: preview, total: preview.length, valid: preview.filter((p) => p.valid).length }
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

  const results: ImportReport[] = []

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
        const { data: newCat } = await admin
          .from("categories")
          .insert({ id: randomUUID(), name: course.category, slug: catSlug, updatedAt: now() })
          .select('"id"')
          .single()
        if (newCat) categoryId = newCat.id
      }
    }

    const courseId = randomUUID()
    const { data: newCourse, error: courseErr } = await admin
      .from("courses")
      .insert({
        id: courseId,
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
      results.push({ title: course.title, status: "error", error: courseErr?.message || "Failed to create course" })
      continue
    }

    const createdModules: string[] = []
    const createdLessons: string[] = []
    const createdQuizzes: string[] = []
    let importFailed = false
    let failureReason = ""

    for (let mi = 0; mi < course.modules.length; mi++) {
      const mod = course.modules[mi]
      const modId = randomUUID()
      const { data: newModule, error: modErr } = await admin
        .from("modules")
        .insert({
          id: modId,
          title: mod.title,
          description: mod.description || null,
          order: mi + 1,
          courseId: newCourse.id,
        })
        .select('"id"')
        .single()

      if (modErr || !newModule) {
        importFailed = true
        failureReason = `Failed creating module "${mod.title}": ${modErr?.message || "Unknown"}`
        break
      }
      createdModules.push(modId)

      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li]
        const lessonId = randomUUID()
        const { error: lessonErr } = await admin
          .from("lessons")
          .insert({
            id: lessonId,
            title: lesson.title,
            content: lesson.content || null,
            videoUrl: lesson.videoUrl || null,
            duration: lesson.duration || null,
            isPreviewable: lesson.isPreviewable || false,
            order: li + 1,
            moduleId: newModule.id,
            updatedAt: now(),
          })

        if (lessonErr) {
          importFailed = true
          failureReason = `Failed creating lesson "${lesson.title}": ${lessonErr.message}`
          break
        }
        createdLessons.push(lessonId)
      }

      if (importFailed) break

      if (mod.quiz) {
        const quizResult = await importQuiz(admin, newModule.id, mod.quiz)
        if (!quizResult.success) {
          importFailed = true
          failureReason = quizResult.error || "Failed creating quiz"
          break
        }
        createdQuizzes.push(mod.quiz.title)
      }
    }

    if (importFailed) {
      // Cleanup: remove all created data in reverse order
      for (const quizTitle of createdQuizzes) {
        // quizzes cascade to questions and options
      }
      for (const lessonId of createdLessons) {
        await admin.from("lessons").delete().eq('"id"', lessonId)
      }
      for (const modId of createdModules) {
        await admin.from("modules").delete().eq('"id"', modId)
      }
      await admin.from("courses").delete().eq('"id"', courseId)

      results.push({ title: course.title, status: "error", error: failureReason })
      continue
    }

    results.push({
      title: course.title,
      status: "imported",
      details: {
        modules: createdModules.length,
        lessons: createdLessons.length,
        quizzes: createdQuizzes.length,
      },
    })
  }

  revalidatePath("/admin/courses")
  return { results }
}

export async function importCourseFromUrl(url: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return { error: `Failed to fetch: ${res.status}` }
    const text = await res.text()

    const format = url.endsWith(".csv") ? "csv" : "json"
    return importCourses(text, format)
  } catch {
    return { error: "Failed to fetch course data from URL" }
  }
}
