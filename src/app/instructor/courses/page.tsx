import { getInstructorCourses } from "@/actions/courses"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function InstructorCoursesPage() {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
    redirect("/login")
  }

  const courses = await getInstructorCourses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">Create Course</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-lg text-muted-foreground">No courses yet</p>
            <Button asChild>
              <Link href="/instructor/courses/new">Create Your First Course</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <Badge
                    variant={
                      course.status === "PUBLISHED"
                        ? "default"
                        : course.status === "DRAFT"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{course.modules.length} modules</span>
                  <span>{course._count.enrollments} students</span>
                  {course.isFree ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>${course.price.toFixed(2)}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/instructor/courses/${course.id}`}>Edit</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/courses/${course.slug}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
