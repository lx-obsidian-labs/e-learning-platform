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

  const lastLessonRedirect = (courseId: string) => {
    return `/courses/${courseId}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {displayName}
          </h1>
          <p className="text-muted-foreground">Your learning dashboard</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>

      {!enrichedEnrollments || enrichedEnrollments.length === 0 || enrichedEnrollments.every(e => !e.course) ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg text-muted-foreground">
              You haven&apos;t enrolled in any courses yet
            </p>
            <Button asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrichedEnrollments.filter(e => e.course).map((enrollment) => {
            const totalLessons = enrollment.course.modules?.reduce(
              (sum: number, m: any) => sum + (m.lessons?.length || 0),
              0
            ) || 0

            return (
              <Card key={enrollment.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base">
                    {enrollment.course.title}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {enrollment.course.instructor?.name}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {totalLessons} lessons
                    </Badge>
                    <Badge
                      variant={
                        enrollment.status === "COMPLETED"
                          ? "default"
                          : enrollment.status === "IN_PROGRESS"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {enrollment.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <Button className="w-full" size="sm" asChild>
                    <Link href={lastLessonRedirect(enrollment.course.slug)}>
                      {enrollment.status === "COMPLETED"
                        ? "Review Course"
                        : "Continue Learning"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
