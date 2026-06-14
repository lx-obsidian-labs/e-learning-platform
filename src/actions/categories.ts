"use server"

import { prisma } from "@/lib/prisma"

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}

export async function seedCategories() {
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
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    })
  }
}
