import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const faqCategories = [
  {
    title: "Getting Started",
    questions: [
      { q: "How do I create an account?", a: "Click 'Get started' on the homepage and fill in your details. You can sign up with your email or social accounts." },
      { q: "Is the platform really free?", a: "Yes! All courses are completely free to access. Premium plans are optional and unlock additional features like AI tutor access and premium certificates." },
      { q: "Do I need any prior experience?", a: "No. Our courses range from beginner to advanced levels. Each course page shows the prerequisites." },
    ],
  },
  {
    title: "Courses & Learning",
    questions: [
      { q: "How are courses structured?", a: "Courses are organized into modules, each containing video lessons, reading materials, and quizzes to test your understanding." },
      { q: "Can I access courses on mobile?", a: "Yes, our platform is fully responsive and optimized for all devices including smartphones and tablets." },
      { q: "How long do I have access to a course?", a: "Once enrolled, you have lifetime access to the course materials. There are no time limits." },
    ],
  },
  {
    title: "Certificates & Progress",
    questions: [
      { q: "How do I earn a certificate?", a: "Complete all lessons and quizzes in a course with a passing score to earn your certificate." },
      { q: "Are certificates verified?", a: "Premium certificates include a verification code that employers can use to verify your achievement." },
      { q: "Can I share my certificate on LinkedIn?", a: "Yes! You can download your certificate and share it directly on LinkedIn or add it to your portfolio." },
    ],
  },
  {
    title: "Technical Support",
    questions: [
      { q: "What browsers are supported?", a: "We support all modern browsers including Chrome, Firefox, Safari, and Edge." },
      { q: "How do I get help?", a: "You can reach us through the Contact page, or use the AI tutor for instant help with course content." },
      { q: "How do I report a bug?", a: "Please contact our support team with details about the issue, and we will resolve it as quickly as possible." },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="pt-16">
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about LX Obsidian Labs.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-12">
          {faqCategories.map((cat) => (
            <div key={cat.title}>
              <h2 className="text-xl font-semibold mb-6">{cat.title}</h2>
              <div className="space-y-3">
                {cat.questions.map((item) => (
                  <details key={item.q} className="group rounded-xl border border-border/50 bg-background/50 open:border-primary/20 transition-colors">
                    <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm list-none">
                      {item.q}
                      <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-8">
            We are here to help. Reach out to our support team.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
