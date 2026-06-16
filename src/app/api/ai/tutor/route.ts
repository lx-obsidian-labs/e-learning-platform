import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chatCompletion, streamChatCompletion, buildTutorPrompt, checkRateLimit, trackUsage } from "@/lib/nvidia-ai"
import { NextRequest } from "next/server"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 })
  }

  if (!checkRateLimit(user.id, 20, 60000)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429 })
  }

  const { courseId, question, history, stream } = await request.json()

  if (!courseId || !question) {
    return new Response(JSON.stringify({ error: "courseId and question required" }), { status: 400 })
  }

  const admin = createAdminClient()

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('*')
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (!enrollment) {
    return new Response(JSON.stringify({ error: "Not enrolled" }), { status: 403 })
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

  const messages = buildTutorPrompt(question, context || "No course content available yet.", history ?? [])

  if (stream) {
    try {
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

            trackUsage(user.id, "tutor", fullReply.length)

            try {
              await createAdminClient().from('ai_chats').insert({
                id: randomUUID(),
                userId: user.id,
                courseId,
                messages: JSON.stringify([...(history ?? []), { role: 'user', content: question }, { role: 'assistant', content: fullReply }]),
              })
            } catch {}
          } catch (err) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI tutor unavailable" })}\n\n`))
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
    } catch {
      return new Response(JSON.stringify({ error: "AI tutor unavailable" }), { status: 503 })
    }
  }

  try {
    const reply = await chatCompletion({ messages })

    trackUsage(user.id, "tutor", reply.length)

    try {
      await createAdminClient().from('ai_chats').insert({
        id: randomUUID(),
        userId: user.id,
        courseId,
        messages: JSON.stringify([...(history ?? []), { role: 'user', content: question }, { role: 'assistant', content: reply }]),
      })
    } catch (err) {
      console.warn('Failed to persist ai chat', err)
    }

    return new Response(JSON.stringify({ reply }))
  } catch {
    return new Response(JSON.stringify({ error: "AI tutor unavailable" }), { status: 503 })
  }
}
