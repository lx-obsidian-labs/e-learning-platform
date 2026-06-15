import type { Course, Section, Lesson, CourseProvider } from "../types"
import { ProviderUnavailableError, InvalidResponseError, ProviderTimeoutError } from "../errors"
import { CircuitBreaker } from "../circuit-breaker"

interface OpenEdxCourseResult {
  id: string
  course_id: string
  name: string
  number?: string
  org?: string
  short_description?: string
  media?: {
    course_video?: { uri?: string }
    image?: { raw?: string; small?: string; large?: string }
    course_image?: { uri?: string }
  }
  start?: string
  pacing?: string
  mobile_available?: boolean
  blocks_url?: string
}

interface OpenEdxPagination {
  next?: string | null
  previous?: string | null
  count: number
  num_pages: number
}

interface OpenEdxCourseListResponse {
  results?: OpenEdxCourseResult[]
  pagination?: OpenEdxPagination
}

interface OpenEdxBlock {
  id: string
  type: string
  display_name?: string
  student_view_url?: string
  student_view_multi_device?: boolean
  children?: string[]
  lms_web_url?: string
}

interface OpenEdxBlocksResponse {
  root?: string
  blocks?: Record<string, OpenEdxBlock>
}

const BASE_URL = "https://courses.edx.org/api"
const TIMEOUT = 10000

function extractYoutubeId(url: string): string | undefined {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube") || u.hostname.includes("youtu.be")) {
      const id = u.searchParams.get("v") || u.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {}
  return undefined
}

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
      const params = new URLSearchParams({ page: "1" })
      if (query) params.set("search", query)
      const url = `${this.baseUrl}/courses/v1/courses/?${params.toString()}`
      const data = await this.fetchWithTimeout<OpenEdxCourseListResponse>(url)
      const items = data.results || []
      return items.map((c) => this.mapCourse(c))
    })
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return this.breaker.call(async () => {
      const url = `${this.baseUrl}/courses/v1/courses/${encodeURIComponent(courseId)}`
      const data = await this.fetchWithTimeout<OpenEdxCourseResult>(url)
      return data ? this.mapCourse(data) : null
    })
  }

  async getCourseStructure(courseId: string): Promise<Section[]> {
    return this.breaker.call(async () => {
      try {
        const encodedId = encodeURIComponent(courseId)
        const url = `${this.baseUrl}/courses/v2/blocks/?course_id=${encodedId}&depth=1&requested_fields=children`
        const data = await this.fetchWithTimeout<OpenEdxBlocksResponse>(url, true)
        const blocks = data?.blocks || {}
        const rootId = data?.root
        if (!rootId) return []
        const root = blocks[rootId]
        if (!root?.children) return []
        return root.children
          .map((childId: string, i: number) => {
            const child = blocks[childId]
            if (!child || child.type !== "chapter") return null
            return { id: child.id, title: child.display_name || "Untitled Section", position: i + 1 }
          })
          .filter((s): s is Section => s !== null)
      } catch {
        return []
      }
    })
  }

  async getLessons(courseId: string, sectionId?: string): Promise<Lesson[]> {
    return this.breaker.call(async () => {
      try {
        const encodedId = encodeURIComponent(courseId)
        const depth = sectionId ? 3 : 3
        const url = `${this.baseUrl}/courses/v2/blocks/?course_id=${encodedId}&depth=${depth}&requested_fields=children,student_view_url`
        const data = await this.fetchWithTimeout<OpenEdxBlocksResponse>(url, true)
        const blocks = data?.blocks || {}
        if (sectionId) {
          const section = blocks[sectionId]
          if (!section?.children) return []
          return this.extractLessonsFromBlocks(section.children, blocks)
        }
        const rootId = data?.root
        if (!rootId || !blocks[rootId]?.children) return []
        const allLessons: Lesson[] = []
        for (const chapterId of blocks[rootId].children || []) {
          const chapter = blocks[chapterId]
          if (chapter?.children) {
            allLessons.push(...this.extractLessonsFromBlocks(chapter.children, blocks))
          }
        }
        return allLessons
      } catch {
        return []
      }
    })
  }

  private extractLessonsFromBlocks(
    childIds: string[],
    blocks: Record<string, OpenEdxBlock>
  ): Lesson[] {
    const lessons: Lesson[] = []
    let pos = 1
    for (const childId of childIds) {
      const child = blocks[childId]
      if (!child) continue
      if (child.type === "video") {
        const embedUrl = child.student_view_url
          ? extractYoutubeId(child.student_view_url)
          : undefined
        lessons.push({
          id: child.id,
          title: child.display_name || "Video Lesson",
          contentType: "video",
          contentUrl: embedUrl || child.student_view_url,
          position: pos++,
        })
      } else if (child.type === "vertical") {
        lessons.push({
          id: child.id,
          title: child.display_name || "Untitled Lesson",
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

  private mapCourse(c: OpenEdxCourseResult): Course {
    const rawVideoUrl = c.media?.course_video?.uri
    const embedUrl = rawVideoUrl ? extractYoutubeId(rawVideoUrl) : undefined
    return {
      id: `edx_${c.course_id || c.id}`,
      provider: this.name,
      providerCourseId: c.course_id || c.id,
      title: c.name || "Untitled",
      description: c.short_description || `Free course from Open edX`,
      thumbnail: c.media?.image?.raw || c.media?.course_image?.uri,
      instructor: c.org || "Open edX",
      category: "Academic",
      language: "en",
      level: "all",
      url: c.course_id ? `https://courses.edx.org/courses/${c.course_id}` : undefined,
      videoUrl: embedUrl,
    }
  }

  private async fetchWithTimeout<T>(url: string, allowFailure = false): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (this.apiKey) headers["X-API-Key"] = this.apiKey
      const res = await fetch(url, { headers, signal: controller.signal, next: { revalidate: 3600 } })
      if (res.status === 429) throw new ProviderUnavailableError(this.name)
      if (!res.ok) {
        if (allowFailure) throw new Error("not available")
        throw new ProviderUnavailableError(this.name)
      }
      const data = await res.json()
      if (!data) throw new InvalidResponseError(this.name, "empty response")
      return data as T
    } catch (error) {
      if (allowFailure) throw error
      if (error instanceof ProviderUnavailableError || error instanceof InvalidResponseError) throw error
      if ((error as Error)?.name === "AbortError") throw new ProviderTimeoutError(this.name)
      throw new ProviderUnavailableError(this.name)
    } finally {
      clearTimeout(timer)
    }
  }
}
