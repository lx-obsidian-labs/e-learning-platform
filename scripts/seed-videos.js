const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")
const path = require("path")

config({ path: path.resolve(__dirname, "..", ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) { console.error("Missing SUPABASE env vars"); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const VIDEO_URLS = {
  "HTML Basics": "https://www.youtube.com/watch?v=qz0aGYrrlhU",
  "CSS Fundamentals": "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
  "JavaScript Essentials": "https://www.youtube.com/watch?v=W6NZfCO5SIk",
  "Getting Started with Python": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
  "Data Structures": "https://www.youtube.com/watch?v=R-HLU9Fl5ug",
  "Functions and Modules": "https://www.youtube.com/watch?v=9Os0Q3Qn3Vs",
  "Object-Oriented Programming": "https://www.youtube.com/watch?v=Ej_02ICOIgs",
  "What is Data Science?": "https://www.youtube.com/watch?v=X3paOmcrTjQ",
  "Data Analysis with Pandas": "https://www.youtube.com/watch?v=vmEHCJofslg",
  "Data Visualization": "https://www.youtube.com/watch?v=MPu5EOS0iig",
  "Introduction to ML": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
  "Supervised Learning": "https://www.youtube.com/watch?v=XtjaoXh9Dd4",
  "Unsupervised Learning": "https://www.youtube.com/watch?v=JnnaDNNb380",
  "Design Thinking": "https://www.youtube.com/watch?v=gHGN6hs2gZY",
  "Wireframing & Prototyping": "https://www.youtube.com/watch?v=4WnL1S1rB3o",
  "Usability Principles": "https://www.youtube.com/watch?v=QhA3PwMcUPY",
  "Network Security": "https://www.youtube.com/watch?v=ZtkfDA7X0BA",
  "Cryptography": "https://www.youtube.com/watch?v=6_Cxj5WKpIw",
  "Threat Detection": "https://www.youtube.com/watch?v=O5R-2QP-V84",
  "Cloud Fundamentals": "https://www.youtube.com/watch?v=2LaAJq1lB1Q",
  "AWS Core Services": "https://www.youtube.com/watch?v=3hLmDSM8jFw",
  "Cloud Architecture": "https://www.youtube.com/watch?v=ucJ3-9kTX0g",
  "React Native Basics": "https://www.youtube.com/watch?v=0-S5a0eXPoc",
  "Navigation & Routing": "https://www.youtube.com/watch?v=EbQ2U3YJvk8",
  "State Management": "https://www.youtube.com/watch?v=5pvoa7dC2bM",
  "Relational Database Concepts": "https://www.youtube.com/watch?v=OqjfJx6h27A",
  "SQL Queries": "https://www.youtube.com/watch?v=7S_tz1z_5bA",
  "Normalization & Indexing": "https://www.youtube.com/watch?v=GFQa2lTjTDM",
  "Business Models": "https://www.youtube.com/watch?v=2dmKM8Pgh0E",
  "Marketing Fundamentals": "https://www.youtube.com/watch?v=bFmbdc2d5JQ",
  "Financial Planning": "https://www.youtube.com/watch?v=D1vi1MSFJxM",
}

async function main() {
  const { data: lessons } = await admin.from("lessons").select("id, title")
  if (!lessons || lessons.length === 0) {
    console.log("No lessons found")
    return
  }

  let updated = 0
  for (const lesson of lessons) {
    const videoUrl = VIDEO_URLS[lesson.title]
    if (!videoUrl) {
      console.log(`  No video URL mapped for: ${lesson.title}`)
      continue
    }
    const { error } = await admin
      .from("lessons")
      .update({ videoUrl, updatedAt: new Date().toISOString() })
      .eq('"id"', lesson.id)

    if (error) {
      console.log(`  Failed to update "${lesson.title}": ${error.message}`)
    } else {
      console.log(`  ✓ Updated: ${lesson.title}`)
      updated++
    }
  }

  console.log(`\nDone! Updated ${updated}/${lessons.length} lessons with video URLs.`)
}

main().catch(console.error)
