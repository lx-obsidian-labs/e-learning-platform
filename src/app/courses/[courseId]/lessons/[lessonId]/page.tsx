import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound, redirect } from "next/navigation"
import { getCompletedLessonIds } from "@/actions/completions"
import { getLessonDiscussions } from "@/actions/discussions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CompleteButton } from "./complete-button"
import { AiTutor } from "@/components/ai-tutor"
import { LessonDiscussions } from "@/components/lesson-discussions"
import Link from "next/link"

export const dynamic = "force-dynamic"

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null
}

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId: slug, lessonId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()

  const { data: lesson } = await admin
    .from('lessons')
    .select('*, module:modules(*, course:courses(*), lessons:lessons(id, title, "order", videoUrl, duration))')
    .eq('"id"', lessonId)
    .single()

  if (!lesson || lesson.module?.course?.slug !== slug) notFound()

  const course = lesson.module.course
  const moduleLessons = (lesson.module.lessons || [])
    .sort((a: any, b: any) => a.order - b.order)

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('*')
    .eq('"userId"', user.id)
    .eq('"courseId"', course.id)
    .maybeSingle()

  const canView = enrollment || lesson.isPreviewable
  if (!canView) redirect(`/courses/${slug}`)

  const completedIds = await getCompletedLessonIds(course.id)
  const isCompleted = completedIds.includes(lessonId)

  const discussions = await getLessonDiscussions(lessonId)

  const currentIndex = moduleLessons.findIndex((l: any) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < moduleLessons.length - 1
      ? moduleLessons[currentIndex + 1]
      : null

  const embedUrl = lesson.videoUrl
    ? getYouTubeEmbedUrl(lesson.videoUrl) || getVimeoEmbedUrl(lesson.videoUrl) || null
    : null

  const rawVideoUrl = lesson.videoUrl && !embedUrl ? lesson.videoUrl : null

  const videoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null
  const videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null

  const lessonsWithVideo = moduleLessons.filter((l: any) => l.videoUrl).length
  const videoCount = moduleLessons.length

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-16 sm:pt-20 px-4 sm:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href={`/courses/${slug}`} className="hover:text-foreground transition-colors font-medium">
          {course.title}
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-muted-foreground">{lesson.module.title}</span>
        <div className="ml-auto flex items-center gap-2">
          <AiTutor courseId={course.id} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-muted-foreground mt-1">{lesson.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
              {lesson.duration && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {lesson.duration} minutes
                </span>
              )}
              {lesson.videoUrl && (
                <span className="flex items-center gap-1 text-primary">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Video
                </span>
              )}
              {lesson.isPreviewable && <Badge variant="outline">Preview</Badge>}
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {embedUrl && (
            <div className="aspect-video rounded-xl bg-black overflow-hidden shadow-lg relative group">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {lesson.duration || ""} min
              </div>
            </div>
          )}

          {rawVideoUrl && (
            <div className="aspect-video rounded-xl bg-black overflow-hidden shadow-lg relative">
              <video
                src={rawVideoUrl}
                controls
                className="w-full h-full object-contain"
                poster={videoThumbnail || undefined}
              />
            </div>
          )}

          {!lesson.videoUrl && (
            <div className="aspect-video rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden border">
              <div className="text-center space-y-3 p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">Video lesson</p>
              </div>
            </div>
          )}

          {lesson.content && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Lesson Notes
              </h2>
              <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {prevLesson && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Previous
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {!isCompleted && (
                <CompleteButton lessonId={lessonId} />
              )}

              {nextLesson && (
                <Button size="sm" asChild>
                  <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                    Next
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Course Content
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {lessonsWithVideo}/{videoCount} video
                </Badge>
              </h2>
            </div>
            <div className="divide-y max-h-[60vh] overflow-y-auto">
              {moduleLessons.map((l: any, i: number) => {
                const isCurrent = l.id === lessonId
                const completed = completedIds.includes(l.id)
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${slug}/lessons/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      completed ? "bg-green-100 text-green-600" : isCurrent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {completed ? (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="text-[10px]">{i + 1}</span>
                      )}
                    </div>
                    <span className="flex-1 truncate">{l.title}</span>
                    {l.videoUrl && (
                      <svg className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                    {isCurrent && (
                      <svg className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <LessonDiscussions
        lessonId={lesson.id}
        discussions={discussions}
        userId={user.id}
      />
    </div>
  )
}
