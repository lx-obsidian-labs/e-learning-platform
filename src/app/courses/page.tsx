import { getPublishedCourses } from "@/actions/courses"
import { getCategories } from "@/actions/categories"
import Link from "next/link"

export const dynamic = "force-dynamic"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
  ])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Explore Courses</h1>
        <p className="text-lg text-muted-foreground">
          Discover courses from expert instructors
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/courses?category=${cat.slug}`}
            className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-secondary"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No courses available yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.instructor.image ?? undefined} />
                    <AvatarFallback>
                      {course.instructor.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">
                    {course.instructor.name}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {course.rating > 0 && (
                      <span className="text-yellow-500">★</span>
                    )}
                    {course.rating > 0 ? course.rating.toFixed(1) : ""}
                  </span>
                  <span>{course._count.enrollments} enrolled</span>
                  <span>{course._count.reviews} reviews</span>
                </div>
                {course.category && (
                  <Badge variant="secondary">{course.category.name}</Badge>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {course.isFree ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${Number(course.price).toFixed(2)}`
                  )}
                </span>
                <Button asChild>
                  <Link href={`/courses/${course.slug}`}>View Course</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
