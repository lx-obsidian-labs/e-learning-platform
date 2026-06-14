import { getCourseBySlug } from "@/actions/courses"
import { isEnrolled, getEnrolledCourseIds } from "@/actions/enrollments"
import { getCompletedLessonIds } from "@/actions/completions"
import { getCourseReviews } from "@/actions/reviews"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnrollButton } from "./enroll-button"
import { ReviewSection } from "./review-section"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const slug = courseId

  const [course, session, enrolledCourseIds, completedLessonIds, reviews] = await Promise.all([
    getCourseBySlug(slug),
    auth(),
    getEnrolledCourseIds(),
    getCompletedLessonIds(slug),
    getCourseReviews(slug),
  ])

  if (!course) notFound()

  const enrolled = enrolledCourseIds.includes(course.id)
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const userReview = session?.user
    ? reviews.find((r) => r.user.name === session.user.name) ?? null
    : null

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {course.category && (
                <Badge variant="secondary">{course.category.name}</Badge>
              )}
              <Badge variant={course.isFree ? "default" : "outline"}>
                {course.isFree ? "Free" : `$${Number(course.price).toFixed(2)}`}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold">{course.title}</h1>
            {course.description && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {course.description}
              </p>
            )}
          </div>

          {session ? (
            <EnrollButton courseId={course.id} enrolled={enrolled} />
          ) : (
            <Button asChild size="lg">
              <Link href="/auth/login">Login to Enroll</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={course.instructor.image ?? undefined} />
              <AvatarFallback>
                {course.instructor.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span>{course.instructor.name}</span>
          </div>
          <span>{course._count.enrollments} students</span>
          <span>{course._count.reviews} reviews</span>
          <span>{totalLessons} lessons</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.modules.map((module, idx) => {
                const modLessons = module.lessons
                const completedCount = modLessons.filter((l) =>
                  completedLessonIds.includes(l.id)
                ).length

                return (
                  <div key={module.id}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Module {idx + 1}: {module.title}
                      </h3>
                      {enrolled && completedCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {completedCount}/{modLessons.length}
                        </span>
                      )}
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                    <ul className="mt-2 space-y-1">
                      {modLessons.map((lesson, lidx) => {
                        const completed = completedLessonIds.includes(lesson.id)
                        const canView = enrolled || lesson.isPreviewable

                        return (
                          <li key={lesson.id}>
                            {canView ? (
                              <Link
                                href={`/courses/${slug}/lessons/${lesson.id}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded px-2 py-1 -mx-2 hover:bg-muted"
                              >
                                <span className={completed ? "text-green-500" : "h-1.5 w-1.5 rounded-full bg-current flex-shrink-0"}>
                                  {completed ? "✓" : null}
                                </span>
                                <span>
                                  {lidx + 1}. {lesson.title}
                                </span>
                                {lesson.isPreviewable && (
                                  <Badge variant="outline" className="text-xs">
                                    Preview
                                  </Badge>
                                )}
                                {lesson.duration && (
                                  <span className="ml-auto">{lesson.duration}min</span>
                                )}
                              </Link>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                                <span>
                                  {lidx + 1}. {lesson.title}
                                </span>
                                {lesson.duration && (
                                  <span className="ml-auto">{lesson.duration}min</span>
                                )}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor.image ?? undefined} />
                  <AvatarFallback>
                    {course.instructor.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{course.instructor.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReviewSection
        courseId={course.id}
        reviews={reviews.map((r) => ({
          ...r,
          isOwn: r.user.name === session?.user?.name,
        }))}
        canReview={enrolled}
        userReview={userReview ? { ...userReview, isOwn: true } : null}
      />
    </div>
  )
}
