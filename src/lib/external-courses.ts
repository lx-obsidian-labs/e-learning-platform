export type ExternalCourse = {
  title: string
  description: string
  url: string
  thumbnail?: string
  instructor?: string
  platform: "khan_academy" | "wikiversity" | "openstax" | "freecodecamp" | "openlearn"
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

// ─── OpenLearn (The Open University) ──────────────────────────

async function fetchOpenLearnCourses(): Promise<ExternalCourse[]> {
  try {
    const res = await fetch("https://www.open.edu/openlearn/free-courses/full-catalogue", {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const html = await res.text()

    const courses: ExternalCourse[] = []
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []

    for (const row of rows) {
      if (!row.includes("views-field-title")) continue

      const titleMatch = row.match(/views-field-title[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i)
      if (!titleMatch) continue

      const url = titleMatch[1].trim()
      const title = titleMatch[2].replace(/<[^>]*>/g, "").trim()
      if (!title || !url) continue

      const fullUrl = url.startsWith("http") ? url : `https://www.open.edu${url.startsWith("/") ? "" : "/"}${url}`

      const descriptionMatch = row.match(/views-field-field-ou-course-code[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i)
      const code = descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, "").trim() : ""

      const levelMatch = row.match(/views-field-field-level[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i)
      const level = levelMatch ? levelMatch[1].replace(/<[^>]*>/g, "").trim() : ""

      const durationMatch = row.match(/views-field-field-planned-learning-hours[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i)
      const duration = durationMatch ? durationMatch[1].replace(/<[^>]*>/g, "").trim() : ""

      const description = `Free ${level ? level + " " : ""}course from The Open University${code ? ` (${code})` : ""}.${duration ? ` Duration: ${duration}.` : ""}`

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50)

      courses.push({
        title,
        description,
        url: fullUrl,
        instructor: "The Open University",
        platform: "openlearn",
        category: "Academic",
        sourceId: `openlearn_${slug}_${code || Math.random().toString(36).slice(2, 8)}`,
        content: `${title} — a free ${level.toLowerCase()} course from The Open University, available on OpenLearn.${duration ? ` Approximately ${duration.toLowerCase()} to complete.` : ""}`,
      })
    }

    return courses.slice(0, 50)
  } catch {
    return []
  }
}

// ─── Aggregator ────────────────────────────────────────────────

const STATIC_EXTERNAL_COURSES: ExternalCourse[] = [
  { title: "HTML & CSS for Beginners", description: "Learn the fundamentals of HTML5 and CSS3. Build responsive, accessible websites from scratch with modern layout techniques like Flexbox and Grid.", url: "https://example.com/html-css", platform: "freecodecamp", sourceId: "static_html_css", instructor: "freeCodeCamp", category: "Web Development", lessons: [{ title: "HTML Basics", videoUrl: "https://www.youtube.com/embed/ok-plXXHlWw" }, { title: "CSS Fundamentals", videoUrl: "https://www.youtube.com/embed/yfoY53QXEnI" }] },
  { title: "JavaScript Algorithms & Data Structures", description: "Master JavaScript fundamentals, ES6+, data structures, and algorithms. Build projects and prepare for technical interviews.", url: "https://example.com/js-algos", platform: "freecodecamp", sourceId: "static_js_algos", instructor: "freeCodeCamp", category: "Programming", lessons: [{ title: "JavaScript Basics", videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk" }, { title: "Data Structures", videoUrl: "https://www.youtube.com/embed/R-HLU9Fl5ug" }] },
  { title: "Responsive Web Design", description: "Learn responsive design principles, CSS media queries, and mobile-first development. Create websites that work on any device.", url: "https://example.com/responsive", platform: "freecodecamp", sourceId: "static_responsive", instructor: "freeCodeCamp", category: "Web Development", lessons: [{ title: "Design Principles", videoUrl: "https://www.youtube.com/embed/srvUrASNj0s" }] },
  { title: "Python for Data Analysis", description: "Use Python, Pandas, NumPy, and Matplotlib to analyze and visualize data. Real-world datasets and hands-on projects included.", url: "https://example.com/python-data", platform: "freecodecamp", sourceId: "static_python_data", instructor: "freeCodeCamp", category: "Data Science", lessons: [{ title: "Python Basics", videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8" }, { title: "Data Analysis", videoUrl: "https://www.youtube.com/embed/vmEHCJofslg" }] },
  { title: "Front End Libraries", description: "Learn React, Redux, jQuery, Bootstrap, and SASS. Build modern, interactive user interfaces with popular front-end libraries.", url: "https://example.com/frontend-libs", platform: "freecodecamp", sourceId: "static_frontend", instructor: "freeCodeCamp", category: "Web Development", lessons: [{ title: "React Basics", videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0" }] },
  { title: "API Development with Node.js", description: "Build RESTful APIs with Node.js, Express, and MongoDB. Learn authentication, error handling, testing, and deployment.", url: "https://example.com/node-api", platform: "freecodecamp", sourceId: "static_node_api", instructor: "freeCodeCamp", category: "Web Development", lessons: [{ title: "Node.js Basics", videoUrl: "https://www.youtube.com/embed/Oe421EPjeBE" }] },
  { title: "Introduction to SQL", description: "Master SQL queries: SELECT, JOIN, GROUP BY, subqueries, and window functions. Work with real databases and optimize query performance.", url: "https://example.com/sql", platform: "openstax", sourceId: "static_sql", instructor: "OpenStax", category: "Database Design", lessons: [{ title: "SQL Basics", videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA" }] },
  { title: "Linear Algebra for Machine Learning", description: "Understand vectors, matrices, eigenvalues, and linear transformations. Essential mathematics for machine learning and data science.", url: "https://example.com/linear-algebra", platform: "khan_academy", sourceId: "static_linear_algebra", instructor: "Khan Academy", category: "Mathematics", lessons: [{ title: "Vectors", videoUrl: "https://www.youtube.com/embed/fNk_zzaMoSs" }] },
]

export async function searchExternalCourses(query?: string): Promise<ExternalCourse[]> {
  const sources = [
    fetchKhanCourses(),
    fetchWikiversityCourses(),
    fetchOpenStaxCourses(),
    fetchFreeCodeCampCourses(),
    fetchOpenLearnCourses(),
  ]

  const live = (await Promise.all(sources)).flat()
  const results = live.length > 0 ? live : STATIC_EXTERNAL_COURSES

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
