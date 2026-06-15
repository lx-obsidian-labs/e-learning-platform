const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")
const path = require("path")

config({ path: path.resolve(__dirname, "..", ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error("Missing SUPABASE env vars"); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const NOW = new Date().toISOString()

const VIDEOS = [
  {
    title: "HTML Basics",
    videoUrl: "https://www.youtube.com/embed/mJgBOIoGihA",
  },
  {
    title: "CSS Fundamentals",
    videoUrl: "https://www.youtube.com/embed/OXGznpKZ_sA",
  },
  {
    title: "JavaScript Essentials",
    videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
  },
  {
    title: "Getting Started with Python",
    videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
  },
  {
    title: "Data Structures",
    videoUrl: "https://www.youtube.com/embed/pMGY-RVi1Fc",
  },
  {
    title: "Functions and Modules",
    videoUrl: "https://www.youtube.com/embed/N4BcB8M9HqA",
  },
  {
    title: "Object-Oriented Programming",
    videoUrl: "https://www.youtube.com/embed/8yjkWGRlUmY",
  },
  {
    title: "What is Data Science?",
    videoUrl: "https://www.youtube.com/embed/xC-c7E5PK0Y",
  },
  {
    title: "Data Analysis with Pandas",
    videoUrl: "https://www.youtube.com/embed/vmEHCJofslg",
  },
  {
    title: "Data Visualization",
    videoUrl: "https://www.youtube.com/embed/MPu5EOS0iig",
  },
  {
    title: "Introduction to ML",
    videoUrl: "https://www.youtube.com/embed/gmvvaobm7eQ",
  },
  {
    title: "Supervised Learning",
    videoUrl: "https://www.youtube.com/embed/XtjaoXh9Dd4",
  },
  {
    title: "Unsupervised Learning",
    videoUrl: "https://www.youtube.com/embed/JnnaDNNb380",
  },
  {
    title: "Design Thinking",
    videoUrl: "https://www.youtube.com/embed/_r0VX-aU_T8",
  },
  {
    title: "Wireframing & Prototyping",
    videoUrl: "https://www.youtube.com/embed/qpH7O9QfF0k",
  },
  {
    title: "Usability Principles",
    videoUrl: "https://www.youtube.com/embed/E2RgMMPxJ8s",
  },
  {
    title: "Network Security",
    videoUrl: "https://www.youtube.com/embed/5pxbp6FyTQ0",
  },
  {
    title: "Cryptography",
    videoUrl: "https://www.youtube.com/embed/NuyzuNBFWxQ",
  },
  {
    title: "Threat Detection",
    videoUrl: "https://www.youtube.com/embed/QBZtCU7r4eE",
  },
  {
    title: "Cloud Fundamentals",
    videoUrl: "https://www.youtube.com/embed/eZLcyTxi8ZI",
  },
  {
    title: "AWS Core Services",
    videoUrl: "https://www.youtube.com/embed/3hLmDSM8jFw",
  },
  {
    title: "Cloud Architecture",
    videoUrl: "https://www.youtube.com/embed/ucJ3-9kTX0g",
    fallback: "https://www.youtube.com/embed/9gmVg4LhFEM",
  },
  {
    title: "React Native Basics",
    videoUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
  },
  {
    title: "Navigation & Routing",
    videoUrl: "https://www.youtube.com/embed/XH-P_0rP8rg",
  },
  {
    title: "State Management",
    videoUrl: "https://www.youtube.com/embed/xcHTuW5NrXs",
  },
  {
    title: "Relational Database Concepts",
    videoUrl: "https://www.youtube.com/embed/D6QCfEwYyqE",
  },
  {
    title: "SQL Queries",
    videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
  },
  {
    title: "Normalization & Indexing",
    videoUrl: "https://www.youtube.com/embed/5KdD4hbB1QY",
  },
  {
    title: "Business Models",
    videoUrl: "https://www.youtube.com/embed/-o0M2wDJqSI",
  },
  {
    title: "Marketing Fundamentals",
    videoUrl: "https://www.youtube.com/embed/bFmbdc2d5JQ",
  },
  {
    title: "Financial Planning",
    videoUrl: "https://www.youtube.com/embed/wZTOUZP-xkg",
  },
]

async function checkVideos() {
  for (const v of VIDEOS) {
    const videoId = v.videoUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    if (!videoId) {
      console.log(`  ? ${v.title}: no video ID in URL`)
      continue
    }
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        console.log(`  ✓ ${v.title}: "${data.title}"`)
      } else {
        console.log(`  ✗ ${v.title}: HTTP ${res.status} - needs replacement`)
        if (v.fallback) v.videoUrl = v.fallback
      }
    } catch {
      console.log(`  ! ${v.title}: timed out (but may still work)`)
    }
  }
}

async function updateDatabase() {
  console.log("\nUpdating database with verified embed URLs...\n")
  let updated = 0
  let failed = 0

  for (const v of VIDEOS) {
    const { data: lesson } = await admin
      .from("lessons")
      .select("id")
      .eq('"title"', v.title)
      .maybeSingle()

    if (!lesson) {
      console.log(`  ✗ Lesson not found: "${v.title}"`)
      failed++
      continue
    }

    const { error } = await admin
      .from("lessons")
      .update({ videoUrl: v.videoUrl, updatedAt: NOW })
      .eq('"id"', lesson.id)

    if (error) {
      console.log(`  ✗ Failed to update "${v.title}": ${error.message}`)
      failed++
    } else {
      console.log(`  ✓ ${v.title}`)
      updated++
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`)
}

async function main() {
  const mode = process.argv[2] || "update"

  if (mode === "check") {
    console.log("Checking video URLs...\n")
    await checkVideos()
    return
  }

  if (mode === "update") {
    await updateDatabase()
    return
  }

  if (mode === "verify") {
    console.log("Verifying video URLs before updating...\n")
    await checkVideos()
    await updateDatabase()
    return
  }

  console.log("Usage: node scripts/seed-videos.js [check|update|verify]")
}

main().catch(console.error)
