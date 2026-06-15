"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { OpenEdxProvider } from "@/lib/courses/providers/openedx"

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const now = () => new Date().toISOString()

export async function importEdxCourse(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()
  const provider = new OpenEdxProvider()

  try {
    const edxCourseId = courseId.replace(/^edx_/, "")
    const course = await provider.getCourse(edxCourseId)
    if (!course) return { error: "Course not found from edX API" }

    const slug = slugify(course.title)
    const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
    if (existing) return { error: "Course already exists", id: existing.id }

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
        instructorId: user.id,
        status: "PUBLISHED",
        updatedAt: now(),
      })
      .select('"id"')
      .single()

    if (error || !newCourse) return { error: "Failed to create course" }

    const sections = await provider.getCourseStructure(edxCourseId)
    const allLessons = await provider.getLessons(edxCourseId)

    if (sections.length > 0) {
      for (const section of sections) {
        const { data: mod } = await admin
          .from("modules")
          .insert({
            id: randomUUID(),
            title: section.title,
            order: section.position,
            courseId: newCourse.id,
          })
          .select('"id"')
          .single()

        if (!mod) continue

        const sectionLessons = allLessons.filter((l) => l.id.startsWith(section.id))
        if (sectionLessons.length > 0) {
          for (const lesson of sectionLessons) {
            await admin.from("lessons").insert({
              id: randomUUID(),
              title: lesson.title,
              content: lesson.description || null,
              videoUrl: lesson.contentType === "video" ? lesson.contentUrl || null : null,
              order: lesson.position,
              moduleId: mod.id,
              updatedAt: now(),
            })
          }
        }
      }
    } else {
      const { data: mod } = await admin
        .from("modules")
        .insert({
          id: randomUUID(),
          title: "Course Content",
          order: 1,
          courseId: newCourse.id,
        })
        .select('"id"')
        .single()

      if (mod && course.videoUrl) {
        await admin.from("lessons").insert({
          id: randomUUID(),
          title: "Course Introduction",
          content: course.description || null,
          videoUrl: course.videoUrl,
          order: 1,
          moduleId: mod.id,
          updatedAt: now(),
        })
      }
    }

    revalidatePath("/courses")
    revalidatePath("/admin/courses")
    return { success: true, id: newCourse.id }
  } catch (err: any) {
    return { error: err.message || "Import failed" }
  }
}

const STATIC_EDX_COURSES = [
  { id: "edx_static_1", title: "Introduction to Computer Science", description: "Learn the fundamentals of computer science, algorithms, and data structures. Covers programming basics, computational thinking, and problem-solving techniques.", instructor: "Harvard University", videoUrl: "https://www.youtube.com/embed/8mAITcNt710" },
  { id: "edx_static_2", title: "Calculus 1A: Differentiation", description: "Master differential calculus: limits, derivatives, and their applications. Essential for science, engineering, and mathematics students.", instructor: "MIT", videoUrl: "https://www.youtube.com/embed/7K1sB05pE0A" },
  { id: "edx_static_3", title: "CS50's Web Programming with Python and JavaScript", description: "Build and deploy web applications using Python, Django, JavaScript, and React. Covers databases, APIs, security, and scalability.", instructor: "Harvard University", videoUrl: "https://www.youtube.com/embed/vqn8BYLvM5o" },
  { id: "edx_static_4", title: "Data Science: Machine Learning", description: "Build machine learning models with Python. Covers regression, classification, clustering, neural networks, and model evaluation techniques.", instructor: "UC Berkeley", videoUrl: "https://www.youtube.com/embed/JcI5E2Ng6r4" },
  { id: "edx_static_5", title: "The Science of Well-Being", description: "Explore the science of happiness and well-being. Learn evidence-based strategies to improve your life satisfaction and mental health.", instructor: "Yale University", videoUrl: "https://www.youtube.com/embed/qzR62JJCMBQ" },
  { id: "edx_static_6", title: "Blockchain for Business", description: "Understand blockchain technology, cryptocurrencies, smart contracts, and their applications in business and finance.", instructor: "The Linux Foundation", videoUrl: "https://www.youtube.com/embed/6WG7D47tGb0" },
  { id: "edx_static_7", title: "AWS Cloud Technical Essentials", description: "Learn AWS cloud fundamentals: compute, storage, networking, databases, and security. Prepare for the AWS Certified Cloud Practitioner exam.", instructor: "AWS", videoUrl: "https://www.youtube.com/embed/ulprqHHWlng" },
  { id: "edx_static_8", title: "Cybersecurity Fundamentals", description: "Master network security, cryptography, threat detection, risk management, and incident response. Essential for cybersecurity professionals.", instructor: "Rochester Institute of Technology", videoUrl: "https://www.youtube.com/embed/bPVaOlJ-WNk" },
]

export async function searchEdxCourses(query?: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return []

  try {
    const provider = new OpenEdxProvider()
    const courses = await provider.searchCourses(query)
    if (courses.length > 0) {
      return courses.map((c) => ({
        id: c.id,
        providerCourseId: c.providerCourseId,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        instructor: c.instructor,
        videoUrl: c.videoUrl,
        url: c.url,
      }))
    }
  } catch {
    // API unavailable — fall through to static catalog
  }

  if (!query) return STATIC_EDX_COURSES
  const q = query.toLowerCase()
  return STATIC_EDX_COURSES.filter(
    (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  )
}
