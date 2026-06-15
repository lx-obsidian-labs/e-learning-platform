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

function createCourseInDb(admin: any, title: string, description: string, userId: string) {
  const slug = slugify(title)
  return admin.from("courses").insert({
    id: randomUUID(),
    title,
    slug,
    description,
    price: 0,
    isFree: true,
    thumbnail: null as string | null,
    instructorId: userId,
    status: "PUBLISHED",
    updatedAt: now(),
  }).select('"id"').single()
}

function createModuleInDb(admin: any, title: string, order: number, courseId: string) {
  return admin.from("modules").insert({
    id: randomUUID(),
    title,
    order,
    courseId,
  }).select('"id"').single()
}

function createLessonInDb(admin: any, title: string, content: string | null, videoUrl: string | null, order: number, moduleId: string) {
  return admin.from("lessons").insert({
    id: randomUUID(),
    title,
    content,
    videoUrl,
    order,
    moduleId,
    updatedAt: now(),
  })
}

const STATIC_COURSE_LESSONS: Record<string, { module: string; lessons: { title: string; content?: string; videoUrl: string }[] }[]> = {
  edx_static_1: [
    { module: "Fundamentals", lessons: [
      { title: "What is Computer Science?", content: "Computer science is the study of computation, automation, and information. It encompasses theoretical foundations, algorithms, data structures, and practical applications.", videoUrl: "https://www.youtube.com/embed/8mAITcNt710" },
      { title: "Binary & Data Representation", content: "Computers store and process data using binary digits (bits). Learn how numbers, text, images, and sounds are represented in binary.", videoUrl: "https://www.youtube.com/embed/USCk9QTIMqM" },
      { title: "Introduction to Algorithms", content: "Algorithms are step-by-step procedures for solving problems. Learn about searching, sorting, and the importance of algorithmic efficiency.", videoUrl: "https://www.youtube.com/embed/rL8X2mlNHPM" },
    ]},
    { module: "Programming", lessons: [
      { title: "Variables & Data Types", content: "Variables store data in memory. Learn about integers, floats, strings, booleans, and how to work with them.", videoUrl: "https://www.youtube.com/embed/cQT33YU9rY4" },
      { title: "Control Flow", content: "Control structures like conditionals and loops allow programs to make decisions and repeat operations.", videoUrl: "https://www.youtube.com/embed/lsOo5X8hIwE" },
      { title: "Functions & Modularity", content: "Functions are reusable blocks of code. Learn how to write, compose, and organize functions for clean, maintainable code.", videoUrl: "https://www.youtube.com/embed/fshPbsVdS3A" },
    ]},
  ],
  edx_static_3: [
    { module: "Python Backend", lessons: [
      { title: "Python Review", content: "Review Python fundamentals: data types, functions, classes, and modules essential for web development.", videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8" },
      { title: "Django Basics", content: "Django is a high-level Python web framework. Learn models, views, templates, and URL routing.", videoUrl: "https://www.youtube.com/embed/Fc2O3_2kax8" },
      { title: "Databases & ORM", content: "Work with databases using Django's ORM. Define models, run migrations, and query data.", videoUrl: "https://www.youtube.com/embed/0b11m2k3eSs" },
    ]},
    { module: "JavaScript Frontend", lessons: [
      { title: "JavaScript & DOM", content: "JavaScript brings web pages to life. Learn DOM manipulation, events, and asynchronous programming.", videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk" },
      { title: "React Fundamentals", content: "React is a component-based UI library. Learn JSX, state, props, and hooks.", videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0" },
      { title: "Building & Deploying", content: "Combine Django REST API with React frontend. Deploy your full-stack application.", videoUrl: "https://www.youtube.com/embed/vqn8BYLvM5o" },
    ]},
  ],
  edx_static_4: [
    { module: "Foundations", lessons: [
      { title: "What is Machine Learning?", content: "Machine learning enables computers to learn from data. Explore supervised, unsupervised, and reinforcement learning paradigms.", videoUrl: "https://www.youtube.com/embed/ukzFI9rgwfU" },
      { title: "Data Preparation", content: "Clean, transform, and split data for training. Learn about feature engineering, normalization, and train/test splits.", videoUrl: "https://www.youtube.com/embed/XtjaoXh9Dd4" },
    ]},
    { module: "Models & Evaluation", lessons: [
      { title: "Regression & Classification", content: "Build linear regression and logistic regression models. Evaluate with metrics like MSE, accuracy, precision, and recall.", videoUrl: "https://www.youtube.com/embed/JcI5E2Ng6r4" },
      { title: "Neural Networks", content: "Learn about neural network architecture, activation functions, backpropagation, and training deep learning models.", videoUrl: "https://www.youtube.com/embed/ylY1ADiSMYc" },
    ]},
  ],
  edx_static_7: [
    { module: "AWS Core Services", lessons: [
      { title: "Cloud Computing Overview", content: "Understand IaaS, PaaS, SaaS models and the AWS global infrastructure. Learn about regions, availability zones, and edge locations.", videoUrl: "https://www.youtube.com/embed/2LaAJq1lB1Q" },
      { title: "EC2 & Compute", content: "Amazon EC2 provides scalable virtual servers. Learn instance types, security groups, and auto-scaling.", videoUrl: "https://www.youtube.com/embed/ulprqHHWlng" },
      { title: "S3 & Storage", content: "Amazon S3 is object storage for any data. Learn bucket policies, storage classes, and lifecycle management.", videoUrl: "https://www.youtube.com/embed/e6w9LwZJFIA" },
    ]},
    { module: "Architecture", lessons: [
      { title: "VPC & Networking", content: "Amazon VPC lets you provision a logically isolated network. Learn subnets, route tables, and security groups.", videoUrl: "https://www.youtube.com/embed/3hLmDSM8jFw" },
      { title: "Databases on AWS", content: "Amazon RDS, DynamoDB, and ElastiCache. Choose the right database for your workload.", videoUrl: "https://www.youtube.com/embed/9gmVg4LhFEM" },
    ]},
  ],
  edx_static_8: [
    { module: "Security Fundamentals", lessons: [
      { title: "Network Security", content: "Protect networks with firewalls, IDS/IPS, and VPNs. Understand common attack vectors and defense strategies.", videoUrl: "https://www.youtube.com/embed/5pxbp6FyTQ0" },
      { title: "Cryptography", content: "Encryption, hashing, and digital signatures. Learn symmetric vs asymmetric encryption and PKI infrastructure.", videoUrl: "https://www.youtube.com/embed/NuyzuNBFWxQ" },
    ]},
    { module: "Threats & Defense", lessons: [
      { title: "Malware & Threats", content: "Understand viruses, worms, trojans, ransomware, and advanced persistent threats. Learn detection and prevention.", videoUrl: "https://www.youtube.com/embed/QBZtCU7r4eE" },
      { title: "Incident Response", content: "Develop incident response plans. Learn detection, containment, eradication, and recovery procedures.", videoUrl: "https://www.youtube.com/embed/bPVaOlJ-WNk" },
    ]},
  ],
}

export async function importEdxCourse(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role === "STUDENT") return { error: "Unauthorized" }

  const admin = createAdminClient()

  // ── Static course import (no external API needed) ──────────────
  if (courseId.startsWith("edx_static_")) {
    const staticData = STATIC_EDX_COURSES.find((c) => c.id === courseId)
    if (!staticData) return { error: "Static course not found" }

    const slug = slugify(staticData.title)
    const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
    if (existing) return { error: "Course already exists", id: existing.id }

    const { data: newCourse, error } = await createCourseInDb(admin, staticData.title, staticData.description, user.id)
    if (error || !newCourse) return { error: "Failed to create course" }

    const lessons = STATIC_COURSE_LESSONS[courseId]
    if (lessons) {
      for (let i = 0; i < lessons.length; i++) {
        const mod = await createModuleInDb(admin, lessons[i].module, i + 1, newCourse.id)
        if (!mod.data) continue
        for (let j = 0; j < lessons[i].lessons.length; j++) {
          const l = lessons[i].lessons[j]
          await createLessonInDb(admin, l.title, l.content || null, l.videoUrl, j + 1, mod.data.id)
        }
      }
    } else if (staticData.videoUrl) {
      const mod = await createModuleInDb(admin, "Course Content", 1, newCourse.id)
      if (mod.data) {
        await createLessonInDb(admin, "Course Introduction", staticData.description, staticData.videoUrl, 1, mod.data.id)
      }
    }

    revalidatePath("/courses")
    revalidatePath("/admin/courses")
    return { success: true, id: newCourse.id }
  }

  // ── Live edX API import ────────────────────────────────────────
  const provider = new OpenEdxProvider()

  try {
    const edxCourseId = courseId.replace(/^edx_/, "")
    const course = await provider.getCourse(edxCourseId)
    if (!course) return { error: "Course not found from edX API" }

    const slug = slugify(course.title)
    const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
    if (existing) return { error: "Course already exists", id: existing.id }

    const { data: newCourse, error } = await createCourseInDb(admin, course.title, course.description, user.id)
    if (error || !newCourse) return { error: "Failed to create course" }

    const sections = await provider.getCourseStructure(edxCourseId)
    const allLessons = await provider.getLessons(edxCourseId)

    if (sections.length > 0) {
      for (const section of sections) {
        const mod = await createModuleInDb(admin, section.title, section.position, newCourse.id)
        if (!mod.data) continue

        const sectionLessons = allLessons.filter((l) => l.id.startsWith(section.id))
        for (const lesson of sectionLessons) {
          await createLessonInDb(
            admin,
            lesson.title,
            lesson.description || null,
            lesson.contentType === "video" ? lesson.contentUrl || null : null,
            lesson.position,
            mod.data.id
          )
        }
      }
    } else {
      const mod = await createModuleInDb(admin, "Course Content", 1, newCourse.id)
      if (mod.data && course.videoUrl) {
        await createLessonInDb(admin, "Course Introduction", course.description || null, course.videoUrl, 1, mod.data.id)
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
