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
  const moduleVideoCount = (modules || []).reduce((sum: number, m: any) =>
    sum + (m.lessons || []).filter((l: any) => l.videoUrl).length,
  0)
  const completedCount = (modules || []).reduce((sum: number, m: any) =>
    sum + (m.lessons || []).filter((l: any) => completedLessonIds.includes(l.id)).length,
  0)
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const userReview = user
    ? (reviews || []).find((r: any) => r.user.name === instructor?.name) ?? null
    : null

  const gradientClasses = [
    "from-blue-600 to-purple-600",
    "from-emerald-600 to-teal-600",
    "from-orange-600 to-red-600",
    "from-pink-600 to-rose-600",
    "from-indigo-600 to-blue-600",
    "from-teal-600 to-cyan-600",
  ]
  const gradientIdx = course.title.length % gradientClasses.length

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className={`rounded-xl bg-gradient-to-br ${gradientClasses[gradientIdx]} p-8 sm:p-12 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            {category && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                {category.name}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {course.isFree ? "Free" : `$${Number(course.price).toFixed(2)}`}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">{course.title}</h1>
          {course.description && (
            <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
              {course.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-white/30">
                <AvatarImage src={instructor?.image ?? undefined} />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {instructor?.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/90">{instructor?.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {enrollmentCount || 0} students
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalLessons} lessons
            </span>
            {moduleVideoCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {moduleVideoCount} video
              </span>
            )}
            {course.rating > 0 && (
              <span className="flex items-center gap-1">
                <span>★</span>
                {course.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Content</CardTitle>
              <div className="flex items-center gap-3 text-xs">
                {moduleVideoCount > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {moduleVideoCount} video{moduleVideoCount !== 1 ? "s" : ""}
                  </span>
                )}
                {enrolled && completedCount > 0 && (
                  <span className="text-muted-foreground">
                    {completedCount}/{totalLessons} completed
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolled && totalLessons > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {modules?.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No modules yet</p>
              ) : (
                modules?.map((module: any, idx: number) => {
                  const modLessons = module.lessons || []
                  const modCompleted = modLessons.filter((l: any) =>
                    completedLessonIds.includes(l.id)
                  ).length

                  return (
                    <div key={module.id} className="rounded-lg border overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{module.title}</h3>
                            {module.description && (
                              <p className="text-xs text-muted-foreground">{module.description}</p>
                            )}
                          </div>
                        </div>
                        {enrolled && modCompleted > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {modCompleted}/{modLessons.length}
                          </span>
                        )}
                      </div>
                      <div className="divide-y">
                        {modLessons.map((lesson: any, lidx: number) => {
                          const completed = completedLessonIds.includes(lesson.id)
                          const canView = enrolled || lesson.isPreviewable

                          return (
                            <div key={lesson.id}>
                              {canView ? (
                                <Link
                                  href={`/courses/${slug}/lessons/${lesson.id}`}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors group"
                                >
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                                    {completed ? (
                                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    ) : (
                                      <span className="text-xs">{lidx + 1}</span>
                                    )}
                                  </div>
                                  <span className="flex-1 group-hover:text-primary transition-colors">
                                    {lesson.title}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {lesson.videoUrl && (
                                      <svg className="h-3.5 w-3.5 text-primary/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    )}
                                    {lesson.isPreviewable && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        Preview
                                      </Badge>
                                    )}
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {lesson.duration}min
                                      </span>
                                    )}
                                    <svg className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                  </div>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground">
                                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                  </div>
                                  <span className="flex-1">{lesson.title}</span>
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {user ? (
            <EnrollButton courseId={course.id} enrolled={enrolled} />
          ) : (
            <Button size="lg" className="w-full h-12 text-base" asChild>
              <Link href="/auth/login">Login to Enroll</Link>
            </Button>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-muted">
                  <AvatarImage src={instructor?.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {instructor?.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{instructor?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Course Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Enrolled</span>
                <span className="font-medium">{enrollmentCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">{reviewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lessons</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              {course.rating > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium flex items-center gap-1">
                    ★ {course.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

        <ReviewSection
          courseId={course.id}
          reviews={(reviews || []).map((r: any) => ({
            ...r,
            isOwn: r.user.name === instructor?.name,
          }))}
          canReview={enrolled}
          userReview={userReview ? { ...userReview, isOwn: true } : null}
        />
      </div>
    </div>
  )
}
