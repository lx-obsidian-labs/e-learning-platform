export interface Course {
  id: string
  provider: string
  providerCourseId: string
  title: string
  description: string
  thumbnail?: string
  instructor?: string
  category?: string
  language: string
  level: "beginner" | "intermediate" | "advanced" | "all"
  url?: string
}

export interface Section {
  id: string
  title: string
  position: number
}

export interface Lesson {
  id: string
  title: string
  description?: string
  contentType: "video" | "article" | "quiz" | "pdf" | "interactive"
  contentUrl?: string
  duration?: number
  position: number
}

export interface ProviderConfig {
  enabled: boolean
  baseUrl?: string
  apiKey?: string
  timeout: number
}

export interface SearchResult {
  courses: Course[]
  total: number
  provider: string
}

export interface CourseProvider {
  readonly name: string
  searchCourses(query?: string): Promise<Course[]>
  getCourse(courseId: string): Promise<Course | null>
  getCourseStructure(courseId: string): Promise<Section[]>
  getLessons(courseId: string, sectionId?: string): Promise<Lesson[]>
}
