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
