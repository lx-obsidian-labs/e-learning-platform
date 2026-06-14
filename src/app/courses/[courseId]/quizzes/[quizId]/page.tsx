import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { QuizForm } from "./quiz-form"

export const dynamic = "force-dynamic"

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>
}) {
  const { courseId: slug, quizId } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      module: { include: { course: true } },
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  })

  if (!quiz || quiz.module.course.slug !== slug) notFound()

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: quiz.module.courseId } },
  })
  if (!enrollment) redirect(`/courses/${slug}`)

  const previousAttempts = await prisma.quizAttempt.findMany({
    where: { userId: session.user.id, quizId },
    orderBy: { startedAt: "desc" },
    take: 5,
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-muted-foreground">{quiz.description}</p>
        )}
        {quiz.passingScore && (
          <p className="text-sm text-muted-foreground">
            Passing score: {quiz.passingScore}%
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {quiz.questions.length} questions
        </p>
      </div>

      {previousAttempts.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Previous Attempts</h2>
          {previousAttempts.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <span>
                {new Date(a.startedAt).toLocaleDateString()} — Score: {a.score}/{a.total}
              </span>
              <span className={a.score !== null && a.total && a.score >= a.total * (quiz.passingScore ?? 50) / 100 ? "text-green-600 font-medium" : "text-destructive"}>
                {a.score !== null && a.total
                  ? `${Math.round((a.score / a.total) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}

      <QuizForm
        quizId={quiz.id}
        questions={quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.text,
          })),
        }))}
      />
    </div>
  )
}
