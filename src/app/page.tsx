import { getPublishedCourses } from "@/actions/courses"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <Badge variant="secondary" className="mb-4">Featured Courses</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Start learning today
                </h2>
                <p className="text-muted-foreground mt-1">
                  Choose from our curated selection of expert-led courses
                </p>
              </div>
              <Button variant="outline" asChild className="group">
                <Link href="/courses">
                  Browse all courses
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((course, idx) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <Card className="overflow-hidden card-hover h-full border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className={`aspect-video bg-gradient-to-br ${featuredGradients[idx % featuredGradients.length]} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                      <div className="thumbnail-overlay absolute inset-0" />
                      <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
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

      <TestimonialsSection />

      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-14 text-center shadow-2xl shadow-indigo-500/20">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">
                Ready to start learning?
              </h2>
              <p className="mt-4 text-indigo-100/80 max-w-xl mx-auto text-lg">
                Join thousands of learners. No credit card required, 100% free.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/auth/register">
                    Get started free
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10 hover:text-white" asChild>
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
