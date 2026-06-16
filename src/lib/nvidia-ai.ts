const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1"
const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

type ChatCompletionOpts = {
  messages: Message[]
  temperature?: number
  maxTokens?: number
  model?: string
}

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY
  if (!key) throw new Error("NVIDIA_API_KEY not set")
  return key
}

export async function chatCompletion(opts: ChatCompletionOpts) {
  const {
    messages,
    temperature = 0.7,
    maxTokens = 1024,
    model = DEFAULT_MODEL,
  } = opts

  const res = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NVIDIA API error (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content ?? ""
}

export async function* streamChatCompletion(opts: ChatCompletionOpts): AsyncGenerator<string> {
  const {
    messages,
    temperature = 0.7,
    maxTokens = 2048,
    model = DEFAULT_MODEL,
  } = opts

  const res = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NVIDIA API error (${res.status}): ${text}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith("data: ")) continue
      const data = trimmed.slice(6)
      if (data === "[DONE]") return

      try {
        const parsed = JSON.parse(data)
        const content = parsed.choices?.[0]?.delta?.content
        if (content) yield content
      } catch {
        continue
      }
    }
  }
}

export function buildTutorPrompt(
  question: string,
  context: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[]
): Message[] {
  const systemPrompt = `You are an AI tutor for an e-learning platform. Help students understand course material.

Rules:
- Answer based on the provided course content only
- If the answer isn't in the content, say you don't know
- Explain concepts clearly with examples
- Keep answers concise (under 200 words)
- Use markdown for formatting when helpful

Course content:
"""
${context.slice(0, 4000)}
"""`

  const messages: Message[] = [{ role: "system", content: systemPrompt }]

  for (const msg of conversationHistory.slice(-6)) {
    messages.push(msg)
  }

  messages.push({ role: "user", content: question })
  return messages
}

export function buildRecommendationPrompt(userContext: any, courses: any[]) {
  const system = `You are an intelligent course recommender. Use the user's context to recommend relevant courses.`
  const messages: Message[] = [{ role: 'system', content: system }]
  messages.push({ role: 'user', content: `USER_CONTEXT:\n${JSON.stringify(userContext)}\nCOURSES:\n${JSON.stringify(courses)}` })
  return messages
}

export async function moderateContent(text: string) {
  const system = `You are a content moderator. Classify the following user-generated content.

Rules:
- If the content includes hate speech, violent threats, sexual content involving minors, explicit calls for illegal activity, or direct targeted harassment, return verdict "reject".
- If the content is questionable (insult, mild harassment, uncivil, or adult sexual content not involving minors) return verdict "flag".
- Otherwise return verdict "allow".

Output:
Return a single JSON object with keys: verdict (one of "allow", "flag", "reject") and reason (short string). Do NOT output any other text.`

  const messages: Message[] = [
    { role: "system", content: system },
    { role: "user", content: `Content:\n"""\n${text}\n"""` },
  ]

  try {
    const reply = await chatCompletion({ messages, temperature: 0, maxTokens: 200 })
    const jsonStart = reply.indexOf("{")
    const jsonText = jsonStart >= 0 ? reply.slice(jsonStart) : reply
    const parsed = JSON.parse(jsonText)
    const verdict = parsed.verdict && (parsed.verdict === "allow" || parsed.verdict === "flag" || parsed.verdict === "reject") ? parsed.verdict : "allow"
    const reason = parsed.reason || ""
    return { verdict, reason }
  } catch (err) {
    console.warn("Moderation failed:", err)
    return { verdict: "allow", reason: "moderation_unavailable" }
  }
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(userId: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

const usageQueue: { userId: string; type: string; tokens?: number }[] = []

export function trackUsage(userId: string, type: string, tokens?: number) {
  usageQueue.push({ userId, type, tokens })
}

export async function flushUsageQueue() {
  if (usageQueue.length === 0) return

  const admin = (await import("@/lib/supabase/admin")).createAdminClient()
  const { randomUUID } = await import("crypto")

  const batch = usageQueue.splice(0, usageQueue.length)
  const inserts = batch.map((u) => ({
    id: randomUUID(),
    userId: u.userId,
    messages: JSON.stringify([{ role: "system", content: `usage:${u.type}${u.tokens ? ` tokens:${u.tokens}` : ""}` }]),
    createdAt: new Date().toISOString(),
  }))

  try {
    await admin.from("ai_chats").insert(inserts)
  } catch (err) {
    console.warn("Failed to persist usage data:", err)
  }
}

setInterval(flushUsageQueue, 5000)
