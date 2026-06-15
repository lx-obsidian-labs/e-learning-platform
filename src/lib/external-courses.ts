export type ExternalCourse = {
  title: string
  description: string
  url: string
  thumbnail?: string
  instructor?: string
  platform: "khan_academy" | "udemy" | "oer_commons"
  price: number
  isFree: boolean
  category?: string
  sourceId: string
}

type KhanTopic = {
  id: string
  title: string
  description?: string
  thumbnail?: string
  url?: string
}

const KHAN_API_BASE = "https://www.khanacademy.org/api/v1"

async function fetchKhanTopics(): Promise<KhanTopic[]> {
  try {
    const res = await fetch(`${KHAN_API_BASE}/topics?kind=Domain`, {
      next: { revalidate: 86400 },
    })

    if (!res.ok) throw new Error("Failed to fetch Khan Academy topics")

    const data = await res.json()
    return (data as KhanTopic[]).slice(0, 50)
  } catch {
    return []
  }
}

export async function searchExternalCourses(
  query?: string
): Promise<ExternalCourse[]> {
  const results: ExternalCourse[] = []

  const [topics] = await Promise.all([fetchKhanTopics()])

  for (const topic of topics) {
    if (
      query &&
      !topic.title.toLowerCase().includes(query.toLowerCase())
    ) {
      continue
    }
    results.push({
      title: topic.title,
      description: topic.description ?? "Khan Academy content",
      url: `https://www.khanacademy.org${topic.url ?? ""}`,
      thumbnail: topic.thumbnail,
      instructor: "Khan Academy",
      platform: "khan_academy",
      price: 0,
      isFree: true,
      category: "Academic",
      sourceId: topic.id,
    })
  }

  return results
}

import { createAdminClient } from "@/lib/supabase/admin"

export async function importExternalCourse(
  course: ExternalCourse,
  instructorId: string,
  categoryId?: string
) {
  const admin = createAdminClient()

  const slug = course.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const { data: existing } = await admin
    .from("courses")
    .select('"id"')
    .or(`"slug".eq.${slug},"title".eq.${course.title.replace(/'/g, "''")}`)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return { error: "Course already exists" }
  }

  const { data: newCourse, error } = await admin
    .from("courses")
    .insert({
      title: course.title,
      slug,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      thumbnail: course.thumbnail,
      status: "DRAFT",
      instructorId,
      categoryId: categoryId || null,
    })
    .select('"id"')
    .single()

  if (error || !newCourse) return { error: "Failed to create course" }

  const { error: moduleError } = await admin
    .from("modules")
    .insert({
      title: "Getting Started",
      order: 1,
      courseId: newCourse.id,
    })
    .select('"id"')
    .single()

  if (moduleError) return { error: "Failed to create module" }

  const { data: newModule } = await admin
    .from("modules")
    .select('"id"')
    .eq('"courseId"', newCourse.id)
    .single()

  if (newModule) {
    await admin.from("lessons").insert({
      title: course.title,
      content: course.description,
      order: 1,
      moduleId: newModule.id,
    })
  }

  return newCourse
}
