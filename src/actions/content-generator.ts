"use server"

import { chatCompletion } from "@/lib/nvidia-ai"

type CourseOutline = {
  title: string
  description: string
  modules: {
    title: string
    description: string
    lessons: { title: string; description: string; duration: number }[]
  }[]
}

type LessonContent = {
  content: string
}

type QuizQuestion = {
  text: string
  type: string
  points: number
  options: { text: string; isCorrect: boolean }[]
}

type QuizResult = {
  questions: QuizQuestion[]
}

function extractJSON<T>(reply: string, fallback: T): T {
  try {
    const start = reply.indexOf("{")
    const end = reply.lastIndexOf("}")
    if (start >= 0 && end > start) {
      return JSON.parse(reply.slice(start, end + 1))
    }
    const arrStart = reply.indexOf("[")
    if (arrStart >= 0) {
      const arrEnd = reply.lastIndexOf("]")
      if (arrEnd > arrStart) {
        return JSON.parse(reply.slice(arrStart, arrEnd + 1)) as unknown as T
      }
    }
  } catch {
    // fallback
  }
  return fallback
}

export async function generateCourseOutline(
  prompt: string,
  category?: string
): Promise<CourseOutline> {
  const systemPrompt = `You are an expert instructional designer. Generate a complete course outline as strict JSON.
Output ONLY valid JSON with this exact structure:
{
  "title": "Course Title",
  "description": "Course description (2-3 sentences)",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "lessons": [
        { "title": "Lesson title", "description": "Lesson description", "duration": 30 }
      ]
    }
  ]
}
Include 3-5 modules with 2-4 lessons each. Duration is in minutes.`

  const userPrompt = category
    ? `Generate a course outline for: "${prompt}"\nCategory: ${category}`
    : `Generate a course outline for: "${prompt}"`

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    maxTokens: 2000,
  })

  const fallback: CourseOutline = {
    title: "",
    description: "",
    modules: [],
  }

  return extractJSON(reply, fallback)
}

export async function generateLessonContent(
  lessonTitle: string,
  courseContext: string
): Promise<LessonContent> {
  const systemPrompt = `You are an expert course content writer. Generate engaging HTML lesson content.
Output ONLY a JSON object: { "content": "<h2>Lesson Title</h2><p>...</p>" }
- Use semantic HTML (h2, h3, p, ul, ol, pre, code, blockquote)
- Include practical examples and code snippets where applicable
- Keep it between 300-800 words
- Do NOT wrap in markdown fences`

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate lesson content for "${lessonTitle}" in the context of: ${courseContext}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 1000,
  })

  return extractJSON(reply, { content: "" })
}

export async function generateQuiz(
  lessonTitle: string,
  lessonContent: string
): Promise<QuizResult> {
  const systemPrompt = `You are an expert quiz creator. Generate quiz questions based on lesson content.
Output ONLY a JSON object with this structure:
{
  "questions": [
    {
      "text": "Question text",
      "type": "MULTIPLE_CHOICE",
      "points": 1,
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ]
    }
  ]
}
Rules:
- Generate 3-5 questions
- type can be "MULTIPLE_CHOICE" or "TRUE_FALSE"
- Each question must have at least one correct option
- TRUE_FALSE questions should have exactly 2 options with isCorrect set appropriately`

  const userPrompt = `Lesson title: ${lessonTitle}\nLesson content:\n"""\n${lessonContent.slice(0, 3000)}\n"""\nGenerate quiz questions.`

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    maxTokens: 1000,
  })

  const fallback: QuizResult = { questions: [] }
  return extractJSON(reply, fallback)
}

export async function generateCourseContent(prompt: string): Promise<{
  outline: CourseOutline
  contents: { moduleIndex: number; lessonIndex: number; content: string }[]
  quizzes: { moduleIndex: number; lessonIndex: number; questions: QuizQuestion[] }[]
}> {
  const outline = await generateCourseOutline(prompt)
  const contents: { moduleIndex: number; lessonIndex: number; content: string }[] = []
  const quizzes: { moduleIndex: number; lessonIndex: number; questions: QuizQuestion[] }[] = []

  for (let mi = 0; mi < outline.modules.length; mi++) {
    const mod = outline.modules[mi]
    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li]
      const lessonContent = await generateLessonContent(
        lesson.title,
        `${outline.title}: ${mod.title}`
      )
      contents.push({ moduleIndex: mi, lessonIndex: li, content: lessonContent.content })

      if (lessonContent.content) {
        const quiz = await generateQuiz(lesson.title, lessonContent.content)
        quizzes.push({ moduleIndex: mi, lessonIndex: li, questions: quiz.questions })
      }
    }
  }

  return { outline, contents, quizzes }
}

export async function generateImagePrompt(
  courseTitle: string,
  lessonTitle: string
): Promise<{ prompt: string }> {
  const systemPrompt = `You are an expert at generating image generation prompts. Given a course and lesson title, create a detailed DALL-E prompt for a course thumbnail.
Output ONLY: { "prompt": "your detailed prompt here" }
The prompt should describe a professional, visually appealing educational image.`

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Course: "${courseTitle}"\nLesson: "${lessonTitle}"\nGenerate an image prompt.`,
      },
    ],
    temperature: 0.3,
    maxTokens: 200,
  })

  return extractJSON(reply, { prompt: "" })
}

export type {
  CourseOutline,
  LessonContent,
  QuizQuestion,
  QuizResult,
}
