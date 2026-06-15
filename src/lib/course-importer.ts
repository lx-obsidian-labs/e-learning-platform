export type ImportedCourse = {
  title: string
  description: string
  category?: string
  thumbnail?: string
  price: number
  isFree: boolean
  modules: ImportedModule[]
}

export type ImportedModule = {
  title: string
  description?: string
  lessons: ImportedLesson[]
  quiz?: ImportedQuiz
}

export type ImportedLesson = {
  title: string
  content?: string
  videoUrl?: string
  duration?: number
  isPreviewable?: boolean
}

export type ImportedQuiz = {
  title: string
  description?: string
  passingScore?: number
  questions: ImportedQuestion[]
}

export type ImportedQuestion = {
  text: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  points: number
  options: { text: string; isCorrect: boolean }[]
}

export function parseJSONCourses(json: string): ImportedCourse[] {
  const data = JSON.parse(json)
  if (data.courses) return data.courses as ImportedCourse[]
  if (Array.isArray(data)) return data as ImportedCourse[]
  return [data as ImportedCourse]
}

export function parseCSVCourses(csv: string): ImportedCourse[] {
  const lines = csv.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const courses: ImportedCourse[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] || "" })

    if (!row.title) continue

    courses.push({
      title: row.title,
      description: row.description || "",
      category: row.category,
      thumbnail: row.thumbnail,
      price: Number(row.price) || 0,
      isFree: row.isfree === "true" || row.free === "true" || Number(row.price) === 0,
      modules: row.modules
        ? JSON.parse(row.modules)
        : [{ title: "Course Content", lessons: [{ title: row.title, content: row.description }] }],
    })
  }

  return courses
}

export function validateCourse(course: ImportedCourse): string | null {
  if (!course.title?.trim()) return "Course title is required"
  if (!course.modules?.length) return "Course must have at least one module"
  for (const mod of course.modules) {
    if (!mod.title?.trim()) return "Each module must have a title"
    if (!mod.lessons?.length) return `Module "${mod.title}" must have at least one lesson`
    if (mod.quiz) {
      if (!mod.quiz.questions?.length) return `Quiz "${mod.quiz.title}" must have questions`
      for (const q of mod.quiz.questions) {
        if (!q.text?.trim()) return "Each question must have text"
        if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
          if (!q.options?.length) return `Question "${q.text}" must have options`
          if (!q.options.some((o) => o.isCorrect)) return `Question "${q.text}" must have a correct answer`
        }
      }
    }
  }
  return null
}
