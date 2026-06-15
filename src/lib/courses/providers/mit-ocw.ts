import type { Course, Section, Lesson, CourseProvider } from "../types"
import { ProviderUnavailableError, InvalidResponseError, ProviderTimeoutError } from "../errors"
import { CircuitBreaker } from "../circuit-breaker"

interface MITCourse {
  id: string
  title: string
  description?: string
  image?: { src?: string }
  instructor?: string
  term?: string
  platform?: string
}

interface MITResource {
  id: string
  title: string
  description?: string
  file_type?: string
  url?: string
  duration?: string
}

const BASE = "https://ocw.mit.edu/api/v1"
const TIMEOUT = 10000

export class MITOCWProvider implements CourseProvider {
  readonly name = "mit_ocw"
  private breaker = new CircuitBreaker(this.name)

  async searchCourses(query?: string): Promise<Course[]> {
    return this.breaker.call(async () => {
      const url = query
        ? `${BASE}/search?q=${encodeURIComponent(query)}&limit=20`
        : `${BASE}/courses?limit=20`
      const data = await this.fetchWithTimeout<{ results?: MITCourse[]; courses?: MITCourse[] }>(url)
      const items = data.results || data.courses || []
      return items.map((c: MITCourse) => this.mapCourse(c))
    })
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return this.breaker.call(async () => {
      const url = `${BASE}/courses/${courseId}`
      const data = await this.fetchWithTimeout<MITCourse>(url)
      return this.mapCourse(data)
    })
  }

  async getCourseStructure(courseId: string): Promise<Section[]> {
    return this.breaker.call(async () => {
      const url = `${BASE}/courses/${courseId}/sections`
      const data = await this.fetchWithTimeout<{ sections?: { id: string; title: string }[] }>(url)
      return (data?.sections || []).map((s, i) => ({
        id: s.id,
        title: s.title,
        position: i + 1,
      }))
    })
  }

  async getLessons(courseId: string, sectionId?: string): Promise<Lesson[]> {
    return this.breaker.call(async () => {
      const path = sectionId ? `${courseId}/sections/${sectionId}` : courseId
      const url = `${BASE}/courses/${path}/resources`
      const data = await this.fetchWithTimeout<{ resources?: MITResource[] }>(url)
      return (data?.resources || []).map((r, i) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        contentType: this.mapContentType(r.file_type),
        contentUrl: r.url,
        duration: r.duration ? this.parseDuration(r.duration) : undefined,
        position: i + 1,
      }))
    })
  }

  private mapCourse(c: MITCourse): Course {
    return {
      id: `mit_${c.id}`,
      provider: this.name,
      providerCourseId: c.id,
      title: c.title,
      description: c.description || `Free course from MIT OpenCourseWare`,
      thumbnail: c.image?.src,
      instructor: c.instructor || "MIT OpenCourseWare",
      category: "Academic",
      language: "en",
      level: "all",
      url: `https://ocw.mit.edu/courses/${c.id}/`,
      videoUrl: (c as any).videoUrl || undefined,
    }
  }

  private mapContentType(type?: string): Lesson["contentType"] {
    if (!type) return "article"
    const t = type.toLowerCase()
    if (t.includes("video")) return "video"
    if (t.includes("pdf")) return "pdf"
    if (t.includes("quiz") || t.includes("exam")) return "quiz"
    if (t.includes("interactive")) return "interactive"
    return "article"
  }

  private parseDuration(d: string): number {
    const match = d.match(/(\d+):(\d+)/)
    if (match) return parseInt(match[1]) * 60 + parseInt(match[2])
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
