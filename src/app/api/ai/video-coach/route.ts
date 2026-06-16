import { NextRequest, NextResponse } from "next/server"
import { chatCompletion } from "@/lib/nvidia-ai"

export async function POST(req: NextRequest) {
  try {
    const { lessonTitle, lessonContent, videoUrl, videoTitle, question, history } = await req.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const context = [
      lessonTitle ? `Lesson: ${lessonTitle}` : "",
      videoTitle ? `Video: ${videoTitle}` : "",
      lessonContent ? `Content: ${lessonContent.slice(0, 4000)}` : "",
    ].filter(Boolean).join("\n\n")

    const systemPrompt = `You are an AI video coach for Edu Learn, helping learners understand lesson content.
Current context:
${context || "No specific lesson context available."}

Answer questions about this lesson content. Help explain concepts, provide examples, and clarify difficult topics.
Be concise (under 200 words), use markdown formatting. If the question is outside the lesson scope, politely guide back.`

    const historyMessages = (history || []).slice(-6).map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: question },
    ]

    const reply = await chatCompletion({ messages })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("AI Video Coach error:", error)
    return NextResponse.json(
      { error: "AI coaching is temporarily unavailable." },
      { status: 503 }
    )
  }
}
