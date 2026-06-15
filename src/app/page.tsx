import { getPublishedCourses } from "@/actions/courses"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const stats = [
  { value: "10+", label: "Expert-Led Courses" },
  { value: "30+", label: "Video Lessons" },
  { value: "100%", label: "Free Access" },
  { value: "24/7", label: "Community Support" },
]

const features = [
  {
    title: "Professional Video Lessons",
    desc: "High-quality video content with interactive transcripts and playback controls optimized for all devices.",
    icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  },
  {
    title: "Progress Tracking",
    desc: "Track your learning journey with detailed progress bars, completion badges, and achievement certificates.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "Interactive Quizzes",
    desc: "Test your knowledge with interactive quizzes at the end of each module. Instant feedback and detailed results.",
    icon: "M9 12l3 3m0 0l3-3m-3 3v-6m-9 3a9 9 0 1118 0 9 9 0 01-18 0z",
  },
  {
    title: "Discussion Forums",
    desc: "Engage with instructors and peers through integrated discussion forums. Get your questions answered fast.",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    title: "AI Tutor Assistant",
    desc: "Get personalized help from our AI tutor. Ask questions, get explanations, and deepen your understanding.",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
  },
  {
    title: "Verified Certificates",
    desc: "Earn verified certificates upon course completion. Share them on LinkedIn or add to your portfolio.",
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    content: "This platform completely transformed my career. The structured curriculum and hands-on projects helped me land my dream job.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    content: "The quality of instruction is outstanding. I particularly love the interactive quizzes and the AI tutor feature that helps when I'm stuck.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    content: "Finally, an e-learning platform that gets it right. The video lessons are professional, and the progress tracking keeps me motivated.",
    rating: 5,
  },
]

export default async function HomePage() {
  const courses = await getPublishedCourses()
  const featured = courses.slice(0, 6)

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05] animate-gradient-shift" />
        <div className="absolute top-40 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-32 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 via-primary/5 to-primary/3 rounded-full blur-3xl animate-pulse-glow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm text-sm text-muted-foreground mb-6 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Free &amp; Open Education Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-slide-up">
              Master New Skills
              <br />
              <span className="gradient-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                With Expert-Led Courses
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Access high-quality video lessons, interactive quizzes, and earn verified certificates
              — all completely free. Start your learning journey with LX Obsidian Labs today.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/25 animate-pulse-glow" asChild>
                <Link href="/auth/register">
                  Start learning free
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-2" asChild>
                <Link href="/courses">Explore courses</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
              {stats.map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text bg-gradient-to-r from-primary to-primary/60">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Why Choose LX Obsidian</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-3 text-muted-foreground">
              A premium learning experience designed for modern learners.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <Badge variant="secondary" className="mb-4">Featured Courses</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Start learning today
                </h2>
                <p className="text-muted-foreground mt-1">
                  Choose from our curated selection of expert-led courses
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/courses">
                  Browse all courses
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <Card className="overflow-hidden card-hover h-full border-border/50">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center relative">
                      <div className="thumbnail-overlay absolute inset-0" />
                      <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all">
                        <svg className="h-8 w-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-black/40 text-white border-0 backdrop-blur-sm">
                        {course.isFree ? "Free" : `$${Number(course.price).toFixed(2)}`}
                      </Badge>
                      {course.category && (
                        <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] bg-background/80 backdrop-blur-sm">
                          {course.category.name}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={course.instructor.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {course.instructor.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {course.instructor.name}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-0">
                      <div className="flex items-center gap-3">
                        {course.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                        <span>{course._count.enrollments} enrolled</span>
                      </div>
                      <span className="text-primary font-medium text-xs group-hover:underline">
                        View course &rarr;
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border/40 py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              What our learners say
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join thousands of satisfied learners who have transformed their careers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-500 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 sm:p-12 text-center">
            <div className="absolute inset-0 bg-grid-white/5" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                Ready to start learning?
              </h2>
              <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
                Join thousands of learners. No credit card required, 100% free.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base shadow-lg" asChild>
                  <Link href="/auth/register">
                    Get started free
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                  <Link href="/courses">Browse courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
