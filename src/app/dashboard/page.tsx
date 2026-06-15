import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  const displayName = userProfile?.name || user.email
  const validEnrollments = enrichedEnrollments.filter(e => e.course)
  const completedCourses = validEnrollments.filter(e => e.status === "COMPLETED")
  const inProgressCourses = validEnrollments.filter(e => e.status === "IN_PROGRESS")

  const totalLessonsCount = validEnrollments.reduce((sum, e) => {
    const lessons = e.course.modules?.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0) || 0
    return sum + lessons
  }, 0)

  return (
    <div className="space-y-8 pt-16 sm:pt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1">Track your learning progress</p>
        </div>
        <Button asChild>
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-2xl font-bold">{validEnrollments.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCourses.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCourses.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lessons</p>
                <p className="text-2xl font-bold">{totalLessonsCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
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
        <div>
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validEnrollments.map((enrollment, idx) => {
              const totalLessons = enrollment.course.modules?.reduce(
                (sum: number, m: any) => sum + (m.lessons?.length || 0),
                0
              ) || 0

              const gradientColors = [
                "from-blue-600 to-purple-600",
                "from-emerald-600 to-teal-600",
                "from-orange-600 to-red-600",
                "from-pink-600 to-rose-600",
                "from-indigo-600 to-blue-600",
                "from-teal-600 to-cyan-600",
              ]
              const grad = gradientColors[idx % gradientColors.length]

              return (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.course.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden card-hover h-full">
                    <div className={`h-20 bg-gradient-to-br ${grad} relative`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {enrollment.course.title}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{enrollment.course.instructor?.name}</span>
                        <Badge
                          variant={
                            enrollment.status === "COMPLETED"
                              ? "default"
                              : enrollment.status === "IN_PROGRESS"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {enrollment.status === "NOT_STARTED"
                            ? "Not Started"
                            : enrollment.status === "IN_PROGRESS"
                              ? "In Progress"
                              : "Completed"}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {totalLessons} lessons
                        </span>
                        <span className="group-hover:text-primary transition-colors font-medium text-xs">
                          {enrollment.status === "COMPLETED" ? "Review &rarr;" : "Continue &rarr;"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
