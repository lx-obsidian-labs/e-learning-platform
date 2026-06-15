import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  const whereClause = userProfile.role === "ADMIN" ? {} : { instructorId: user.id }
  const instructorId = userProfile.role === "ADMIN" ? null : user.id

  let courseCount = 0
  let studentCount = 0
  let totalRevenue = 0

  if (instructorId) {
    const { count: cCount } = await admin
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('"instructorId"', instructorId)

    courseCount = cCount || 0

    const { data: courseIds } = await admin
      .from('courses')
      .select('"id"')
      .eq('"instructorId"', instructorId)

    if (courseIds && courseIds.length > 0) {
      const ids = courseIds.map((c: any) => c.id)
      const { count: sCount } = await admin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('"courseId"', ids)

      studentCount = sCount || 0

      const { data: orders } = await admin
        .from('orders')
        .select('"amount"')
        .in('"courseId"', ids)
        .eq('"status"', 'COMPLETED')

      totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0
    }
  } else {
    const { count: cCount } = await admin
      .from('courses')
      .select('*', { count: 'exact', head: true })

    courseCount = cCount || 0

    const { count: sCount } = await admin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })

    studentCount = sCount || 0

    const { data: orders } = await admin
      .from('orders')
      .select('"amount"')
      .eq('"status"', 'COMPLETED')

    totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">Create Course</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{courseCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{studentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
