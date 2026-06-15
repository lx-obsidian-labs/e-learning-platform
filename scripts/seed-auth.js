const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")
const path = require("path")

config({ path: path.resolve(__dirname, "..", ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing SUPABASE env vars")
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const demoUsers = [
    { name: "Admin User", email: "admin@example.com", password: "demo1234", role: "ADMIN" },
    { name: "John Instructor", email: "instructor@example.com", password: "demo1234", role: "INSTRUCTOR" },
    { name: "Jane Student", email: "student@example.com", password: "demo1234", role: "STUDENT" },
  ]

  for (const u of demoUsers) {
    console.log(`Setting up ${u.email}...`)

    const { data: userList } = await supabase.auth.admin.listUsers()
    let authUser = userList?.users?.find((x) => x.email === u.email)

    if (authUser) {
      await supabase.auth.admin.deleteUser(authUser.id)
      console.log(`  Deleted old auth user`)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    })
    if (error) { console.error(`  Error: ${error.message}`); continue }
    authUser = data.user

    // Delete old public.users row if exists, then insert fresh
    await supabase.from("users").delete().eq("email", u.email)

    const { error: insertError } = await supabase.from("users").insert({
      id: authUser.id,
      name: u.name,
      email: u.email,
      role: u.role,
      updatedAt: new Date().toISOString(),
    })

    if (insertError) {
      console.error(`  Insert error: ${insertError.message}`)
    } else {
      console.log(`  Done`)
    }
  }

  console.log("Seed complete")
}

main().catch(console.error)
