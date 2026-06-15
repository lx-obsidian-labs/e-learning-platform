import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const team = [
  { name: "Siphesihle Nathan Vilane", role: "Founder & Lead Developer", initials: "SV" },
  { name: "LX Obsidian Labs", role: "Design & Engineering", initials: "LX" },
]

const milestones = [
  { year: "2024", title: "Platform Conception", desc: "LX Obsidian Labs was founded with a vision to democratize education through technology." },
  { year: "2025", title: "Beta Launch", desc: "Launched our first set of courses with interactive video lessons and progress tracking." },
  { year: "2026", title: "Full Release", desc: "Expanded to 10+ courses, AI tutor integration, and verified certification system." },
]

export default function AboutPage() {
  return (
    <div className="pt-16">
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative">
          <Badge variant="secondary" className="mb-4">About Us</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Democratizing Education
            <br />
            <span className="gradient-text bg-gradient-to-r from-primary to-primary/60">Through Technology</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LX Obsidian Labs is a premium e-learning platform built to provide
            high-quality, accessible education to learners worldwide. We believe
            knowledge should be free and accessible to everyone.
          </p>
        </div>
      </section>

      <section className="border-t border-border/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Our Mission</Badge>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Empowering learners worldwide
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We are dedicated to creating a learning experience that rivals
                traditional education. Our platform combines professional video
                content, interactive assessments, and community-driven support
                to deliver outcomes that matter.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you are starting a new career, upskilling for your current
                role, or exploring a passion, LX Obsidian Labs provides the tools
                and resources you need to succeed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { value: "10+", label: "Courses" },
                { value: "30+", label: "Lessons" },
                { value: "100%", label: "Free Access" },
                { value: "24/7", label: "Support" },
              ].map((s) => (
                <div key={s.label} className="p-6 rounded-xl border border-border/50 bg-background/50 text-center">
                  <div className="text-3xl font-bold gradient-text bg-gradient-to-r from-primary to-primary/60">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Timeline</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Our journey</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            {milestones.map((m, i) => (
              <div key={m.year} className="relative pl-8 border-l-2 border-border">
                <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                <Badge variant="secondary" className="mb-2">{m.year}</Badge>
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4">Team</Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-10">Built with passion</h2>
          <div className="flex justify-center gap-8 flex-wrap">
            {team.map((t) => (
              <div key={t.name} className="text-center p-6 rounded-xl border border-border/50 bg-background/50 min-w-[200px]">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">{t.initials}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of learners and start mastering new skills today.
          </p>
          <Button size="lg" className="h-12 px-8" asChild>
            <Link href="/auth/register">
              Get started free
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
