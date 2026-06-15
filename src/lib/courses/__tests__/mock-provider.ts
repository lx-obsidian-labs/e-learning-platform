import type { Course, Section, Lesson, CourseProvider } from "../types"

export class MockProvider implements CourseProvider {
  readonly name: string
  private shouldFail: boolean
  private emptyResults: boolean
  private delayMs: number

  constructor(
    name: string,
    options?: { shouldFail?: boolean; emptyResults?: boolean; delayMs?: number }
  ) {
    this.name = name
    this.shouldFail = options?.shouldFail ?? false
    this.emptyResults = options?.emptyResults ?? false
    this.delayMs = options?.delayMs ?? 0
  }

  async searchCourses(query?: string): Promise<Course[]> {
    await this.delay()
    if (this.shouldFail) throw new Error(`${this.name} is down`)
    if (this.emptyResults) return []
    return this.generateCourses(query)
  }

  async getCourse(courseId: string): Promise<Course | null> {
    await this.delay()
    if (this.shouldFail) throw new Error(`${this.name} is down`)
    return {
      id: `${this.name}_${courseId}`,
      provider: this.name,
      providerCourseId: courseId,
      title: `${this.name} Course ${courseId}`,
      description: `A sample course from ${this.name}`,
      instructor: this.name,
      category: "Testing",
      language: "en",
      level: "beginner",
    }
  }

  async getCourseStructure(_courseId: string): Promise<Section[]> {
    await this.delay()
    if (this.shouldFail) throw new Error(`${this.name} is down`)
    return [
      { id: "s1", title: "Introduction", position: 1 },
      { id: "s2", title: "Main Content", position: 2 },
    ]
  }

  async getLessons(courseId: string, _sectionId?: string): Promise<Lesson[]> {
    await this.delay()
    if (this.shouldFail) throw new Error(`${this.name} is down`)
    return [
      {
        id: `${courseId}_l1`,
        title: `${this.name} Lesson 1`,
        contentType: "video",
        duration: 600,
        position: 1,
      },
      {
        id: `${courseId}_l2`,
        title: `${this.name} Lesson 2`,
        contentType: "article",
        duration: 300,
        position: 2,
      },
    ]
  }

  private async delay(): Promise<void> {
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs))
  }

  private generateCourses(query?: string): Course[] {
    const courses = [
      { title: "Introduction to Programming", category: "Programming" },
      { title: "Data Science Fundamentals", category: "Data Science" },
      { title: "Web Development Basics", category: "Web Development" },
    ]

    if (query) {
      const q = query.toLowerCase()
      return courses
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
        )
        .map((c, i) => ({
          id: `${this.name}_${i}`,
          provider: this.name,
          providerCourseId: `${i}`,
          title: c.title,
          description: `Learn ${c.title.toLowerCase()} from ${this.name}`,
          instructor: this.name,
          category: c.category,
          language: "en",
          level: "beginner" as const,
        }))
    }

    return courses.map((c, i) => ({
      id: `${this.name}_${i}`,
      provider: this.name,
      providerCourseId: `${i}`,
      title: c.title,
      description: `Learn ${c.title.toLowerCase()} from ${this.name}`,
      instructor: this.name,
      category: c.category,
      language: "en",
      level: "beginner" as const,
    }))
  }
}
