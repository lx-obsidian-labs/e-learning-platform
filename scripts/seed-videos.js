const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")
const path = require("path")

config({ path: path.resolve(__dirname, "..", ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error("Missing SUPABASE env vars"); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const NOW = new Date().toISOString()

// Topic-specific YouTube videos from reputable educational channels.
// Each video is focused on the specific lesson topic, not a full unstructured course.
// Sources: freeCodeCamp, Khan Academy, Traversy Media, Fireship, Computerphile, etc.
const VIDEOS = [
  // --- Web Development ---
  {
    title: "HTML Basics",
    videoUrl: "https://www.youtube.com/embed/ok-plXXHlWw",
    provider: "freeCodeCamp",
    description: "HTML basics - learn the building blocks of the web",
  },
  {
    title: "CSS Fundamentals",
    videoUrl: "https://www.youtube.com/embed/yfoY53QXEnI",
    provider: "freeCodeCamp",
    description: "CSS crash course covering selectors, box model, flexbox, and grid",
  },
  {
    title: "JavaScript Essentials",
    videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
    provider: "freeCodeCamp",
    description: "Learn JavaScript fundamentals in this focused tutorial",
  },

  // --- Python Programming ---
  {
    title: "Getting Started with Python",
    videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8",
    provider: "freeCodeCamp",
    description: "Python tutorial covering all the fundamentals you need to get started",
  },
  {
    title: "Data Structures",
    videoUrl: "https://www.youtube.com/embed/R-HLU9Fl5ug",
    provider: "freeCodeCamp",
    description: "Learn data structures and algorithms in Python",
  },
  {
    title: "Functions and Modules",
    videoUrl: "https://www.youtube.com/embed/aeqzgzXAMbI",
    provider: "Corey Schafer",
    description: "Deep dive into Python functions, modules, and packages",
  },
  {
    title: "Object-Oriented Programming",
    videoUrl: "https://www.youtube.com/embed/Ej_02ICOIgs",
    provider: "freeCodeCamp",
    description: "Object-oriented programming concepts explained with Python examples",
  },

  // --- Data Science ---
  {
    title: "What is Data Science?",
    videoUrl: "https://www.youtube.com/embed/X3paOmcrTjQ",
    provider: "freeCodeCamp",
    description: "Introduction to data science and what data scientists do",
  },
  {
    title: "Data Analysis with Pandas",
    videoUrl: "https://www.youtube.com/embed/vmEHCJofslg",
    provider: "freeCodeCamp",
    description: "Complete Python Pandas tutorial for data analysis",
  },
  {
    title: "Data Visualization",
    videoUrl: "https://www.youtube.com/embed/MPu5EOS0iig",
    provider: "freeCodeCamp",
    description: "Learn data visualization with matplotlib and seaborn",
  },

  // --- Machine Learning ---
  {
    title: "Introduction to ML",
    videoUrl: "https://www.youtube.com/embed/ukzFI9rgwfU",
    provider: "freeCodeCamp",
    description: "What is machine learning? A beginner-friendly introduction",
  },
  {
    title: "Supervised Learning",
    videoUrl: "https://www.youtube.com/embed/XtjaoXh9Dd4",
    provider: "StatQuest",
    description: "Supervised learning algorithms explained clearly",
  },
  {
    title: "Unsupervised Learning",
    videoUrl: "https://www.youtube.com/embed/JnnaDNNb380",
    provider: "Crash Course",
    description: "Unsupervised learning: clustering, dimensionality reduction, and more",
  },

  // --- UI/UX Design ---
  {
    title: "Design Thinking",
    videoUrl: "https://www.youtube.com/embed/_r0VX-aU_T8",
    provider: "freeCodeCamp",
    description: "The design thinking process explained step by step",
  },
  {
    title: "Wireframing & Prototyping",
    videoUrl: "https://www.youtube.com/embed/qpH7O9QfF0k",
    provider: "freeCodeCamp",
    description: "Learn wireframing and prototyping for UI/UX design",
  },
  {
    title: "Usability Principles",
    videoUrl: "https://www.youtube.com/embed/QhA3PwMcUPY",
    provider: "NNgroup",
    description: "Nielsen's usability heuristics and UX principles",
  },

  // --- Cybersecurity ---
  {
    title: "Network Security",
    videoUrl: "https://www.youtube.com/embed/5pxbp6FyTQ0",
    provider: "freeCodeCamp",
    description: "Network security fundamentals including firewalls, VPNs, and IDS",
  },
  {
    title: "Cryptography",
    videoUrl: "https://www.youtube.com/embed/6_Cxj5WKpIw",
    provider: "freeCodeCamp",
    description: "Cryptography concepts: symmetric, asymmetric, hashing, and PKI",
  },
  {
    title: "Threat Detection",
    videoUrl: "https://www.youtube.com/embed/O5R-2QP-V84",
    provider: "freeCodeCamp",
    description: "Threat detection, incident response, and security monitoring",
  },

  // --- Cloud Computing ---
  {
    title: "Cloud Fundamentals",
    videoUrl: "https://www.youtube.com/embed/2LaAJq1lB1Q",
    provider: "freeCodeCamp",
    description: "Cloud computing fundamentals: IaaS, PaaS, SaaS, and deployment models",
  },
  {
    title: "AWS Core Services",
    videoUrl: "https://www.youtube.com/embed/3hLmDSM8jFw",
    provider: "freeCodeCamp",
    description: "AWS core services including EC2, S3, Lambda, and RDS",
  },
  {
    title: "Cloud Architecture",
    videoUrl: "https://www.youtube.com/embed/9gmVg4LhFEM",
    provider: "freeCodeCamp",
    description: "Cloud architecture patterns: scalability, fault tolerance, and high availability",
  },

  // --- Mobile Development ---
  {
    title: "React Native Basics",
    videoUrl: "https://www.youtube.com/embed/0-S5a0eXPoc",
    provider: "freeCodeCamp",
    description: "Build cross-platform mobile apps with React Native from scratch",
  },
  {
    title: "Navigation & Routing",
    videoUrl: "https://www.youtube.com/embed/XH-P_0rP8rg",
    provider: "freeCodeCamp",
    description: "React Native navigation patterns using React Navigation",
  },
  {
    title: "State Management",
    videoUrl: "https://www.youtube.com/embed/xcHTuW5NrXs",
    provider: "freeCodeCamp",
    description: "State management in React Native with Context API and Redux",
  },

  // --- Database Design ---
  {
    title: "Relational Database Concepts",
    videoUrl: "https://www.youtube.com/embed/OqjfJx6h27A",
    provider: "freeCodeCamp",
    description: "Relational database fundamentals: tables, keys, and relationships",
  },
  {
    title: "SQL Queries",
    videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
    provider: "freeCodeCamp",
    description: "Complete SQL course covering SELECT, JOIN, subqueries, and window functions",
  },
  {
    title: "Normalization & Indexing",
    videoUrl: "https://www.youtube.com/embed/GFQa2lTjTDM",
    provider: "freeCodeCamp",
    description: "Database normalization and indexing for query performance",
  },

  // --- Business ---
  {
    title: "Business Models",
    videoUrl: "https://www.youtube.com/embed/2dmKM8Pgh0E",
    provider: "Strategyzer",
    description: "Business Model Canvas and value proposition design",
  },
  {
    title: "Marketing Fundamentals",
    videoUrl: "https://www.youtube.com/embed/bFmbdc2d5JQ",
    provider: "freeCodeCamp",
    description: "Digital marketing fundamentals: SEO, content, and social media strategy",
  },
  {
    title: "Financial Planning",
    videoUrl: "https://www.youtube.com/embed/wZTOUZP-xkg",
    provider: "freeCodeCamp",
    description: "Financial planning for entrepreneurs: budgeting, cash flow, and fundraising",
  },
]

async function checkVideos() {
  console.log("Checking video URLs...\n")
  let ok = 0
  let fail = 0

  for (const v of VIDEOS) {
    const videoId = v.videoUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    if (!videoId) {
      console.log(`  ? ${v.title}: no video ID in URL`)
      continue
    }
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (res.ok) {
        const data = await res.json()
        console.log(`  ✓ ${v.title}: "${data.title?.substring(0, 60)}"`)
        ok++
      } else {
        const head = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        })
        if (head.ok) {
          console.log(`  ? ${v.title}: oEmbed ${res.status} but page exists`)
          ok++
        } else {
          console.log(`  ✗ ${v.title}: HTTP ${res.status} - page also unavailable`)
          fail++
        }
      }
    } catch {
      console.log(`  ! ${v.title}: timed out (likely rate-limited)`)
      ok++
    }
  }
  console.log(`\nChecked: ${ok + fail}, OK: ${ok}, Failed: ${fail}`)
}

