import type { Course, Section, Lesson, CourseProvider } from "../types"
import { ProviderUnavailableError, InvalidResponseError, ProviderTimeoutError } from "../errors"
import { CircuitBreaker } from "../circuit-breaker"

interface OpenEdxCourse {
  id: string
  name: string
  title?: string
  short_description?: string
  media?: { image?: { raw?: string; small?: string } }
  image?: { raw?: string; small?: string }
  org?: string
  language?: string
  course_level?: string
  marketing_url?: string
}

interface OpenEdxSection {
  id: string
  name?: string
  title?: string
  position?: number
}

interface OpenEdxSequence {
  id: string
  name?: string
  title?: string
}

interface OpenEdxVertical {
  id: string
  name?: string
  title?: string
}

interface OpenEdxBlock {
  id: string
  name?: string
  title?: string
  type?: string
  student_view_url?: string
}

const BASE_URL = "https://courses.edx.org/api"
const TIMEOUT = 10000

export class OpenEdxProvider implements CourseProvider {
  readonly name = "openedx"
  private breaker = new CircuitBreaker(this.name)

  private baseUrl: string
  private apiKey?: string

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = config?.baseUrl || process.env.OPENEDX_API_URL || BASE_URL
    this.apiKey = config?.apiKey || process.env.OPENEDX_API_KEY
  }

  async searchCourses(query?: string): Promise<Course[]> {
    return this.breaker.call(async () => {
      const url = query
        ? `${this.baseUrl}/catalog/v1/courses?search=${encodeURIComponent(query)}&limit=20`
        : `${this.baseUrl}/catalog/v1/courses?limit=20`
      const data = await this.fetchWithTimeout<{ results?: OpenEdxCourse[] }>(url)
      const items = data.results || []
      return items.map((c: OpenEdxCourse) => this.mapCourse(c))
    })
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return this.breaker.call(async () => {
      const url = `${this.baseUrl}/catalog/v1/courses/${courseId}`
      const data = await this.fetchWithTimeout<OpenEdxCourse>(url)
      return this.mapCourse(data)
    })
  }

  async getCourseStructure(courseId: string): Promise<Section[]> {
    return this.breaker.call(async () => {
      const url = `${this.baseUrl}/courses/v1/blocks/${courseId}/?depth=1`
      const data = await this.fetchWithTimeout<{
        blocks?: Record<string, { id: string; name?: string; type?: string; children?: string[] }>
      }>(url)
      const blocks = data?.blocks || {}
      const courseBlock = blocks[courseId]
      if (!courseBlock?.children) return []
      return courseBlock.children
        .map((childId: string) => {
          const child = blocks[childId]
          if (!child || child.type !== "chapter") return null
          return { id: child.id, title: child.name || "Untitled Section", position: 1 }
        })
        .filter((s): s is Section => s !== null)
        .map((s, i) => ({ ...s, position: i + 1 }))
    })
  }

  async getLessons(courseId: string, sectionId?: string): Promise<Lesson[]> {
    return this.breaker.call(async () => {
      const depth = sectionId ? 3 : 3
      const url = `${this.baseUrl}/courses/v1/blocks/${courseId}/?depth=${depth}`
      const data = await this.fetchWithTimeout<{
        blocks?: Record<string, { id: string; name?: string; type?: string; children?: string[]; student_view_url?: string }>
      }>(url)
      const blocks = data?.blocks || {}
      if (sectionId) {
        const section = blocks[sectionId]
        if (!section?.children) return []
        return this.extractLessonsFromBlocks(section.children, blocks)
      }
      const courseBlock = blocks[courseId]
      if (!courseBlock?.children) return []
      const allLessons: Lesson[] = []
      for (const chapterId of courseBlock.children) {
        const chapter = blocks[chapterId]
        if (chapter?.children) {
          allLessons.push(...this.extractLessonsFromBlocks(chapter.children, blocks))
        }
      }
      return allLessons
    })
  }

  private extractLessonsFromBlocks(
    childIds: string[],
    blocks: Record<string, { id: string; name?: string; type?: string; children?: string[]; student_view_url?: string }>
  ): Lesson[] {
    const lessons: Lesson[] = []
    let pos = 1
    for (const childId of childIds) {
      const child = blocks[childId]
      if (!child) continue
      if (child.type === "vertical") {
        lessons.push({
          id: child.id,
          title: child.name || "Untitled Lesson",
          contentType: "article",
          contentUrl: child.student_view_url,
          position: pos++,
        })
      } else if (child.children) {
        lessons.push(...this.extractLessonsFromBlocks(child.children, blocks))
      }
    }
    return lessons
  }

  private mapCourse(c: OpenEdxCourse): Course {
    return {
      id: `edx_${c.id}`,
      provider: this.name,
      providerCourseId: c.id,
      title: c.title || c.name || "Untitled",
      description: c.short_description || `Free course from Open edX`,
      thumbnail: c.media?.image?.raw || c.image?.raw,
      instructor: c.org || "Open edX",
      category: "Academic",
      language: c.language || "en",
      level: this.mapLevel(c.course_level),
      url: c.marketing_url || `https://courses.edx.org/courses/${c.id}`,
    }
  }

  private mapLevel(level?: string): Course["level"] {
    if (!level) return "all"
    const l = level.toLowerCase()
    if (l.includes("beginner") || l.includes("intro")) return "beginner"
    if (l.includes("intermediate")) return "intermediate"
    if (l.includes("advanced")) return "advanced"
    return "all"
  }

  private async fetchWithTimeout<T>(url: string): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (this.apiKey) headers["X-API-Key"] = this.apiKey
      const res = await fetch(url, {
        headers,
        signal: controller.signal,
        next: { revalidate: 3600 },
      })
      if (res.status === 429) throw new ProviderUnavailableError(this.name)
      if (!res.ok) throw new ProviderUnavailableError(this.name)
      const data = await res.json()
      if (!data) throw new InvalidResponseError(this.name, "empty response")
      return data as T
    } catch (error) {
      if (error instanceof ProviderUnavailableError || error instanceof InvalidResponseError) throw error
      if ((error as Error)?.name === "AbortError") throw new ProviderTimeoutError(this.name)
      throw new ProviderUnavailableError(this.name)
    } finally {
      clearTimeout(timer)
    }
  }
}
