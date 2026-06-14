import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
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

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId: slug, lessonId } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  if (!lesson || lesson.module.course.slug !== slug) notFound()

  const course = lesson.module.course

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  })

  const canView = enrollment || lesson.isPreviewable
  if (!canView) redirect(`/courses/${slug}`)

  const completedIds = await getCompletedLessonIds(course.id)
  const isCompleted = completedIds.includes(lessonId)

  const discussions = await getLessonDiscussions(lessonId)

  const currentIndex = lesson.module.lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lesson.module.lessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < lesson.module.lessons.length - 1
      ? lesson.module.lessons[currentIndex + 1]
      : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/courses/${slug}`} className="hover:text-foreground">
          {course.title}
        </Link>
        <span>/</span>
        <span>{lesson.module.title}</span>
        <div className="ml-auto">
          <AiTutor courseId={course.id} />
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {lesson.duration && <span>{lesson.duration} minutes</span>}
            {lesson.isPreviewable && <Badge variant="outline">Preview</Badge>}
            {isCompleted && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
          </div>
        </div>
      </div>

      <Separator />

      {lesson.videoUrl && (
        <div className="aspect-video rounded-lg bg-muted overflow-hidden">
          {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? (
            <iframe
              src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/").split("&")[0]}
              className="w-full h-full"
              allowFullScreen
            />
          ) : lesson.videoUrl.includes("vimeo.com") ? (
            <iframe
              src={lesson.videoUrl.replace("vimeo.com", "player.vimeo.com/video")}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <video src={lesson.videoUrl} controls className="w-full h-full object-contain" />
          )}
        </div>
      )}

      {lesson.content && (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-2">
          {prevLesson && (
            <Button variant="outline" asChild>
              <Link
                href={`/courses/${slug}/lessons/${prevLesson.id}`}
              >
                ← {prevLesson.title}
              </Link>
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {!isCompleted && (
            <CompleteButton lessonId={lessonId} />
          )}

          {nextLesson && (
            <Button asChild>
              <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                {nextLesson.title} →
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <LessonDiscussions
        lessonId={lesson.id}
        discussions={discussions}
        userId={session.user.id}
      />
    </div>
  )
}
