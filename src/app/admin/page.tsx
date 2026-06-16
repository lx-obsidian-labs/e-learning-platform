import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { requireAdmin, getPlatformStats, getRecentActivity, getRevenueData } from "@/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/stat-card"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { ActivityFeed } from "@/components/admin/activity-feed"
import { Users, BookOpen, GraduationCap, DollarSign, Activity, TrendingUp, UserPlus, FileText, MessageSquare } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin Dashboard - Edu Learn" }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") redirect("/dashboard")

  const stats = await getPlatformStats()
  const activities = await getRecentActivity()
  const revenueData = await getRevenueData()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full">
          <p className="lead">{stats?.totalUsers ?? 0} total users · {stats?.totalCourses ?? 0} courses · {stats?.totalEnrollments ?? 0} enrollments</p>
        </div>
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          description={`${stats?.totalStudents ?? 0} students, ${stats?.totalInstructors ?? 0} instructors`}
          icon={Users}
          className="border-l-blue-500"
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Courses"
          value={stats?.totalCourses ?? 0}
          icon={BookOpen}
          className="border-l-green-500"
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="Enrollments"
          value={stats?.totalEnrollments ?? 0}
          description={`${stats?.avgCompletionRate ?? 0}% completion rate`}
          icon={GraduationCap}
          className="border-l-purple-500"
          iconClassName="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Lessons Completed"
          value={stats?.totalLessonsCompleted ?? 0}
          icon={FileText}
          className="border-l-cyan-500"
          iconClassName="bg-cyan-100 text-cyan-600"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents ?? 0}
          icon={UserPlus}
          className="border-l-amber-500"
          iconClassName="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Instructors"
          value={stats?.totalInstructors ?? 0}
          icon={TrendingUp}
          className="border-l-rose-500"
          iconClassName="bg-rose-100 text-rose-600"
        />
        <StatCard
          title="New This Month"
          value={`${(stats?.newUsersThisMonth ?? 0) + (stats?.newEnrollmentsThisMonth ?? 0)}`}
          description={`${stats?.newUsersThisMonth ?? 0} users, ${stats?.newEnrollmentsThisMonth ?? 0} enrollments`}
          icon={Activity}
          className="border-l-indigo-500"
          iconClassName="bg-indigo-100 text-indigo-600"
        />
        {stats?.totalRevenue !== undefined && (
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            className="border-l-emerald-500"
            iconClassName="bg-emerald-100 text-emerald-600"
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {revenueData.length > 0 && <RevenueChart data={revenueData} />}

          <ActivityFeed activities={activities} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/users" className="block">
              <Card variant="pro" className="cursor-pointer">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage users and roles</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/courses" className="block">
              <Card variant="pro" className="cursor-pointer">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Course Management</p>
                    <p className="text-xs text-muted-foreground">Manage courses and content</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/discussions" className="block">
              <Card variant="pro" className="cursor-pointer">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Content Moderation</p>
                    <p className="text-xs text-muted-foreground">Manage discussions and content</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card variant="pro">
            <CardHeader>
              <CardTitle className="text-sm">Platform Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Users</span>
                <span className="font-medium">{stats?.totalUsers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Courses</span>
                <span className="font-medium">{stats?.totalCourses ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enrollments</span>
                <span className="font-medium">{stats?.totalEnrollments ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{stats?.avgCompletionRate ?? 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
