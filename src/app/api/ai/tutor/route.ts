import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chatCompletion, buildTutorPrompt } from "@/lib/nvidia-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { courseId, question, history } = await request.json()

  if (!courseId || !question) {
    return NextResponse.json({ error: "courseId and question required" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('*')
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 })
  }

  const { data: moduleIds } = await admin
    .from('modules')
    .select('"id"')
    .eq('"courseId"', courseId)

  const mids = (moduleIds || []).map((m: any) => m.id)

  let courseContent: any[] = []
  if (mids.length > 0) {
    const { data } = await admin
      .from('lessons')
      .select('title, content, description')
      .in('"moduleId"', mids)
      .limit(10)
    courseContent = data || []
  }

  const context = (courseContent || [])
    .map((l: any) => `Lesson: ${l.title}\n${l.description ?? ""}\n${l.content ?? ""}`)
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


