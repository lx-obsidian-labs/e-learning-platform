"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order('"name"', { ascending: true })
  if (error) return []
  return data
}

export async function seedCategories() {
  const supabase = createAdminClient()
  const categories = [
    { name: "Web Development", slug: "web-development" },
    { name: "Mobile Development", slug: "mobile-development" },
    { name: "Data Science", slug: "data-science" },
    { name: "Machine Learning", slug: "machine-learning" },
    { name: "DevOps", slug: "devops" },
    { name: "Cloud Computing", slug: "cloud-computing" },
    { name: "Cybersecurity", slug: "cybersecurity" },
    { name: "Database Design", slug: "database-design" },
    { name: "UI/UX Design", slug: "ui-ux-design" },
    { name: "Graphic Design", slug: "graphic-design" },
    { name: "Business", slug: "business" },
    { name: "Marketing", slug: "marketing" },
    { name: "Mathematics", slug: "mathematics" },
    { name: "Science", slug: "science" },
    { name: "Languages", slug: "languages" },
    { name: "Music", slug: "music" },
    { name: "Photography", slug: "photography" },
    { name: "Health & Fitness", slug: "health-fitness" },
    { name: "Personal Development", slug: "personal-development" },
    { name: "Other", slug: "other" },
  ]

  for (const cat of categories) {
    const { data: existing } = await supabase
      .from("categories")
      .select('"id"')
      .eq('"slug"', cat.slug)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("categories")
        .update({ name: cat.name })
        .eq('"slug"', cat.slug)
    } else {
      await supabase
        .from("categories")
        .insert(cat)
    }
  }
}
