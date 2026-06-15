import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { QuickAction } from "@/components/dashboard/quick-action"
import { Users, GraduationCap, BarChart3, DollarSign, PlusCircle, Import, Award } from "lucide-react"

export const dynamic = "force-dynamic"

interface QuizAnalytics {
  quizId: string
  quizTitle: string
  courseTitle: string
  totalAttempts: number
  avgScore: number
  passRate: number
  passingScore: number | null
}

interface MissedQuestion {
  questionText: string
  quizTitle: string
  courseTitle: string
  totalAnswers: number
  wrongCount: number
  wrongRate: number
}

export default async function InstructorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const admin = createAdminClient()

  const { data: userProfile } = await admin
    .from('users')
    .select('name, role')
    .eq('"id"', user.id)
    .single()

  if (userProfile?.role !== "INSTRUCTOR" && userProfile?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const isAdminView = userProfile.role === "ADMIN"
  const instructorId = isAdminView ? null : user.id

  const courseQuery = admin.from('courses').select('"id","title","instructorId"')
  if (instructorId) {
    courseQuery.eq('"instructorId"', instructorId)
  }
  const { data: courses } = await courseQuery
  const courseIds = (courses || []).map(c => c.id)

  let totalStudents = 0
  let totalRevenue = 0
  let completedEnrollments = 0
  let totalEnrollments = 0
  let avgProgress = 0
  let quizAnalytics: QuizAnalytics[] = []
  let missedQuestions: MissedQuestion[] = []

  if (courseIds.length > 0) {
    const { count: eCount } = await admin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('"courseId"', courseIds)
    totalEnrollments = eCount || 0

    const { count: cCount } = await admin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('"courseId"', courseIds)
      .eq('"status"', 'COMPLETED')
    completedEnrollments = cCount || 0

    const { data: progressData } = await admin
      .from('enrollments')
      .select('"progress"')
      .in('"courseId"', courseIds)
    if (progressData && progressData.length > 0) {
      avgProgress = Math.round(
        progressData.reduce((sum: number, e: any) => sum + e.progress, 0) / progressData.length
      )
    }

    const { data: orders } = await admin
      .from('orders')
      .select('"amount"')
      .in('"courseId"', courseIds)
      .eq('"status"', 'COMPLETED')
    totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0

    const { count: distinctStudents } = await admin
      .from('enrollments')
      .select('"userId"', { count: 'exact', head: true })
      .in('"courseId"', courseIds)
      .neq('"userId"', user.id)
    totalStudents = distinctStudents || 0

    const { data: modules } = await admin
      .from('modules')
      .select('"id","courseId"')
      .in('"courseId"', courseIds)
    const moduleIds = (modules || []).map(m => m.id)
    const moduleCourseMap = new Map<string, string>()
    ;(modules || []).forEach(m => moduleCourseMap.set(m.id, m.courseId))
    const courseTitleMap = new Map<string, string>()
    ;(courses || []).forEach(c => courseTitleMap.set(c.id, c.title))

    if (moduleIds.length > 0) {
      const { data: quizzes } = await admin
        .from('quizzes')
        .select('"id","title","passingScore","moduleId"')
        .in('"moduleId"', moduleIds)
      const quizIds = (quizzes || []).map(q => q.id)

      if (quizIds.length > 0) {
        for (const quiz of (quizzes || [])) {
          const { data: attempts } = await admin
            .from('quiz_attempts')
            .select('"score","total"')
            .eq('"quizId"', quiz.id)

          if (attempts && attempts.length > 0) {
            const totalAttempts = attempts.length
            const avgScore = Math.round(
              attempts.reduce((sum, a: any) => sum + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / totalAttempts
            )
            const passCount = attempts.filter((a: any) => {
              if (quiz.passingScore) {
                const pct = a.total > 0 ? (a.score / a.total) * 100 : 0
                return pct >= quiz.passingScore
              }
              return (a.total > 0 ? (a.score / a.total) * 100 : 0) >= 50
            }).length
            const passRate = Math.round((passCount / totalAttempts) * 100)

            const courseId = moduleCourseMap.get(quiz.moduleId) || ""
            quizAnalytics.push({
              quizId: quiz.id,
              quizTitle: quiz.title,
              courseTitle: courseTitleMap.get(courseId) || "Unknown",
              totalAttempts,
              avgScore,
              passRate,
              passingScore: quiz.passingScore,
            })
          }
        }

        const { data: allAttempts } = await admin
          .from('quiz_attempts')
          .select('"id"')
          .in('"quizId"', quizIds)
        const attemptIds = (allAttempts || []).map(a => a.id)

        if (attemptIds.length > 0) {
          const { data: answers } = await admin
            .from('quiz_user_answers')
            .select('"questionId","optionId"')
            .in('"attemptId"', attemptIds)

          if (answers && answers.length > 0) {
            const questionWrongCount = new Map<string, number>()
            const questionTotalCount = new Map<string, number>()

            for (const answer of answers) {
              const qId = answer.questionId
              questionTotalCount.set(qId, (questionTotalCount.get(qId) || 0) + 1)
              if (answer.optionId) {
                const { data: opt } = await admin
                  .from('quiz_answer_options')
                  .select('"isCorrect"')
                  .eq('"id"', answer.optionId)
                  .single()
                if (opt && !opt.isCorrect) {
                  questionWrongCount.set(qId, (questionWrongCount.get(qId) || 0) + 1)
                }
              }
            }

            for (const [qId, total] of questionTotalCount) {
              const wrong = questionWrongCount.get(qId) || 0
              const wrongRate = Math.round((wrong / total) * 100)
              if (wrongRate >= 40) {
                const { data: question } = await admin
                  .from('quiz_questions')
                  .select('"text","quizId"')
                  .eq('"id"', qId)
                  .single()
                if (question) {
                  const quiz = (quizzes || []).find(q => q.id === question.quizId)
                  const courseId = moduleCourseMap.get(quiz?.moduleId || "") || ""
                  missedQuestions.push({
                    questionText: question.text,
                    quizTitle: quiz?.title || "Unknown",
                    courseTitle: courseTitleMap.get(courseId) || "Unknown",
                    totalAnswers: total,
                    wrongCount: wrong,
                    wrongRate,
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  quizAnalytics.sort((a, b) => a.passRate - b.passRate)
  missedQuestions.sort((a, b) => b.wrongRate - a.wrongRate)

  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0

  const courseCount = courses?.length || 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teaching Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and performance across your {courseCount} course{courseCount !== 1 ? "s" : ""}
            {isAdminView && <Badge variant="secondary" className="ml-2">Admin View</Badge>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/instructor/import">
              <Import className="h-4 w-4 mr-2" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/instructor/courses/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          description={`Across ${courseCount} course${courseCount !== 1 ? "s" : ""}`}
          icon={Users}
          className="border-l-blue-500"
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Completion Rate"
          value={totalEnrollments > 0 ? `${completionRate}%` : "—"}
          description={`${completedEnrollments} of ${totalEnrollments} enrolled`}
          icon={GraduationCap}
          className="border-l-green-500"
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="Avg Progress"
          value={totalEnrollments > 0 ? `${avgProgress}%` : "—"}
          icon={BarChart3}
          className="border-l-purple-500"
          iconClassName="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          className="border-l-amber-500"
          iconClassName="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quiz Performance</h2>
            {quizAnalytics.length > 0 && (
              <Badge variant="outline">{quizAnalytics.length} quiz{quizAnalytics.length !== 1 ? "zes" : ""}</Badge>
            )}
          </div>

          {quizAnalytics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  No quiz data yet. Create quizzes in your courses to see performance analytics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {quizAnalytics.slice(0, 6).map((qa) => (
                <Card key={qa.quizId}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{qa.quizTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">{qa.courseTitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <Badge variant={qa.avgScore >= 70 ? "default" : qa.avgScore >= 50 ? "secondary" : "destructive"} className="text-[10px]">
                          {qa.avgScore}% avg
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {qa.totalAttempts} attempt{qa.totalAttempts !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Pass rate ({qa.passingScore || 50}% threshold)</span>
                        <span className="font-medium">{qa.passRate}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            qa.passRate >= 70 ? "bg-green-500" : qa.passRate >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${qa.passRate}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Struggling Questions</h2>
            {missedQuestions.length > 0 && (
              <Badge variant="outline">{missedQuestions.length} question{missedQuestions.length !== 1 ? "s" : ""}</Badge>
            )}
          </div>

          {missedQuestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Award className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  No frequently missed questions. Your students are doing well!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {missedQuestions.slice(0, 6).map((mq, idx) => (
                <Card key={idx}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                        mq.wrongRate >= 70 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        <span className="text-xs font-bold">{mq.wrongRate}%</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{mq.questionText}</p>
                        <p className="text-xs text-muted-foreground">
                          {mq.quizTitle} &middot; {mq.courseTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {mq.wrongCount} of {mq.totalAnswers} students answered incorrectly
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="pt-2">
            <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction
                title="Create Course"
                description="Build a new course from scratch"
                href="/instructor/courses/new"
                icon={PlusCircle}
              />
              <QuickAction
                title="Import Course"
                description="Import from external sources"
                href="/instructor/import"
                icon={Import}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
