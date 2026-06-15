import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { QuickAction } from "@/components/dashboard/quick-action"
import { BookOpen, Users, GraduationCap, DollarSign, BarChart3, Download, Settings } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") redirect("/dashboard")

  const { count: courseCount } = await admin.from("courses").select("*", { count: "exact", head: true })
  const { count: userCount } = await admin.from("users").select("*", { count: "exact", head: true })
  const { count: enrollmentCount } = await admin.from("enrollments").select("*", { count: "exact", head: true })

  const { count: publishedCount } = await admin
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq('"status"', "PUBLISHED")

  const { count: draftCount } = await admin
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq('"status"', "DRAFT")

  const { count: instructorCount } = await admin
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq('"role"', "INSTRUCTOR")

  const { count: studentCount } = await admin
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq('"role"', "STUDENT")

  const { count: adminCount } = await admin
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq('"role"', "ADMIN")

  const { data: orders } = await admin
    .from('orders')
    .select('"amount"')
    .eq('"status"', "COMPLETED")
  const totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0

  const { count: completedEnrollments } = await admin
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq('"status"', "COMPLETED")

  const { data: topCourses } = await admin
    .from("courses")
    .select("*")
    .eq('"status"', "PUBLISHED")
    .order('"rating"', { ascending: false })
    .limit(5)

  const topCoursesWithMeta = await Promise.all(
    (topCourses || []).map(async (course) => {
      const { count: ec } = await admin
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq('"courseId"', course.id)

      const { data: instructor } = await admin
        .from("users")
        .select("name")
        .eq('"id"', course.instructorId)
        .single()

      return { ...course, enrollmentCount: ec || 0, instructorName: instructor?.name || "Unknown" }
    })
  )

  const { data: recentCourses } = await admin
    .from("courses")
    .select("*")
    .order('"createdAt"', { ascending: false })
    .limit(5)

  const recentCoursesWithMeta = await Promise.all(
    (recentCourses || []).map(async (course) => {
      const { data: instructor } = await admin
        .from("users")
        .select("name")
        .eq('"id"', course.instructorId)
        .single()
      return { ...course, instructorName: instructor?.name || "Unknown" }
    })
  )

  const completionRate = enrollmentCount && enrollmentCount > 0
    ? Math.round(((completedEnrollments || 0) / enrollmentCount) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={userCount || 0}
          description={`${studentCount || 0} students, ${instructorCount || 0} instructors`}
          icon={Users}
          className="border-l-blue-500"
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Courses"
          value={courseCount || 0}
          description={`${publishedCount || 0} published, ${draftCount || 0} drafts`}
          icon={BookOpen}
          className="border-l-green-500"
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="Enrollments"
          value={enrollmentCount || 0}
          description={`${completionRate}% completion rate`}
          icon={GraduationCap}
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Top Rated Courses</h2>
            {topCoursesWithMeta.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No published courses yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {topCoursesWithMeta.map((course, idx) => (
                  <Card key={course.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg font-bold text-muted-foreground w-6 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.instructorName} &middot; {course.enrollmentCount} enrollments
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {course.rating > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {Number(course.rating).toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
            <div className="space-y-3">
              {recentCoursesWithMeta.map((course) => (
                <Card key={course.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.instructorName} &middot; {new Date(course.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={course.status === "PUBLISHED" ? "default" : "outline"} className="shrink-0">
                      {course.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              title="Import Courses"
              description="Upload JSON/CSV or import from LMS"
              href="/admin/import"
              icon={Download}
            />
            <QuickAction
              title="Manage Courses"
              description="View and edit all platform courses"
              href="/admin/courses"
              icon={BookOpen}
            />
            <QuickAction
              title="Analytics"
              description="View platform-wide analytics"
              href="/admin"
              icon={BarChart3}
            />
            <QuickAction
              title="Settings"
              description="Platform configuration"
              href="/admin"
              icon={Settings}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">User Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Students</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: userCount ? `${((studentCount || 0) / userCount) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="font-medium text-xs w-10 text-right">{studentCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Instructors</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: userCount ? `${((instructorCount || 0) / userCount) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="font-medium text-xs w-10 text-right">{instructorCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Admins</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: userCount ? `${((adminCount || 0) / userCount) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="font-medium text-xs w-10 text-right">{adminCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
