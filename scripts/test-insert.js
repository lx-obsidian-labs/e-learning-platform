const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const { data: instructor } = await admin.from("users").select('"id"').limit(1).single()
  console.log("Instructor:", instructor?.id)

  const { data, error } = await admin
    .from("courses")
    .insert({
      title: "Test Course",
      slug: "test-course",
      description: "A test course",
      price: 0,
      isFree: true,
      status: "PUBLISHED",
      instructorId: instructor?.id || "none",
      categoryId: null,
    })
    .select('"id"')
    .single()

  console.log("Result:", JSON.stringify({ data, error: error?.message }))
}

main()
