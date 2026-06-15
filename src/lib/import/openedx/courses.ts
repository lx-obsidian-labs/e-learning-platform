import { authedFetch } from "./auth"
import type { OpenEdxConfig } from "./auth"

export type OpenEdxCourse = {
  key: string
  title: string
  short_description?: string
  full_description?: string
  image_url?: string
  course_runs?: {
    key: string
    title: string
    start?: string
    end?: string
    enrollment_start?: string
    enrollment_end?: string
    status: string
  }[]
  subjects?: { name: string }[]
  owners?: { name: string }[]
}

export async function getCoursesInCatalog(config: OpenEdxConfig, catalogId: number): Promise<OpenEdxCourse[]> {
  const data = await authedFetch(config, `/catalog/v1/catalogs/${catalogId}/courses/`)
  return data.results || data
}

export async function getAllCourses(config: OpenEdxConfig): Promise<OpenEdxCourse[]> {
  const data = await authedFetch(config, "/catalog/v1/courses/")
  return data.results || data
}

export function mapOpenEdxCourse(oc: OpenEdxCourse, platform: string): {
  title: string
  description: string
  thumbnail?: string
  instructor?: string
  category?: string
  sourceId: string
} {
  return {
    title: oc.title,
    description: oc.short_description || oc.full_description || "",
    thumbnail: oc.image_url,
    instructor: oc.owners?.map((o) => o.name).join(", ") || "Open edX",
    category: oc.subjects?.[0]?.name || "Academic",
    sourceId: oc.key,
  }
}
