const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing SUPABASE env vars")
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function readLines() {
  return new Promise((resolve) => {
    const chunks = []
    process.stdin.on("data", (c) => chunks.push(c))
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString().trim()))
  })
}

async function main() {
  const demoUsers = [
    { name: "Admin User", email: "admin@example.com", password: "demo1234", role: "ADMIN" },
    { name: "John Instructor", email: "instructor@example.com", password: "demo1234", role: "INSTRUCTOR" },
    { name: "Jane Student", email: "student@example.com", password: "demo1234", role: "STUDENT" },
  ]

  for (const u of demoUsers) {
    console.log(`Creating ${u.email}...`)

    const { data: existingAuth } = await supabase.auth.admin.getUserByEmail(u.email)
    if (existingAuth?.user) {
      console.log(`  Already exists in auth.users, skipping`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    })

    if (error) {
      console.error(`  Error creating auth user: ${error.message}`)
      continue
    }

    const { error: insertError } = await supabase.from("users").upsert({
      id: data.user.id,
      name: u.name,
      email: u.email,
      role: u.role,
      updatedAt: new Date().toISOString(),
    }, { onConflict: "email" })

    if (insertError) {
      console.error(`  Error inserting profile: ${insertError.message}`)
    } else {
      console.log(`  Done`)
    }
  }

  console.log("Seed complete")
}

main().catch(console.error)
