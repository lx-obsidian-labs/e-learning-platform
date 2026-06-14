"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
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
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") return null

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  })
  if (!mod || (mod.course.instructorId !== session.user.id && session.user.role !== "ADMIN")) return null

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

  try {
    await prisma.quiz.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        passingScore: parsed.data.passingScore ?? null,
        moduleId,
      },
    })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to create quiz" }
  }
}

export async function updateQuiz(quizId: string, formData: FormData) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  })
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
    await prisma.quiz.update({ where: { id: quizId }, data: parsed.data })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to update quiz" }
  }
}

export async function deleteQuiz(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  })
  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  try {
    await prisma.quiz.delete({ where: { id: quizId } })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to delete quiz" }
  }
}

// --- Questions ---

export async function addQuestion(quizId: string, formData: FormData) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  })
  if (!quiz) return { error: "Not found" }

  const mod = await verifyModuleAccess(quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  const parsed = questionSchema.safeParse({
    text: formData.get("text"),
    type: formData.get("type") || "MULTIPLE_CHOICE",
    points: formData.get("points") || 1,
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const lastQ = await prisma.quizQuestion.findFirst({
    where: { quizId },
    orderBy: { order: "desc" },
  })

  try {
    const question = await prisma.quizQuestion.create({
      data: {
        text: parsed.data.text,
        type: parsed.data.type,
        points: parsed.data.points,
        order: (lastQ?.order ?? 0) + 1,
        quizId,
      },
    })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true, questionId: question.id }
  } catch {
    return { error: "Failed to add question" }
  }
}

export async function removeQuestion(questionId: string) {
  const q = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { module: { include: { course: true } } } } },
  })
  if (!q) return { error: "Not found" }

  const mod = await verifyModuleAccess(q.quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  try {
    await prisma.quizQuestion.delete({ where: { id: questionId } })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to remove question" }
  }
}

// --- Answer Options ---

export async function addOption(questionId: string, formData: FormData) {
  const q = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { module: { include: { course: true } } } } },
  })
  if (!q) return { error: "Not found" }

  const mod = await verifyModuleAccess(q.quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  const text = formData.get("text") as string
  const isCorrect = formData.get("isCorrect") === "true" || formData.get("isCorrect") === "on"

  if (!text?.trim()) return { error: "Option text is required" }

  try {
    await prisma.quizAnswerOption.create({
      data: { text, isCorrect, questionId },
    })
    revalidatePath(`/instructor/courses/${mod.courseId}`)
    return { success: true }
  } catch {
    return { error: "Failed to add option" }
  }
}

export async function removeOption(optionId: string) {
  const opt = await prisma.quizAnswerOption.findUnique({
    where: { id: optionId },
    include: { question: { include: { quiz: { include: { module: { include: { course: true } } } } } } },
  })
  if (!opt) return { error: "Not found" }

  const mod = await verifyModuleAccess(opt.question.quiz.moduleId)
  if (!mod) return { error: "Unauthorized" }

  try {
    await prisma.quizAnswerOption.delete({ where: { id: optionId } })
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
  const session = await auth()
  if (!session?.user) return { error: "Not authenticated" }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
        orderBy: { order: "asc" },
      },
      module: { include: { course: true } },
    },
  })
  if (!quiz) return { error: "Quiz not found" }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: quiz.module.courseId } },
  })
  if (!enrollment) return { error: "Not enrolled" }

  let total = 0
  let score = 0

  for (const question of quiz.questions) {
    total += question.points
    const answer = answers.find((a) => a.questionId === question.id)
    if (!answer) continue

    if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
      const correct = question.options.find((o) => o.isCorrect)
      if (correct && answer.optionId === correct.id) {
        score += question.points
      }
    } else if (question.type === "SHORT_ANSWER") {
      const correct = question.options.find((o) => o.isCorrect)
      if (
        correct &&
        answer.textAnswer?.toLowerCase().trim() === correct.text.toLowerCase().trim()
      ) {
        score += question.points
      }
    }
  }

  try {
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        total,
        completedAt: new Date(),
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId || null,
            textAnswer: a.textAnswer || null,
          })),
        },
      },
    })

    revalidatePath(`/courses/${quiz.module.course.slug}`)
    return { success: true, attempt }
  } catch {
    return { error: "Failed to submit quiz" }
  }
}

export async function getQuizAttempts(quizId: string) {
  const session = await auth()
  if (!session?.user) return []

  return prisma.quizAttempt.findMany({
    where: { userId: session.user.id, quizId },
    orderBy: { startedAt: "desc" },
    include: { answers: true },
  })
}
