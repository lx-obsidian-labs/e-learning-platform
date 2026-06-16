import { getPublishedCourses } from "@/actions/courses"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, BrainCircuit, BookOpenCheck, Sparkles, Trophy } from "lucide-react"
import { HeroSection } from "./hero-section"
import { StatsSection } from "./stats-section"
import { FeaturesSection } from "./features-section"
import { TestimonialsSection } from "./testimonials-section"

export const dynamic = "force-dynamic"

const featuredGradients = [
  "from-violet-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-rose-600",
  "from-pink-600 to-fuchsia-600",
  "from-indigo-600 to-blue-600",
  "from-teal-600 to-cyan-600",
]

export default async function HomePage() {
  const courses = await getPublishedCourses()
  const featured = courses.slice(0, 6)

  return (
    <>
      <HeroSection />

      <StatsSection />

      <FeaturesSection />

      {featured.length > 0 && (
        <section className="relative overflow-hidden py-24">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="secondary" className="mb-4 rounded-full border border-primary/10 bg-primary/[0.06] px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-primary">
                  Featured courses
                </Badge>
                <h2 className="text-4xl text-balance sm:text-5xl">
                  Start with the strongest entry points in the catalog.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  A tighter front door: curated picks, clearer outcomes, and higher-signal course cards.
                </p>
              </div>
              <Button variant="outline" asChild className="group rounded-full border-border/80 bg-background/70 px-5 backdrop-blur-xl">
                <Link href="/courses">
                  Browse all courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((course, idx) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 group-hover:-translate-y-1" variant="pro">
                    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${featuredGradients[idx % featuredGradients.length]}`}>
                      <div className="absolute inset-0 bg-slate-950/15 transition-colors group-hover:bg-slate-950/5" />
                      <div className="thumbnail-overlay absolute inset-0" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/90 backdrop-blur-xl">
                        Course spotlight
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                        <svg className="h-8 w-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <Badge className="absolute top-3 left-3 bg-black/40 text-white border-0 backdrop-blur-sm">
                        {course.isFree ? "Free" : `R${Number(course.price).toFixed(2)}`}
                      </Badge>
                      {course.category && (
                        <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] bg-background/80 backdrop-blur-sm">
                          {course.category.name}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-1">
                      <CardTitle className="line-clamp-2 text-[1.35rem] leading-tight transition-colors group-hover:text-primary">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-2">
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
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
                    <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {course.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                        <span>{course._count.enrollments} enrolled</span>
                      </div>
                      <span className="text-xs font-medium text-primary group-hover:underline">
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

      {/* AI-Powered Learning Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-shell hero-mesh relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
            <div className="surface-grid absolute inset-0 opacity-40" />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] lg:items-center">
              <div>
                <Badge variant="secondary" className="mb-4 rounded-full border border-primary/10 bg-background/75 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-primary">
                  AI-powered learning
                </Badge>
                <h2 className="text-4xl text-balance sm:text-5xl">
                  A learning copilot that supports focus instead of stealing it.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Recommendations, tutoring, discussion moderation, and insight prompts are now
                  framed as one coherent capability instead of four disconnected features.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button asChild className="h-11 rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
                    <Link href="/courses">Ask the AI assistant</Link>
                  </Button>
                  <Button variant="outline" asChild className="h-11 rounded-full border-border/80 bg-background/70 px-6 backdrop-blur-xl">
                    <Link href="/courses">Browse courses</Link>
                  </Button>
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  {
                    icon: BrainCircuit,
                    title: "Live tutor prompts",
                    copy: "Ask context-aware questions while you watch, review, or practice.",
                  },
                  {
                    icon: BookOpenCheck,
                    title: "Retention-aware review",
                    copy: "Turn course knowledge into spaced repetition before it fades.",
                  },
                  {
                    icon: Trophy,
                    title: "Progress signals",
                    copy: "Use quests, streaks, and badges as motivation with a clear learning purpose.",
                  },
                ].map((item) => (
                  <div key={item.title} className="research-panel flex items-start gap-4 rounded-[1.5rem] p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-medium text-foreground">{item.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="relative py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-center shadow-2xl shadow-slate-950/25 sm:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(142,162,255,0.28),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(82,219,198,0.16),transparent_22%),linear-gradient(135deg,#08111f_0%,#0d1728_50%,#1f3cff_140%)]" />
            <div className="surface-grid absolute inset-0 opacity-20" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/75">
                <Sparkles className="h-3.5 w-3.5" />
                Ready to begin
              </div>
              <h2 className="text-balance text-4xl text-white sm:text-5xl lg:text-6xl">
                Turn the homepage into your first productive study session.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200/82">
                Join thousands of learners with a clearer visual system, stronger calls to action,
                and a much more intentional learning-first interface.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-xl" asChild>
                  <Link href="/auth/register">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-full border-white/20 px-8 text-base text-white hover:bg-white/10 hover:text-white" asChild>
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
