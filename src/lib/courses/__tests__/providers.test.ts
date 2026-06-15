import { describe, it, expect } from "vitest"
import { MockProvider } from "./mock-provider"

describe("MockProvider", () => {
  it("should search and return courses", async () => {
    const provider = new MockProvider("test")
    const courses = await provider.searchCourses()
    expect(courses.length).toBeGreaterThan(0)
    expect(courses[0].provider).toBe("test")
  })

  it("should filter courses by query", async () => {
    const provider = new MockProvider("test")
    const courses = await provider.searchCourses("Data Science")
    expect(courses.length).toBe(1)
    expect(courses[0].title).toBe("Data Science Fundamentals")
  })

  it("should return empty array when no match", async () => {
    const provider = new MockProvider("test")
    const courses = await provider.searchCourses("zzzznotfound")
    expect(courses).toHaveLength(0)
  })

  it("should get a single course", async () => {
    const provider = new MockProvider("test")
    const course = await provider.getCourse("abc123")
    expect(course).not.toBeNull()
    expect(course?.id).toBe("test_abc123")
    expect(course?.title).toBe("test Course abc123")
  })

  it("should return course structure", async () => {
    const provider = new MockProvider("test")
    const sections = await provider.getCourseStructure("c1")
    expect(sections).toHaveLength(2)
    expect(sections[0].title).toBe("Introduction")
  })

  it("should return lessons", async () => {
    const provider = new MockProvider("test")
    const lessons = await provider.getLessons("c1")
    expect(lessons).toHaveLength(2)
    expect(lessons[0].contentType).toBe("video")
  })

  it("should fail when configured to fail", async () => {
    const provider = new MockProvider("failing", { shouldFail: true })
    await expect(provider.searchCourses()).rejects.toThrow("failing is down")
    await expect(provider.getCourse("x")).rejects.toThrow("failing is down")
    await expect(provider.getCourseStructure("x")).rejects.toThrow("failing is down")
    await expect(provider.getLessons("x")).rejects.toThrow("failing is down")
  })

  it("should return empty results when configured", async () => {
    const provider = new MockProvider("empty", { emptyResults: true })
    const courses = await provider.searchCourses()
    expect(courses).toHaveLength(0)
  })
})
