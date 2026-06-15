import { createClient } from "@/lib/supabase/server"
import { chatCompletion, buildTutorPrompt } from "@/lib/nvidia-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { question, history } = await request.json()

  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 })
  }

  try {
    const context = "You are a general learning assistant for Edu Learn. Help students with general questions about learning, courses, and education."
    const messages = buildTutorPrompt(question, context, history ?? [])
    const reply = await chatCompletion({ messages })

    return NextResponse.json({ reply })
  } catch (error) {
    return NextResponse.json(
      { error: "AI assistant unavailable" },
      { status: 503 }
    )
  }
}
