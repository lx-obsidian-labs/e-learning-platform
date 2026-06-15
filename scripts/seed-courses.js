const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")
const path = require("path")

config({ path: path.resolve(__dirname, "..", ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) { console.error("Missing SUPABASE env vars"); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }

async function ensureCategories() {
  const cats = [
    "Web Development","Mobile Development","Data Science","Machine Learning",
    "DevOps","Cloud Computing","Cybersecurity","Database Design",
    "UI/UX Design","Graphic Design","Business","Marketing",
    "Mathematics","Science","Languages","Music",
    "Photography","Health & Fitness","Personal Development","Other",
    "Academic","Programming"
  ]
  const map = {}
  for (const name of cats) {
    const slug = slugify(name)
    const { data: existing } = await admin.from("categories").select('"id"').eq('"slug"', slug).maybeSingle()
    if (existing) { map[name] = existing.id; continue }
    const { data } = await admin.from("categories").insert({ name, slug }).select('"id"').single()
    if (data) map[name] = data.id
  }
  return map
}

async function getOrCreateInstructor() {
  const { data: users } = await admin.auth.admin.listUsers()
  let instructor = users?.users?.find(u => u.email === "instructor@example.com")
  if (!instructor) {
    const { data } = await admin.auth.admin.createUser({
      email: "instructor@example.com", password: "demo1234",
      email_confirm: true, user_metadata: { name: "John Instructor", role: "INSTRUCTOR" }
    })
    if (data?.user) {
      await admin.from("users").upsert({
        id: data.user.id, name: "John Instructor", email: "instructor@example.com",
        role: "INSTRUCTOR", updatedAt: new Date().toISOString()
      }, { onConflict: "email", ignoreDuplicates: false }).catch(() => {})
      instructor = data.user
    }
  }
  if (!instructor) { console.error("No instructor available"); process.exit(1) }
  return instructor
}

const FREE_COURSES = [
  {
    title: "Introduction to Web Development",
    description: "Learn HTML, CSS, and JavaScript fundamentals. Build responsive websites from scratch with modern web technologies.",
    category: "Web Development",
    lessons: [
      { title: "HTML Basics", content: "HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure of web content using elements like headings, paragraphs, links, and images." },
      { title: "CSS Fundamentals", content: "CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML. It controls layout, colors, fonts, and responsive design." },
      { title: "JavaScript Essentials", content: "JavaScript is a high-level, interpreted programming language that enables interactive web pages. Learn variables, functions, DOM manipulation, and event handling." },
    ]
  },
  {
    title: "Python Programming for Beginners",
    description: "Master Python programming from the ground up. Covers data types, control flow, functions, object-oriented programming, and file handling.",
    category: "Programming",
    lessons: [
      { title: "Getting Started with Python", content: "Python is an interpreted, high-level, general-purpose programming language. Its design philosophy emphasizes code readability with its notable use of significant indentation." },
      { title: "Data Structures", content: "Learn about Python's built-in data structures: lists, tuples, dictionaries, and sets. Understand when to use each and their performance characteristics." },
      { title: "Functions and Modules", content: "Functions are reusable blocks of code that perform specific tasks. Modules allow you to organize code into separate files and namespaces." },
      { title: "Object-Oriented Programming", content: "OOP is a programming paradigm based on the concept of objects containing data and methods. Learn classes, inheritance, polymorphism, and encapsulation." },
    ]
  },
  {
    title: "Data Science Fundamentals",
    description: "Explore data analysis, visualization, and machine learning concepts using Python. Perfect for beginners entering the data science field.",
    category: "Data Science",
    lessons: [
      { title: "What is Data Science?", content: "Data science combines statistics, computer science, and domain expertise to extract insights from data. It involves collecting, cleaning, analyzing, and interpreting data." },
      { title: "Data Analysis with Pandas", content: "Pandas is a powerful Python library for data manipulation and analysis. It provides data structures like DataFrames for handling structured data." },
      { title: "Data Visualization", content: "Visualization helps communicate insights effectively. Learn matplotlib, seaborn, and plotly for creating compelling charts and graphs." },
    ]
  },
  {
    title: "Machine Learning 101",
    description: "Understand machine learning algorithms, supervised and unsupervised learning, neural networks, and practical model building with scikit-learn.",
    category: "Machine Learning",
    lessons: [
      { title: "Introduction to ML", content: "Machine learning is a subset of AI that enables systems to learn from data without explicit programming. Learn about supervised, unsupervised, and reinforcement learning." },
      { title: "Supervised Learning", content: "Supervised learning uses labeled data to train models. Cover regression, classification, decision trees, random forests, and support vector machines." },
      { title: "Unsupervised Learning", content: "Unsupervised learning finds patterns in unlabeled data. Learn clustering, dimensionality reduction, and association rule mining." },
    ]
  },
  {
    title: "UI/UX Design Principles",
    description: "Master user interface and user experience design. Learn design thinking, wireframing, prototyping, and usability testing.",
    category: "UI/UX Design",
    lessons: [
      { title: "Design Thinking", content: "Design thinking is a human-centered approach to innovation. It involves five phases: empathize, define, ideate, prototype, and test." },
      { title: "Wireframing & Prototyping", content: "Wireframes are low-fidelity layouts that define structure and hierarchy. Prototypes add interactivity for user testing and stakeholder feedback." },
      { title: "Usability Principles", content: "Learn Nielsen's 10 usability heuristics: visibility, consistency, error prevention, recognition rather than recall, and user control." },
    ]
  },
  {
    title: "Cybersecurity Basics",
    description: "Learn network security, cryptography, threat detection, and security best practices. Essential knowledge for protecting digital assets.",
    category: "Cybersecurity",
    lessons: [
      { title: "Network Security", content: "Network security protects data during transmission. Learn about firewalls, VPNs, intrusion detection systems, and secure network protocols." },
      { title: "Cryptography", content: "Cryptography secures information through encryption. Understand symmetric/asymmetric encryption, hashing, digital signatures, and PKI." },
      { title: "Threat Detection", content: "Identify and respond to security threats. Learn about malware analysis, SIEM tools, incident response, and penetration testing methodology." },
    ]
  },
  {
    title: "Cloud Computing with AWS",
    description: "Learn cloud fundamentals, AWS services, deployment models, and cloud architecture. Prepare for cloud computing certification.",
    category: "Cloud Computing",
    lessons: [
      { title: "Cloud Fundamentals", content: "Cloud computing delivers computing services over the internet. Learn IaaS, PaaS, SaaS models, and the benefits of scalability, reliability, and cost efficiency." },
      { title: "AWS Core Services", content: "Explore Amazon Web Services including EC2, S3, RDS, Lambda, and Route 53. Understand how these services power modern applications." },
      { title: "Cloud Architecture", content: "Design scalable, fault-tolerant cloud architectures. Learn about load balancing, auto-scaling, disaster recovery, and the Well-Architected Framework." },
    ]
  },
  {
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile apps using React Native. Learn components, navigation, state management, and deployment for iOS and Android.",
    category: "Mobile Development",
    lessons: [
      { title: "React Native Basics", content: "React Native lets you build mobile apps using JavaScript and React. It compiles to native components for iOS and Android platforms." },
      { title: "Navigation & Routing", content: "Implement navigation patterns using React Navigation. Learn stack, tab, and drawer navigators for seamless app flow." },
      { title: "State Management", content: "Manage app state effectively using Context API, Redux, or Zustand. Understand when to use local vs global state." },
    ]
  },
  {
    title: "Database Design & SQL",
    description: "Learn relational database design, SQL queries, normalization, indexing, and performance optimization. Essential for any developer.",
    category: "Database Design",
    lessons: [
      { title: "Relational Database Concepts", content: "Relational databases store data in tables with rows and columns. Learn about primary keys, foreign keys, and entity-relationship modeling." },
      { title: "SQL Queries", content: "SQL is the standard language for querying databases. Master SELECT, JOIN, GROUP BY, subqueries, and window functions." },
      { title: "Normalization & Indexing", content: "Normalization reduces data redundancy. Indexing improves query performance. Learn about normal forms and B-tree indexes." },
    ]
  },
  {
    title: "Business & Entrepreneurship",
    description: "Learn business fundamentals, business model canvas, marketing strategies, financial planning, and startup essentials.",
    category: "Business",
    lessons: [
      { title: "Business Models", content: "A business model describes how an organization creates, delivers, and captures value. Learn the Business Model Canvas and value proposition design." },
      { title: "Marketing Fundamentals", content: "Marketing involves promoting products to target audiences. Learn the 4 Ps, digital marketing, SEO, content marketing, and social media strategy." },
      { title: "Financial Planning", content: "Financial planning ensures business sustainability. Cover budgeting, cash flow management, financial statements, and fundraising basics." },
    ]
  },
]

async function main() {
  console.log("Ensuring categories...")
  const catMap = await ensureCategories()

  console.log("Getting instructor...")
  const instructor = await getOrCreateInstructor()

  let imported = 0
  for (const course of FREE_COURSES) {
    const slug = slugify(course.title)
    const { data: existing } = await admin.from("courses").select('"id"').eq('"slug"', slug).maybeSingle()
    if (existing) { console.log(`  Skipped: ${course.title}`); continue }

    const { randomUUID } = require("crypto")
    const courseId = randomUUID()
    const now = new Date().toISOString()

    const { data: newCourse, error } = await admin.from("courses").insert({
      id: courseId,
      title: course.title, slug, description: course.description,
      price: 0, isFree: true, status: "PUBLISHED",
      instructorId: instructor.id,
      categoryId: catMap[course.category] || null,
      updatedAt: now,
    }).select('"id"').single()

    if (error || !newCourse) { console.log(`  Failed: ${course.title} — ${error?.message || "no data"}`); continue }

    const modId = randomUUID()
    const { data: mod } = await admin.from("modules").insert({
      id: modId,
      title: "Course Content", order: 1, courseId: newCourse.id,
    }).select('"id"').single()

    if (mod) {
      for (let i = 0; i < course.lessons.length; i++) {
        await admin.from("lessons").insert({
          id: randomUUID(),
          title: course.lessons[i].title,
          content: course.lessons[i].content,
          order: i + 1, moduleId: mod.id,
          updatedAt: now,
        })
      }
    }

    console.log(`  Imported: ${course.title}`)
    imported++
  }

  console.log(`\nDone! Imported ${imported} courses.`)
}

main().catch(console.error)
