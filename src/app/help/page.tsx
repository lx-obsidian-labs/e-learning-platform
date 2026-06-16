import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, BookOpen, MessageCircle, FileText, Search, Mail } from "lucide-react"

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    desc: "New to Edu Learn? Start here.",
    articles: [
      "How to create an account",
      "How to enrol in a course",
      "Navigating your dashboard",
      "Understanding gamification & XP",
    ],
  },
  {
    icon: MessageCircle,
    title: "Courses & Learning",
    desc: "Everything about taking courses.",
    articles: [
      "How courses are structured",
      "Completing lessons and quizzes",
      "Using spaced repetition reviews",
      "Earning certificates",
    ],
  },
  {
    icon: FileText,
    title: "Account & Billing",
    desc: "Manage your account and payments.",
    articles: [
      "Updating your profile",
      "Payment methods and EFT",
      "Order history and receipts",
      "Cancelling your plan",
    ],
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    desc: "Common issues and solutions.",
    articles: [
      "Browser compatibility",
      "Video playback issues",
      "AI assistant not working",
      "Getting help from support",
    ],
  },
]

export const metadata = {
  title: "Help Center - Edu Learn",
  description: "Find answers to common questions about using Edu Learn, from getting started to troubleshooting.",
}

export default function HelpPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative">
          <Badge variant="secondary" className="mb-4">Help Center</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            How can we help?
          </h1>
          <p className="lead max-w-2xl mx-auto mt-4">
            Find guides, tutorials, and answers to common questions about Edu Learn.
          </p>
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search the help center..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {helpCategories.map((cat) => (
              <Card key={cat.title} variant="pro" className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <cat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold">{cat.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{cat.desc}</p>
                      <ul className="mt-4 space-y-2">
                        {cat.articles.map((article) => (
                          <li key={article}>
                            <Link
                              href="#"
                              className="text-sm text-primary hover:text-primary/80 hover:underline underline-offset-2 transition-colors"
                            >
                              {article}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Our support team is ready to assist you with any questions or issues.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="btn-premium" asChild>
              <Link href="/contact">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
