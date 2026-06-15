import type { Course, Section, Lesson, CourseProvider } from "../types"
import { ProviderUnavailableError, InvalidResponseError, ProviderTimeoutError } from "../errors"
import { CircuitBreaker } from "../circuit-breaker"

interface KhanTopic {
  id: string
  title: string
  description?: string
  thumbnail?: string
  url?: string
  kind?: string
}

interface KhanVideo {
  id: string
  title: string
  description?: string
  videoUrl?: string
  duration?: number
  position?: number
  thumbnailUrl?: string
}

const BASE = "https://www.khanacademy.org/api/v1"
const TIMEOUT = 10000

export class KhanAcademyProvider implements CourseProvider {
  readonly name = "khan_academy"
  private breaker = new CircuitBreaker(this.name)

  async searchCourses(query?: string): Promise<Course[]> {
    return this.breaker.call(async () => {
      const url = `${BASE}/topics?kind=Domain`
      const data = await this.fetchWithTimeout<KhanTopic[]>(url)
      const courses = data.map((t) => this.mapTopicToCourse(t))
      if (query) {
        const q = query.toLowerCase()
        return courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q)
        )
      }
      return courses.slice(0, 30)
    })
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return this.breaker.call(async () => {
      const url = `${BASE}/topic/${courseId}`
      const data = await this.fetchWithTimeout<KhanTopic>(url)
      return this.mapTopicToCourse(data)
    })
  }

  async getCourseStructure(_courseId: string): Promise<Section[]> {
    return this.breaker.call(async () => {
      return [{ id: "main", title: "Course Content", position: 1 }]
    })
  }

  async getLessons(courseId: string, _sectionId?: string): Promise<Lesson[]> {
    return this.breaker.call(async () => {
      const url = `${BASE}/topic/${courseId}/videos`
      const data = await this.fetchWithTimeout<KhanVideo[]>(url)
      return (data || []).map((v, i) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        contentType: "video" as const,
        contentUrl: v.videoUrl || `https://www.khanacademy.org/watch/${v.id}`,
        duration: v.duration,
        position: v.position ?? i + 1,
      }))
    })
  }

  private mapTopicToCourse(t: KhanTopic): Course {
    return {
      id: `khan_${t.id}`,
      provider: this.name,
      providerCourseId: t.id,
      title: t.title,
      description: t.description || `Free ${t.title} course from Khan Academy`,
      thumbnail: t.thumbnail,
      instructor: "Khan Academy",
      category: "Academic",
      language: "en",
      level: "all",
      url: `https://www.khanacademy.org${t.url || ""}`,
    }
  }

  private async fetchWithTimeout<T>(url: string): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
      if (res.status === 429) throw new ProviderRateLimitError(this.name)
      if (!res.ok) throw new ProviderUnavailableError(this.name)
      const data = await res.json()
      if (!data) throw new InvalidResponseError(this.name, "empty response")
      return data as T
    } catch (error) {
      if (error instanceof ProviderUnavailableError || error instanceof ProviderRateLimitError || error instanceof InvalidResponseError) throw error
      if ((error as Error)?.name === "AbortError") throw new ProviderTimeoutError(this.name)
      throw new ProviderUnavailableError(this.name)
    } finally {
      clearTimeout(timer)
    }
  }
}

class ProviderRateLimitError extends ProviderUnavailableError {
  constructor(provider: string) {
    super(provider)
    this.message = `Provider ${provider} rate limited`
    this.name = "ProviderRateLimitError"
  }
}
