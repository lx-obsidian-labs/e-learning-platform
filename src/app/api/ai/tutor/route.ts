import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { chatCompletion, buildTutorPrompt } from "@/lib/nvidia-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { courseId, question, history } = await request.json()

  if (!courseId || !question) {
    return NextResponse.json({ error: "courseId and question required" }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 })
  }

  const courseContent = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { title: true, content: true, description: true },
    take: 10,
  })

  const context = courseContent
    .map((l) => `Lesson: ${l.title}\n${l.description ?? ""}\n${l.content ?? ""}`)
    .join("\n\n---\n\n")

  try {
    const messages = buildTutorPrompt(question, context || "No course content available yet.", history ?? [])
    const reply = await chatCompletion({ messages })
    return NextResponse.json({ reply })
  } catch (error) {
    return NextResponse.json(
      { error: "AI tutor unavailable" },
      { status: 503 }
    )
  }
}
