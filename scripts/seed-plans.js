const { createClient } = require("@supabase/supabase-js")
const path = require("path")

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const admin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const plans = [
  {
    id: "plan_free",
    name: "Free",
    description: "Get started with our free tier. No credit card required.",
    price: 0,
    currency: "USD",
    interval: null,
    features: [
      "Access to all free courses",
      "Video lessons & quizzes",
      "Progress tracking",
      "Community discussions",
      "Basic certificates",
    ],
    active: true,
  },
  {
    id: "plan_premium",
    name: "Premium",
    description: "Unlock the full LX Obsidian experience.",
    price: 9,
    currency: "ZAR",
    interval: "month",
    features: [
      "Everything in Free",
      "Access to all paid courses",
      "AI Tutor access",
      "Premium certificates",
      "Priority support",
      "Ad-free experience",
      "Offline downloads",
      "Early access to new courses",
    ],
    active: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    description: "For teams and organizations.",
    price: 29,
    currency: "ZAR",
    interval: "month",
    features: [
      "Everything in Premium",
      "Team management",
      "Custom learning paths",
      "Analytics dashboard",
      "API access",
      "Dedicated support",
      "Custom branding",
    ],
    active: true,
  },
]

async function seed() {
  for (const plan of plans) {
    const { error } = await admin.from("pricing_plans").upsert(plan, { onConflict: "id" })
    if (error) {
      console.error(`Failed to seed plan "${plan.name}":`, error.message)
    } else {
      console.log(`Seeded plan: ${plan.name} (${plan.price} ${plan.currency})`)
    }
  }
  console.log("Done!")
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
