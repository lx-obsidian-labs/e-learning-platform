import type { Course, Section, Lesson, CourseProvider } from "../types"
import { ProviderUnavailableError, InvalidResponseError, ProviderTimeoutError } from "../errors"
import { CircuitBreaker } from "../circuit-breaker"

interface OpenLearnCourse {
  id: string
  title: string
  summary?: string
  image?: { url?: string }
  authors?: { name?: string }[]
  language?: string
  href?: string
}

interface OpenLearnSection {
  id: string
  title: string
  type?: string
}

interface OpenLearnItem {
  id: string
  title: string
  summary?: string
  content_type?: string
  file?: { url?: string; duration?: string }
}

const BASE = "https://www.open.edu/openlearn/ocw/api/v1"
const TIMEOUT = 10000

export class OpenLearnProvider implements CourseProvider {
  readonly name = "openlearn"
  private breaker = new CircuitBreaker(this.name)

  async searchCourses(query?: string): Promise<Course[]> {
    return this.breaker.call(async () => {
      const url = query
        ? `${BASE}/search?q=${encodeURIComponent(query)}&limit=20`
        : `${BASE}/courses?limit=20`
      const data = await this.fetchWithTimeout<{ results?: OpenLearnCourse[]; courses?: OpenLearnCourse[] }>(url)
      const items = data.results || data.courses || []
      return items.map((c: OpenLearnCourse) => this.mapCourse(c))
    })
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return this.breaker.call(async () => {
      const url = `${BASE}/courses/${courseId}`
      const data = await this.fetchWithTimeout<OpenLearnCourse>(url)
      return this.mapCourse(data)
    })
  }

  async getCourseStructure(courseId: string): Promise<Section[]> {
    return this.breaker.call(async () => {
      const url = `${BASE}/courses/${courseId}/sections`
      const data = await this.fetchWithTimeout<{ sections?: OpenLearnSection[] }>(url)
      return (data?.sections || []).map((s, i) => ({
        id: s.id,
        title: s.title,
        position: i + 1,
      }))
    })
  }

  async getLessons(courseId: string, sectionId?: string): Promise<Lesson[]> {
    return this.breaker.call(async () => {
      const path = sectionId ? `sections/${sectionId}` : "items"
      const url = `${BASE}/courses/${courseId}/${path}`
      const data = await this.fetchWithTimeout<{ items?: OpenLearnItem[] }>(url)
      return (data?.items || []).map((item, i) => ({
        id: item.id,
        title: item.title,
        description: item.summary,
        contentType: this.mapContentType(item.content_type),
        contentUrl: item.file?.url,
        duration: item.file?.duration ? this.parseDuration(item.file.duration) : undefined,
        position: i + 1,
      }))
    })
  }

  private mapCourse(c: OpenLearnCourse): Course {
    return {
      id: `openlearn_${c.id}`,
      provider: this.name,
      providerCourseId: c.id,
      title: c.title,
      description: c.summary || `Free course from OpenLearn`,
      thumbnail: c.image?.url,
      instructor: c.authors?.map((a) => a.name).filter(Boolean).join(", ") || "OpenLearn",
      category: "Academic",
      language: c.language || "en",
      level: "all",
      url: c.href || `https://www.open.edu/openlearn/ocw/course/${c.id}`,
      videoUrl: (c as any).videoUrl || undefined,
    }
  }

  private mapContentType(type?: string): Lesson["contentType"] {
    if (!type) return "article"
    const t = type.toLowerCase()
    if (t.includes("video")) return "video"
    if (t.includes("pdf")) return "pdf"
    if (t.includes("quiz") || t.includes("assessment")) return "quiz"
    if (t.includes("interactive")) return "interactive"
    return "article"
  }

  private parseDuration(d: string): number {
    const match = d.match(/(\d+):(\d+):(\d+)/)
    if (match) return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3])
    const m = d.match(/(\d+):(\d+)/)
    if (m) return parseInt(m[1]) * 60 + parseInt(m[2])
    return 0
  }

  private async fetchWithTimeout<T>(url: string): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
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
