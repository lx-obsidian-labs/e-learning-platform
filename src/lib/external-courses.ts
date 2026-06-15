export type ExternalCourse = {
  title: string
  description: string
  url: string
  thumbnail?: string
  instructor?: string
  platform: "khan_academy" | "wikiversity" | "openstax" | "freecodecamp"
  category?: string
  sourceId: string
  content?: string
  lessons?: { title: string; content?: string; videoUrl?: string }[]
}

// ─── Khan Academy ──────────────────────────────────────────────

type KhanTopic = { id: string; title: string; description?: string; thumbnail?: string; url?: string }

async function fetchKhanCourses(): Promise<ExternalCourse[]> {
  try {
    const res = await fetch("https://www.khanacademy.org/api/v1/topics?kind=Domain", {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data: KhanTopic[] = await res.json()
    return data.slice(0, 30).map((t) => ({
      title: t.title,
      description: t.description || `Free ${t.title} course from Khan Academy`,
      url: `https://www.khanacademy.org${t.url || ""}`,
      thumbnail: t.thumbnail,
      instructor: "Khan Academy",
      platform: "khan_academy" as const,
      category: "Academic",
      sourceId: `khan_${t.id}`,
      content: t.description || `Learn ${t.title} with interactive exercises and instructional videos.`,
    }))
  } catch { return [] }
}

// ─── Wikiversity (Wikimedia) ───────────────────────────────────

async function fetchWikiversityCourses(): Promise<ExternalCourse[]> {
  try {
    const res = await fetch(
      "https://en.wikiversity.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Learning_activities&cmlimit=20&format=json&origin=*",
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    const pages = data?.query?.categorymembers || []
    return pages.slice(0, 20).map((p: any) => ({
      title: p.title.replace(/^[^:]+:/, "").trim() || p.title,
      description: `Free educational content from Wikiversity: ${p.title}`,
      url: `https://en.wikiversity.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
      instructor: "Wikiversity",
      platform: "wikiversity" as const,
      category: "Academic",
      sourceId: `wiki_${p.pageid}`,
      content: `Explore ${p.title} — open learning resources from Wikiversity.`,
    }))
  } catch { return [] }
}

// ─── OpenStax ──────────────────────────────────────────────────

async function fetchOpenStaxCourses(): Promise<ExternalCourse[]> {
  try {
    const res = await fetch("https://openstax.org/api/v2/pages/?type=books.BookPage&fields=title,description,slug,cover_url,subject_name&limit=20", {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const items = data?.items || []
    return items.map((b: any) => ({
      title: b.title,
      description: b.description?.replace(/<[^>]*>/g, "") || `Free textbook: ${b.title}`,
      url: `https://openstax.org/details/books/${b.slug}`,
      thumbnail: b.cover_url,
      instructor: "OpenStax",
      platform: "openstax" as const,
      category: b.subject_name || "Academic",
      sourceId: `openstax_${b.slug || b.id}`,
      content: b.description?.replace(/<[^>]*>/g, "") || `Peer-reviewed free textbook on ${b.title}.`,
    }))
  } catch { return [] }
}

// ─── freeCodeCamp (via GitHub API) ─────────────────────────────

async function fetchFreeCodeCampCourses(): Promise<ExternalCourse[]> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/freeCodeCamp/freeCodeCamp/contents/curriculum/challenges/english",
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const dirs: any[] = await res.json()
    return dirs.slice(0, 20).map((d) => ({
      title: d.name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      description: `Free coding curriculum from freeCodeCamp — ${d.name.replace(/-/g, " ")}`,
      url: `https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/${d.name}`,
      instructor: "freeCodeCamp",
      platform: "freecodecamp" as const,
      category: "Programming",
      sourceId: `fcc_${d.sha}`,
      content: `Learn ${d.name.replace(/-/g, " ")} with freeCodeCamp's hands-on coding challenges.`,
    }))
  } catch { return [] }
}

// ─── Aggregator ────────────────────────────────────────────────

export async function searchExternalCourses(query?: string): Promise<ExternalCourse[]> {
  const sources = [
    fetchKhanCourses(),
    fetchWikiversityCourses(),
    fetchOpenStaxCourses(),
    fetchFreeCodeCampCourses(),
  ]

  const results = (await Promise.all(sources)).flat()

  if (query) {
    const q = query.toLowerCase()
    return results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    )
  }

  return results
}

export async function importExternalCourse(
  course: ExternalCourse,
  instructorId: string,
  categoryId?: string
) {
  const { randomUUID } = await import("crypto")
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const admin = createAdminClient()

  const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const now = new Date().toISOString()

  const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
  if (existing) return { error: "Course already exists" }

  const lessonList = course.lessons?.length
    ? course.lessons
    : [{ title: course.title, content: course.content || course.description }]

  const { data: newCourse, error } = await admin
    .from("courses")
    .insert({
      id: randomUUID(),
      title: course.title,
      slug,
      description: course.description,
      price: 0,
      isFree: true,
      thumbnail: course.thumbnail || null,
      categoryId: categoryId || null,
      instructorId,
      status: "PUBLISHED",
      updatedAt: now,
    })
    .select('"id"')
    .single()

  if (error || !newCourse) return { error: "Failed to create course" }

  const { data: newModule } = await admin
    .from("modules")
    .insert({ id: randomUUID(), title: "Course Content", order: 1, courseId: newCourse.id })
    .select('"id"')
    .single()

  if (newModule) {
    for (let i = 0; i < lessonList.length; i++) {
      const lesson = lessonList[i]
      await admin.from("lessons").insert({
        id: randomUUID(),
        title: lesson.title,
        content: lesson.content || null,
        videoUrl: lesson.videoUrl || null,
        order: i + 1,
        moduleId: newModule.id,
        updatedAt: now,
      })
    }
  }

  return newCourse
}
