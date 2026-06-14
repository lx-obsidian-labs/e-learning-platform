import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

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
  console.log(`Seeded ${categories.length} categories`)

  const demoPassword = await bcrypt.hash("demo1234", 12)

  const demoUsers = [
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: demoPassword,
      role: "ADMIN" as const,
    },
    {
      name: "John Instructor",
      email: "instructor@example.com",
      passwordHash: demoPassword,
      role: "INSTRUCTOR" as const,
    },
    {
      name: "Jane Student",
      email: "student@example.com",
      passwordHash: demoPassword,
      role: "STUDENT" as const,
    },
  ]

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    })
  }
  console.log("Seeded demo users (password: demo1234)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
