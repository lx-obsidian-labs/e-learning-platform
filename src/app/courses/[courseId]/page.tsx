import { getCompletedLessonIds } from "@/actions/completions"
import { getCourseReviews } from "@/actions/reviews"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

  const admin = createAdminClient()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: course } = await admin
    .from('courses')
    .select('*')
    .eq('"slug"', slug)
    .single()

  if (!course) notFound()

  const { data: category } = await admin
    .from('categories')
    .select('name')
    .eq('"id"', course.categoryId)
    .maybeSingle()

  const { data: instructor } = await admin
    .from('users')
    .select('name, image')
    .eq('"id"', course.instructorId)
    .single()

  const { data: modules } = await admin
    .from('modules')
    .select('*, lessons:lessons(*)')
    .eq('"courseId"', course.id)
    .order('"order"', { ascending: true })

  const { count: enrollmentCount } = await admin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('"courseId"', course.id)

  const { count: reviewCount } = await admin
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('"courseId"', course.id)

  let enrolledCourseIds: string[] = []
  let completedLessonIds: string[] = []
  let reviews: any[] = []

  if (user) {
    const { data: enrollments } = await admin
      .from('enrollments')
      .select('"courseId"')
      .eq('"userId"', user.id)

    enrolledCourseIds = (enrollments || []).map((e: any) => e.courseId)

    const { data: completions } = await admin
      .from('lesson_completions')
      .select('"lessonId"')
      .eq('"userId"', user.id)

    completedLessonIds = (completions || []).map((c: any) => c.lessonId)

    reviews = await getCourseReviews(slug)
  }

  const enrolled = enrolledCourseIds.includes(course.id)
  const totalLessons = (modules || []).reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
  const userReview = user
    ? (reviews || []).find((r: any) => r.user.name === instructor?.name) ?? null
    : null

  const enrichedCourse = {
    ...course,
    category: category || null,
    instructor,
    modules: modules || [],
    _count: { enrollments: enrollmentCount || 0, reviews: reviewCount || 0 },
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {enrichedCourse.category && (
                <Badge variant="secondary">{enrichedCourse.category.name}</Badge>
              )}
              <Badge variant={enrichedCourse.isFree ? "default" : "outline"}>
                {enrichedCourse.isFree ? "Free" : `$${Number(enrichedCourse.price).toFixed(2)}`}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold">{enrichedCourse.title}</h1>
            {enrichedCourse.description && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {enrichedCourse.description}
              </p>
            )}
          </div>

          {user ? (
            <EnrollButton courseId={enrichedCourse.id} enrolled={enrolled} />
          ) : (
            <Button asChild size="lg">
              <Link href="/auth/login">Login to Enroll</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={enrichedCourse.instructor?.image ?? undefined} />
              <AvatarFallback>
                {enrichedCourse.instructor?.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span>{enrichedCourse.instructor?.name}</span>
          </div>
          <span>{enrichedCourse._count.enrollments} students</span>
          <span>{enrichedCourse._count.reviews} reviews</span>
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
              {enrichedCourse.modules.map((module: any, idx: number) => {
                const modLessons = module.lessons || []
                const completedCount = modLessons.filter((l: any) =>
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
                      {modLessons.map((lesson: any, lidx: number) => {
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
                                  {completed ? "\u2713" : null}
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
                  <AvatarImage src={enrichedCourse.instructor?.image ?? undefined} />
                  <AvatarFallback>
                    {enrichedCourse.instructor?.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{enrichedCourse.instructor?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReviewSection
        courseId={enrichedCourse.id}
        reviews={(reviews || []).map((r: any) => ({
          ...r,
          isOwn: r.user.name === instructor?.name,
        }))}
        canReview={enrolled}
        userReview={userReview ? { ...userReview, isOwn: true } : null}
      />
    </div>
  )
}
