import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { QuickAction } from "@/components/dashboard/quick-action"
import { BookOpen, Users, DollarSign, Star, PlusCircle, Import, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

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

  const courseQuery = admin
    .from('courses')
    .select('*')
    .order('"createdAt"', { ascending: false })

  if (instructorId) {
    courseQuery.eq('"instructorId"', instructorId)
  }

  const { data: courses } = await courseQuery

  const courseIds = (courses || []).map(c => c.id)

  let studentCount = 0
  let totalRevenue = 0
  let totalRatingSum = 0
  let totalRatingCount = 0
  let recentEnrollments: any[] = []

  if (courseIds.length > 0) {
    const { count: sCount } = await admin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('"courseId"', courseIds)
    studentCount = sCount || 0

    const { data: orders } = await admin
      .from('orders')
      .select('"amount"')
      .in('"courseId"', courseIds)
      .eq('"status"', 'COMPLETED')
    totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0

    const { data: reviews } = await admin
      .from('reviews')
      .select('"rating"')
      .in('"courseId"', courseIds)
    if (reviews && reviews.length > 0) {
      totalRatingSum = reviews.reduce((sum: number, r: any) => sum + r.rating, 0)
      totalRatingCount = reviews.length
    }

    const { data: enrollments } = await admin
      .from('enrollments')
      .select('*, courses!inner(title, slug)')
      .in('"courseId"', courseIds)
      .order('"enrolledAt"', { ascending: false })
      .limit(5)

    recentEnrollments = (enrollments || []).map((e: any) => ({
      ...e,
      courseTitle: e.courses?.title || "Unknown Course",
      courseSlug: e.courses?.slug || "",
    }))

    const { data: enrichedEnrollments } = await admin
      .from('enrollments')
      .select('*, courses!inner(title, slug)')
      .in('"courseId"', courseIds)
      .order('"enrolledAt"', { ascending: false })
      .limit(5)

    if (enrichedEnrollments) {
      recentEnrollments = await Promise.all(
        enrichedEnrollments.map(async (e: any) => {
          let studentName = "A Student"
          if (e.userId) {
            const { data: s } = await admin
              .from('users')
              .select('name')
              .eq('"id"', e.userId)
              .single()
            if (s) studentName = s.name
          }
          return {
            ...e,
            studentName,
            courseTitle: e.courses?.title || "Unknown Course",
            courseSlug: e.courses?.slug || "",
          }
        })
      )
    }
  }

  const avgRating = totalRatingCount > 0
    ? (totalRatingSum / totalRatingCount).toFixed(1)
    : "N/A"

  const publishedCount = (courses || []).filter(c => c.status === "PUBLISHED").length
  const draftCount = (courses || []).filter(c => c.status === "DRAFT").length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.name}
            {isAdminView && <Badge variant="secondary" className="ml-2">Admin View</Badge>}
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Courses"
          value={courses?.length || 0}
          description={`${publishedCount} published, ${draftCount} drafts`}
          icon={BookOpen}
          className="border-l-blue-500"
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Students"
          value={studentCount}
          icon={Users}
          className="border-l-green-500"
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          className="border-l-amber-500"
          iconClassName="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Avg. Rating"
          value={avgRating}
          icon={Star}
          className="border-l-purple-500"
          iconClassName="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Courses</h2>
            <Link
              href="/instructor/courses"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {(!courses || courses.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No courses yet. Create your first course!</p>
                <Button asChild>
                  <Link href="/instructor/courses/new">Create Course</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => {
                const { count: enrollmentCount } = { count: 0 }
                return (
                  <Link key={course.id} href={`/instructor/courses/${course.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={course.status === "PUBLISHED" ? "default" : "outline"}
                          className="shrink-0"
                        >
                          {course.status || "DRAFT"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              title="Create New Course"
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
            <QuickAction
              title="Manage Courses"
              description="Edit content, modules, and quizzes"
              href="/instructor/courses"
              icon={BookOpen}
            />
          </div>

          {recentEnrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentEnrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center gap-2 text-sm">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{enrollment.studentName}</p>
                      <p className="truncate text-xs text-muted-foreground">{enrollment.courseTitle}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
