export async function generateSummary(content: string): Promise<string> {
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: "Summarize the following educational content in 3-5 sentences. Focus on key concepts and learning objectives." },
          { role: "user", content },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    })

    if (!res.ok) return ""

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || ""
  } catch {
    return ""
  }
}

export async function generateQuiz(content: string): Promise<{ question: string; options: string[]; answer: string }[]> {
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: `Generate 3 multiple-choice quiz questions based on the content.
Return valid JSON array only, no markdown:
[
  {
    "question": "What is...?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "A) ..."
  }
]`,
          },
          { role: "user", content },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    })

    if (!res.ok) return []

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim() || ""
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "")
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function generateFlashcards(content: string): Promise<{ term: string; definition: string }[]> {
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: `Create 5 flashcards from the content. Return valid JSON array only:
[
  {"term": "Key concept", "definition": "Definition of the concept"}
]`,
          },
          { role: "user", content },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    })

    if (!res.ok) return []

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content?.trim() || ""
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "")
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}
