import { describe, it, expect, beforeEach } from "vitest"
import { CourseAggregationService } from "../aggregation"
import { MockProvider } from "./mock-provider"
import { InMemoryCacheProvider } from "../cache"

describe("CourseAggregationService", () => {
  let service: CourseAggregationService

  beforeEach(() => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("provider_a"))
    service.registerProvider(new MockProvider("provider_b"))
  })

  it("should aggregate courses from all providers", async () => {
    const courses = await service.searchCourses()
    expect(courses.length).toBeGreaterThanOrEqual(3)
    expect(courses.length).toBeLessThanOrEqual(6)
    const providers = new Set(courses.map((c) => c.provider))
    expect(providers.has("provider_a")).toBe(true)
    expect(providers.has("provider_b")).toBe(true)
  })

  it("should deduplicate courses", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("same"))
    service.registerProvider(new MockProvider("same"))
    const courses = await service.searchCourses()
    const ids = courses.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("should filter by query", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("test"))
    const courses = await service.searchCourses("Programming")
    expect(courses.every((c) => c.title.toLowerCase().includes("programming") || c.category?.toLowerCase().includes("programming"))).toBe(true)
  })

  it("should isolate provider failures", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("good"))
    service.registerProvider(new MockProvider("bad", { shouldFail: true }))

    const courses = await service.searchCourses()
    expect(courses.length).toBeGreaterThan(0)
    expect(courses.every((c) => c.provider === "good")).toBe(true)
  })

  it("should handle all providers failing", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("bad1", { shouldFail: true }))
    service.registerProvider(new MockProvider("bad2", { shouldFail: true }))

    const courses = await service.searchCourses()
    expect(courses).toHaveLength(0)
  })

  it("should handle empty results from providers", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("empty", { emptyResults: true }))
    service.registerProvider(new MockProvider("normal"))

    const courses = await service.searchCourses()
    expect(courses.length).toBeGreaterThan(0)
    expect(courses.every((c) => c.provider === "normal")).toBe(true)
  })

  it("should cache search results", async () => {
    const cache = new InMemoryCacheProvider()
    const spy = vi.spyOn(cache, "set")

    service = new CourseAggregationService(cache)
    service.registerProvider(new MockProvider("cached"))

    await service.searchCourses()
    expect(spy).toHaveBeenCalled()

    const courses = await service.searchCourses()
    expect(courses.length).toBeGreaterThan(0)
  })

  it("should search by specific provider", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("specific"))

    const result = await service.searchByProvider("specific")
    expect(result.error).toBeNull()
    expect(result.courses.length).toBeGreaterThan(0)
    expect(result.courses.every((c) => c.provider === "specific")).toBe(true)
  })

  it("should return error for unknown provider", async () => {
    const result = await service.searchByProvider("nonexistent")
    expect(result.error).toBe("Provider 'nonexistent' not found")
    expect(result.courses).toHaveLength(0)
  })

  it("should return provider list", () => {
    const providers = service.getProviders()
    expect(providers.length).toBeGreaterThanOrEqual(2)
    expect(providers.map((p) => p.name)).toContain("provider_a")
    expect(providers.map((p) => p.name)).toContain("provider_b")
  })

  it("should get a single course by provider and id", async () => {
    const course = await service.getCourse("provider_a", "course_1")
    expect(course).not.toBeNull()
    expect(course?.provider).toBe("provider_a")
    expect(course?.providerCourseId).toBe("course_1")
  })

  it("should return null for unknown provider course", async () => {
    const course = await service.getCourse("nonexistent", "x")
    expect(course).toBeNull()
  })

  it("should get course structure", async () => {
    const sections = await service.getCourseStructure("provider_a", "course_1")
    expect(sections.length).toBe(2)
    expect(sections[0].title).toBe("Introduction")
    expect(sections[1].title).toBe("Main Content")
  })

  it("should get lessons", async () => {
    const lessons = await service.getLessons("provider_a", "course_1")
    expect(lessons.length).toBe(2)
    expect(lessons[0].contentType).toBe("video")
    expect(lessons[1].contentType).toBe("article")
  })

  it("should search all providers with error reporting", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("good"))
    service.registerProvider(new MockProvider("bad", { shouldFail: true }))

    const result = await service.searchAllProviders()
    expect(result.courses.length).toBeGreaterThan(0)
    expect(result.courses.every((c) => c.provider === "good")).toBe(true)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].provider).toBe("bad")
  })

  it("should rank results by relevance", async () => {
    service = new CourseAggregationService(new InMemoryCacheProvider())
    service.registerProvider(new MockProvider("rank"))

    const result = await service.searchAllProviders("Programming")
    expect(result.courses.length).toBeGreaterThan(0)
  })
})
