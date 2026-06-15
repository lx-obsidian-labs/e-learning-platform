import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound, redirect } from "next/navigation"
import { QuizForm } from "./quiz-form"

export const dynamic = "force-dynamic"

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>
}) {
  const { courseId: slug, quizId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()

  const { data: quiz } = await admin
    .from('quizzes')
    .select('*, module:modules(*, course:courses("slug"))')
    .eq('"id"', quizId)
    .single()

  if (!quiz || quiz.module?.course?.slug !== slug) notFound()

  const { data: questions } = await admin
    .from('quiz_questions')
    .select('*, options:quiz_answer_options(*)')
    .eq('"quizId"', quiz.id)
    .order('"order"', { ascending: true })

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('*')
    .eq('"userId"', user.id)
    .eq('"courseId"', quiz.module.courseId)
    .maybeSingle()

  if (!enrollment) redirect(`/courses/${slug}`)

  const { data: previousAttempts } = await admin
    .from('quiz_attempts')
    .select('*')
    .eq('"userId"', user.id)
    .eq('"quizId"', quizId)
    .order('"startedAt"', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-16 sm:pt-20 px-4 sm:px-6">
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
          {(questions || []).length} questions
        </p>
      </div>

      {previousAttempts && previousAttempts.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Previous Attempts</h2>
          {previousAttempts.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <span>
                {new Date(a.startedAt).toLocaleDateString()} &mdash; Score: {a.score}/{a.total}
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
        questions={(questions || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          points: q.points,
          options: (q.options || []).map((o: any) => ({
            id: o.id,
            text: o.text,
          })),
        }))}
      />
    </div>
  )
}
