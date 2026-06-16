import { createClient } from "@/lib/supabase/server"
import { chatCompletion, streamChatCompletion, checkRateLimit, trackUsage } from "@/lib/nvidia-ai"
import { NextRequest } from "next/server"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 })
  }

  if (!checkRateLimit(user.id, 30, 60000)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429 })
  }

  const { question, history, stream } = await request.json()

  if (!question) {
    return new Response(JSON.stringify({ error: "question required" }), { status: 400 })
  }

  const systemPrompt = `You are a helpful AI learning assistant on the Edu Learn platform. 
You help students with their questions about courses, studying, and learning in general.
Keep answers concise, clear, and educational. Use examples when helpful.
If you don't know something, say so honestly.`

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...(history || []).slice(-10),
    { role: "user", content: question },
  ]

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

            trackUsage(user.id, "assistant", fullReply.length)

            try {
              await supabase.from('ai_chats').insert({
                id: randomUUID(),
                userId: user.id,
                messages: JSON.stringify([...(history ?? []), { role: 'user', content: question }, { role: 'assistant', content: fullReply }]),
              })
            } catch {}
          } catch (err) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI assistant unavailable" })}\n\n`))
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
      return new Response(JSON.stringify({ error: "AI assistant unavailable" }), { status: 503 })
    }
  }

  try {
    const reply = await chatCompletion({ messages })

    trackUsage(user.id, "assistant", reply.length)

    try {
      await supabase.from('ai_chats').insert({
        id: randomUUID(),
        userId: user.id,
        messages: JSON.stringify([...(history ?? []), { role: 'user', content: question }, { role: 'assistant', content: reply }]),
      })
    } catch (err) {
      console.warn('Failed to persist ai chat', err)
    }

    return new Response(JSON.stringify({ reply }))
  } catch {
    return new Response(JSON.stringify({ error: "AI assistant unavailable" }), { status: 503 })
  }
}
