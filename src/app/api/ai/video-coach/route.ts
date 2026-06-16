import { createClient } from "@/lib/supabase/server"
import { chatCompletion, streamChatCompletion, checkRateLimit, trackUsage } from "@/lib/nvidia-ai"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 })
  }

  if (!checkRateLimit(user.id, 20, 60000)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429 })
  }

  try {
    const { lessonTitle, lessonContent, videoUrl, videoTitle, question, history, stream } = await req.json()

    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 })
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

    if (stream) {
      const generator = streamChatCompletion({ messages })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          let fullReply = ""
          try {
            for await (const chunk of generator) {
              fullReply += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
            trackUsage(user.id, "video-coach", fullReply.length)
          } catch {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI coaching unavailable" })}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    const reply = await chatCompletion({ messages })
    trackUsage(user.id, "video-coach", reply.length)
    return new Response(JSON.stringify({ reply }))
  } catch (error) {
    console.error("AI Video Coach error:", error)
    return new Response(JSON.stringify({ error: "AI coaching is temporarily unavailable." }), { status: 503 })
  }
}
