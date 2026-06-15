import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArchiveCourseButton } from "@/components/archive-course-button"

export const dynamic = "force-dynamic"

const gradients = [
  "from-blue-600 to-purple-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-red-600",
  "from-pink-600 to-rose-600",
  "from-indigo-600 to-blue-600",
  "from-teal-600 to-cyan-600",
]

export default async function InstructorCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const admin = createAdminClient()

  const { data: userProfile } = await admin
    .from('users')
    .select('role, id')
    .eq('"id"', user.id)
    .single()

  if (!userProfile || userProfile.role === "STUDENT") redirect("/login")

  let courses: any[] = []

  if (userProfile.role === "ADMIN") {
    const { data } = await admin
      .from('courses')
      .select('*')
      .order('"createdAt"', { ascending: false })
    courses = data || []
  } else {
    const { data } = await admin
      .from('courses')
      .select('*')
      .eq('"instructorId"', userProfile.id)
      .order('"createdAt"', { ascending: false })
    courses = data || []
  }

  const enrichedCourses = await Promise.all(
    courses.map(async (course: any) => {
      const { data: modules } = await admin
        .from('modules')
        .select('id, lessons:id')
        .eq('"courseId"', course.id)

      const { count: enrollmentCount } = await admin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('"courseId"', course.id)

      const lessonCount = (modules || []).reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)

      return {
        ...course,
        moduleCount: (modules || []).length,
        lessonCount,
        _count: { enrollments: enrollmentCount || 0 },
      }
    })
  )

  const publishedCount = enrichedCourses.filter((c: any) => c.status === "PUBLISHED").length
  const draftCount = enrichedCourses.filter((c: any) => c.status === "DRAFT").length
  const totalStudents = enrichedCourses.reduce((sum: number, c: any) => sum + c._count.enrollments, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your course catalog</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">Create Course</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Total Courses</p>
            <p className="text-2xl font-bold">{enrichedCourses.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold">{draftCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
      </div>

      {enrichedCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-lg text-muted-foreground">No courses yet</p>
            <Button asChild>
              <Link href="/instructor/courses/new">Create Your First Course</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrichedCourses.map((course: any) => {
            const g = gradients[course.title.length % gradients.length]
            return (
              <Card key={course.id} className="overflow-hidden card-hover">
                {course.thumbnail ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className={`h-2 bg-gradient-to-r ${g}`} />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base">{course.title}</CardTitle>
                    <Badge
                      variant={
                        course.status === "PUBLISHED" ? "default"
                        : course.status === "DRAFT" ? "secondary"
                        : "outline"
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      {course._count.enrollments} students
                    </span>
                    <span>{course.moduleCount} modules</span>
                    {course.isFree ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span>${Number(course.price).toFixed(2)}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2 pt-0 border-t px-6 py-3">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/instructor/courses/${course.id}`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/courses/${course.slug}`}>View</Link>
                  </Button>
                  <ArchiveCourseButton courseId={course.id} compact />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
