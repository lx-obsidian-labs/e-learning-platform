"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { z } from "zod"

const quizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  passingScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
})

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  points: z.coerce.number().int().min(1).default(1),
})

async function verifyModuleAccess(moduleId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return null

  const supabase = createAdminClient()
  const { data: mod } = await supabase
    .from("modules")
    .select("*")
    .eq('"id"', moduleId)
    .single()

  if (!mod) return null

  const { data: course } = await supabase
    .from("courses")
    .select('"instructorId"')
    .eq('"id"', mod.courseId)
    .single()

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) return null

  return mod
}

// --- Quiz CRUD ---

export async function createQuiz(moduleId: string, formData: FormData) {
  const mod = await verifyModuleAccess(moduleId)
  if (!mod) return { error: "Unauthorized" }

  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    passingScore: formData.get("passingScore") || null,
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createAdminClient()
  try {
    const { error } = await supabase
      .from("quizzes")
      .insert({
        id: randomUUID(),
        title: parsed.data.title,
        description: parsed.data.description || null,
        passingScore: parsed.data.passingScore ?? null,
        moduleId,
      })

    if (error) return { error: "Failed to create quiz" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create quiz" }
  }
}

export async function updateQuiz(quizId: string, formData: FormData) {
  const supabase = createAdminClient()
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq('"id"', quizId)
    .single()

  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    passingScore: formData.get("passingScore") || null,
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  try {
    const { error } = await supabase
      .from("quizzes")
      .update(parsed.data)
      .eq('"id"', quizId)

    if (error) return { error: "Failed to update quiz" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update quiz" }
  }
}

export async function deleteQuiz(quizId: string) {
  const supabase = createAdminClient()
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq('"id"', quizId)
    .single()

  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  try {
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq('"id"', quizId)

    if (error) return { error: "Failed to delete quiz" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to delete quiz" }
  }
}

// --- Questions ---

export async function addQuestion(quizId: string, formData: FormData) {
  const supabase = createAdminClient()
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq('"id"', quizId)
    .single()

  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  const parsed = questionSchema.safeParse({
    text: formData.get("text"),
    type: formData.get("type") || "MULTIPLE_CHOICE",
    points: formData.get("points") || 1,
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: lastQ } = await supabase
    .from("quiz_questions")
    .select('"order"')
    .eq('"quizId"', quizId)
    .order('"order"', { ascending: false })
    .limit(1)
    .maybeSingle()

  try {
    const { data: question, error } = await supabase
      .from("quiz_questions")
      .insert({
        id: randomUUID(),
        text: parsed.data.text,
        type: parsed.data.type,
        points: parsed.data.points,
        order: (lastQ?.order ?? 0) + 1,
        quizId,
      })
      .select('"id"')
      .single()

    if (error) return { error: "Failed to add question" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true, questionId: question.id }
  } catch {
    return { error: "Failed to add question" }
  }
}

export async function removeQuestion(questionId: string) {
  const supabase = createAdminClient()
  const { data: q } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq('"id"', questionId)
    .single()

  if (!q) return { error: "Not found" }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select('"moduleId"')
    .eq('"id"', q.quizId)
    .single()

  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  try {
    const { error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq('"id"', questionId)

    if (error) return { error: "Failed to remove question" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to remove question" }
  }
}

// --- Answer Options ---

export async function addOption(questionId: string, formData: FormData) {
  const supabase = createAdminClient()
  const { data: q } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq('"id"', questionId)
    .single()

  if (!q) return { error: "Not found" }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select('"moduleId"')
    .eq('"id"', q.quizId)
    .single()

  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  const text = formData.get("text") as string
  const isCorrect = formData.get("isCorrect") === "true" || formData.get("isCorrect") === "on"

  if (!text?.trim()) return { error: "Option text is required" }

  try {
    const { error } = await supabase
      .from("quiz_answer_options")
      .insert({ id: randomUUID(), text, isCorrect, questionId })

    if (error) return { error: "Failed to add option" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to add option" }
  }
}

export async function removeOption(optionId: string) {
  const supabase = createAdminClient()
  const { data: opt } = await supabase
    .from("quiz_answer_options")
    .select("*")
    .eq('"id"', optionId)
    .single()

  if (!opt) return { error: "Not found" }

  const { data: question } = await supabase
    .from("quiz_questions")
    .select('"quizId"')
    .eq('"id"', opt.questionId)
    .single()

  if (!question) return { error: "Not found" }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select('"moduleId"')
    .eq('"id"', question.quizId)
    .single()

  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  try {
    const { error } = await supabase
      .from("quiz_answer_options")
      .delete()
      .eq('"id"', optionId)

    if (error) return { error: "Failed to remove option" }

    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to remove option" }
  }
}

// --- Taking a quiz ---

export async function submitQuizAttempt(
  quizId: string,
  answers: { questionId: string; optionId?: string; textAnswer?: string }[]
) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq('"id"', quizId)
    .single()

  if (!quiz) return { error: "Quiz not found" }

  const { data: mod } = await supabase
    .from("modules")
    .select('"courseId"')
    .eq('"id"', quiz.moduleId)
    .single()

  if (!mod) return { error: "Quiz not found" }

  const { data: course } = await supabase
    .from("courses")
    .select('"slug"')
    .eq('"id"', mod.courseId)
    .single()

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select('"id"')
    .eq('"userId"', user.id)
    .eq('"courseId"', mod.courseId)
    .maybeSingle()

  if (!enrollment) return { error: "Not enrolled" }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq('"quizId"', quizId)
    .order('"order"', { ascending: true })

  const questionsWithOptions = await Promise.all(
    (questions || []).map(async (question) => {
      const { data: options } = await supabase
        .from("quiz_answer_options")
        .select("*")
        .eq('"questionId"', question.id)
      return { ...question, options: options || [] }
    })
  )

  let total = 0
  let score = 0

  for (const question of questionsWithOptions) {
    total += question.points
    const answer = answers.find((a) => a.questionId === question.id)
    if (!answer) continue

    if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
      const correct = question.options.find((o: { isCorrect: boolean; id: string }) => o.isCorrect)
      if (correct && answer.optionId === correct.id) {
        score += question.points
      }
    } else if (question.type === "SHORT_ANSWER") {
      const correct = question.options.find((o: { isCorrect: boolean; text: string }) => o.isCorrect)
      if (
        correct &&
        answer.textAnswer?.toLowerCase().trim() === correct.text.toLowerCase().trim()
      ) {
        score += question.points
      }
    }
  }

  try {
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        id: randomUUID(),
        userId: user.id,
        quizId,
        score,
        total,
        completedAt: new Date().toISOString(),
      })
      .select('"id","score","total"')
      .single()

    if (attemptError) return { error: "Failed to submit quiz" }

    for (const a of answers) {
      const { error: ansError } = await supabase
        .from("quiz_user_answers")
        .insert({
          id: randomUUID(),
          attemptId: attempt.id,
          questionId: a.questionId,
          optionId: a.optionId || null,
          textAnswer: a.textAnswer || null,
        })

      if (ansError) return { error: "Failed to submit quiz" }
    }

    revalidatePath(`/courses/${course?.slug || mod.courseId}`)
    return { success: true, attempt }
  } catch {
    return { error: "Failed to submit quiz" }
  }
}

export async function getQuizAttempts(quizId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq('"userId"', user.id)
    .eq('"quizId"', quizId)
    .order('"startedAt"', { ascending: false })

  const attemptsWithAnswers = await Promise.all(
    (attempts || []).map(async (attempt) => {
      const { data: answers } = await supabase
        .from("quiz_user_answers")
        .select("*")
        .eq('"attemptId"', attempt.id)
      return { ...attempt, answers: answers || [] }
    })
  )

  return attemptsWithAnswers
}
