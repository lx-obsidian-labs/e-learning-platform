import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProgressCard } from "@/components/dashboard/progress-card"
import { BookOpen, Clock, CheckCircle, TrendingUp, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()

  const { data: userProfile } = await admin
    .from('users')
    .select('name, email')
    .eq('"id"', user.id)
    .single()

  const { data: enrollments } = await admin
    .from('enrollments')
    .select('*')
    .eq('"userId"', user.id)
    .order('"enrolledAt"', { ascending: false })

  const enrichedEnrollments = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const { data: course } = await admin
        .from('courses')
        .select('*')
        .eq('"id"', enrollment.courseId)
        .single()

      if (!course) return { ...enrollment, course: null }

      const { data: instructor } = await admin
        .from('users')
        .select('name')
        .eq('"id"', course.instructorId)
        .single()

      const { data: modules } = await admin
        .from('modules')
        .select('*, lessons:lessons(id)')
        .eq('"courseId"', course.id)
        .order('"order"', { ascending: true })

      return { ...enrollment, course: { ...course, instructor, modules } }
    })
  )

  const displayName = userProfile?.name || user.email?.split("@")[0] || "Learner"
  const validEnrollments = enrichedEnrollments.filter(e => e.course)
  const completedCourses = validEnrollments.filter(e => e.status === "COMPLETED")
  const inProgressCourses = validEnrollments.filter(e => e.status === "IN_PROGRESS")
  const notStartedCourses = validEnrollments.filter(e => e.status === "NOT_STARTED")

  const totalLessonsCount = validEnrollments.reduce((sum, e) => {
    const lessons = e.course.modules?.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0) || 0
    return sum + lessons
  }, 0)

  const avgProgress = validEnrollments.length > 0
    ? Math.round(validEnrollments.reduce((sum, e) => sum + e.progress, 0) / validEnrollments.length)
    : 0

  const completionRate = validEnrollments.length > 0
    ? Math.round((completedCourses.length / validEnrollments.length) * 100)
    : 0

  const continueLearning = [...inProgressCourses].sort((a, b) => b.progress - a.progress)

  const { data: completedLessonIds } = await admin
    .from("lesson_completions")
    .select("lessonId")
    .eq('"userId"', user.id)

  const totalCompletedLessons = completedLessonIds?.length || 0

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {inProgressCourses.length > 0
                ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? "s" : ""} in progress. Keep going!`
                : validEnrollments.length === 0
                  ? "Start your learning journey by enrolling in a course."
                  : "Great job! You've completed all your courses."}
            </p>
          </div>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Enrolled"
            value={validEnrollments.length}
            icon={BookOpen}
            className="border-l-blue-500"
            iconClassName="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="In Progress"
            value={inProgressCourses.length}
            icon={Clock}
            className="border-l-green-500"
            iconClassName="bg-green-100 text-green-600"
          />
          <StatCard
            title="Completed"
            value={completedCourses.length}
            icon={CheckCircle}
            className="border-l-purple-500"
            iconClassName="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            description={`${totalCompletedLessons} lessons done`}
            icon={TrendingUp}
            className="border-l-amber-500"
            iconClassName="bg-amber-100 text-amber-600"
          />
        </div>

        {validEnrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-lg text-muted-foreground">
                You haven&apos;t enrolled in any courses yet
              </p>
              <Button asChild>
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {continueLearning.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Continue Learning</h2>
                  <Link href="/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
                    Browse all courses <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {continueLearning.slice(0, 6).map((enrollment, idx) => {
                    const totalLessons = enrollment.course.modules?.reduce(
                      (sum: number, m: any) => sum + (m.lessons?.length || 0), 0
                    ) || 0
                    return (
                      <ProgressCard
                        key={enrollment.id}
                        title={enrollment.course.title}
                        slug={enrollment.course.slug}
                        instructorName={enrollment.course.instructor?.name}
                        progress={enrollment.progress}
                        status={enrollment.status}
                        totalLessons={totalLessons}
                        gradient={`from-blue-600 to-purple-600 from-emerald-600 to-teal-600 from-orange-600 to-red-600 from-pink-600 to-rose-600 from-indigo-600 to-blue-600 from-teal-600 to-cyan-600`.split(" ")[idx % 6]}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {notStartedCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Not Started</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {notStartedCourses.slice(0, 3).map((enrollment, idx) => {
                    const totalLessons = enrollment.course.modules?.reduce(
                      (sum: number, m: any) => sum + (m.lessons?.length || 0), 0
                    ) || 0
                    return (
                      <ProgressCard
                        key={enrollment.id}
                        title={enrollment.course.title}
                        slug={enrollment.course.slug}
                        instructorName={enrollment.course.instructor?.name}
                        progress={enrollment.progress}
                        status={enrollment.status}
                        totalLessons={totalLessons}
                        gradient={`from-blue-600 to-purple-600 from-emerald-600 to-teal-600 from-orange-600 to-red-600 from-pink-600 to-rose-600 from-indigo-600 to-blue-600 from-teal-600 to-cyan-600`.split(" ")[(idx + continueLearning.length) % 6]}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {completedCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Completed Courses
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({completedCourses.length})
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.slice(0, 3).map((enrollment, idx) => (
                    <ProgressCard
                      key={enrollment.id}
                      title={enrollment.course.title}
                      slug={enrollment.course.slug}
                      instructorName={enrollment.course.instructor?.name}
                      progress={100}
                      status="COMPLETED"
                      totalLessons={0}
                      gradient="from-green-600 to-emerald-600"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