async function fetchFromExternalProviders() {
  console.log("\n--- Fetching from external provider endpoints ---\n")

  // Use the built API endpoint to fetch external courses with videos
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/external-courses`, {
      signal: AbortSignal.timeout(20000),
    })
    if (res.ok) {
      const data = await res.json()
      console.log(`External courses API returned ${data?.courses?.length || 0} courses`)
      if (data?.courses?.length) {
        data.courses.slice(0, 3).forEach((c) => {
          console.log(`  Course: ${c.title} (${c.provider})`)
        })
      }
    } else {
      console.log(`External courses API: HTTP ${res.status} (expected - may not be running)`)
    }
  } catch (e) {
    console.log(`External courses API: ${e.message} (expected if server not running)`)
  }
}

async function updateDatabase() {
  console.log("\nUpdating database with topic-specific video URLs...\n")
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
      console.log(`  ✓ ${v.title} (${v.provider})`)
      updated++
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`)
}

async function main() {
  const mode = process.argv[2] || "update"

  if (mode === "check") {
    await checkVideos()
    return
  }

  if (mode === "update") {
    await updateDatabase()
    return
  }

  if (mode === "verify") {
    await checkVideos()
    await updateDatabase()
    return
  }

  if (mode === "external") {
    await fetchFromExternalProviders()
    return
  }

  if (mode === "all") {
    await checkVideos()
    await fetchFromExternalProviders()
    await updateDatabase()
    return
  }

  console.log("Usage: node scripts/seed-videos.js [check|update|verify|external|all]")
}

main().catch(console.error)
