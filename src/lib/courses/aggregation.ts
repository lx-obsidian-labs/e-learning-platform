import type { Course, CourseProvider, Section, Lesson } from "./types"
import type { CacheProvider } from "./cache"
import { InMemoryCacheProvider, cacheKey, TTL } from "./cache"
import { toErrorResponse } from "./errors"

export class CourseAggregationService {
  private cache: CacheProvider
  private providers: CourseProvider[] = []

  constructor(cache?: CacheProvider) {
    this.cache = cache || new InMemoryCacheProvider()
  }

  registerProvider(provider: CourseProvider): void {
    this.providers.push(provider)
  }

  getProviders(): { name: string }[] {
    return this.providers.map((p) => ({ name: p.name }))
  }

  private findProvider(name: string): CourseProvider | undefined {
    return this.providers.find((p) => p.name === name)
  }

  async searchCourses(query?: string): Promise<Course[]> {
    const cacheKeyStr = cacheKey("aggregator", "search", query || "__all__")
    const cached = await this.cache.get<Course[]>(cacheKeyStr)
    if (cached) return cached

    const results = await Promise.allSettled(
      this.providers.map((p) => p.searchCourses(query))
    )

    const courses: Course[] = []
    for (const result of results) {
      if (result.status === "fulfilled") {
        courses.push(...result.value)
      }
    }

    const deduplicated = this.deduplicate(courses)
    const ranked = this.rankResults(deduplicated, query)

    await this.cache.set(cacheKeyStr, ranked, TTL.COURSE_CATALOG)
    return ranked
  }

  async getCourse(provider: string, courseId: string): Promise<Course | null> {
    const cacheKeyStr = cacheKey(provider, "getCourse", courseId)
    const cached = await this.cache.get<Course>(cacheKeyStr)
    if (cached) return cached

    const p = this.findProvider(provider)
    if (!p) return null

    try {
      const course = await p.getCourse(courseId)
      if (course) {
        await this.cache.set(cacheKeyStr, course, TTL.COURSE_DETAILS)
      }
      return course
    } catch {
      return null
    }
  }

  async getCourseStructure(provider: string, courseId: string): Promise<Section[]> {
    const cacheKeyStr = cacheKey(provider, "getCourseStructure", courseId)
    const cached = await this.cache.get<Section[]>(cacheKeyStr)
    if (cached) return cached

    const p = this.findProvider(provider)
    if (!p) return []

    try {
      const sections = await p.getCourseStructure(courseId)
      await this.cache.set(cacheKeyStr, sections, TTL.LESSON_STRUCTURES)
      return sections
    } catch {
      return []
    }
  }

  async getLessons(provider: string, courseId: string, sectionId?: string): Promise<Lesson[]> {
    const cacheKeyStr = cacheKey(provider, "getLessons", courseId, sectionId || "")
    const cached = await this.cache.get<Lesson[]>(cacheKeyStr)
    if (cached) return cached

    const p = this.findProvider(provider)
    if (!p) return []

    try {
      const lessons = await p.getLessons(courseId, sectionId)
      await this.cache.set(cacheKeyStr, lessons, TTL.LESSON_STRUCTURES)
      return lessons
    } catch {
      return []
    }
  }

  async searchAllProviders(query?: string): Promise<{
    courses: Course[]
    errors: { provider: string; error: string }[]
  }> {
    const results = await Promise.allSettled(
      this.providers.map(async (p) => {
        try {
          const courses = await p.searchCourses(query)
          return { provider: p.name, courses, error: null }
        } catch (error) {
          return { provider: p.name, courses: [], error: toErrorResponse(error).error }
        }
      })
    )

    const courses: Course[] = []
    const errors: { provider: string; error: string }[] = []

    for (const result of results) {
      if (result.status === "fulfilled") {
        courses.push(...result.value.courses)
        if (result.value.error) errors.push({ provider: result.value.provider, error: result.value.error })
      } else {
        errors.push({ provider: "unknown", error: "Provider execution failed" })
      }
    }

    return {
      courses: this.rankResults(this.deduplicate(courses), query),
      errors,
    }
  }

  async searchByProvider(providerName: string, query?: string): Promise<{
    courses: Course[]
    error: string | null
  }> {
    const p = this.findProvider(providerName)
    if (!p) return { courses: [], error: `Provider '${providerName}' not found` }

    try {
      const courses = await p.searchCourses(query)
      return { courses, error: null }
    } catch (error) {
      return { courses: [], error: toErrorResponse(error).error }
    }
  }

  private deduplicate(courses: Course[]): Course[] {
    const seen = new Set<string>()
    return courses.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }

  private rankResults(courses: Course[], query?: string): Course[] {
    if (!query) return courses
    const q = query.toLowerCase()
    return courses.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const aExact = aTitle === q ? 1 : 0
      const bExact = bTitle === q ? 1 : 0
      if (aExact !== bExact) return bExact - aExact
      const aStarts = aTitle.startsWith(q) ? 1 : 0
      const bStarts = bTitle.startsWith(q) ? 1 : 0
      if (aStarts !== bStarts) return bStarts - aStarts
      return 0
    })
  }
}

let defaultService: CourseAggregationService | null = null

export function getDefaultAggregationService(): CourseAggregationService {
  if (!defaultService) {
    defaultService = new CourseAggregationService()
  }
  return defaultService
}
