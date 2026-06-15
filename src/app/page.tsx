import { getPublishedCourses } from "@/actions/courses"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function HomePage() {
  const courses = await getPublishedCourses()
  const featured = courses.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-bold tracking-tight">E-Learning</span>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-gradient-shift" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl text-center animate-slide-up">
              <Badge variant="secondary" className="mb-4 text-sm">
                Free &amp; Open Education
              </Badge>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
                Learn anything,
                <br />
                <span className="gradient-text bg-gradient-to-r from-primary to-primary/60">anywhere</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Access expert-led courses, track your progress with interactive lessons,
                and earn certificates. Start your learning journey today.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Button size="lg" className="h-12 px-8 text-base animate-pulse-glow" asChild>
                  <Link href="/auth/register">Start learning free</Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/courses">Explore courses</Link>
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{courses.length}+ Free Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Video Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Certificates</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="border-t bg-muted/30 py-16">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Featured Courses</h2>
                  <p className="text-muted-foreground mt-1">Start learning with our top courses</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/courses">View all courses &rarr;</Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((course) => (
                  <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                    <Card className="overflow-hidden card-hover h-full">
                      <div className="aspect-video video-grid-placeholder flex items-center justify-center relative">
                        <div className="thumbnail-overlay absolute inset-0" />
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="h-8 w-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0 backdrop-blur-sm">
                          {course.isFree ? "Free" : `$${Number(course.price).toFixed(2)}`}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={course.instructor.image ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {course.instructor.name?.[0] ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-xs">
                            {course.instructor.name}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-0">
                        {course.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            {course.rating.toFixed(1)}
                          </span>
                        )}
                        <span>{course._count.enrollments} enrolled</span>
                        {course.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {course.category.name}
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-3 p-6">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Learn Anywhere</h3>
                <p className="text-sm text-muted-foreground">
                  Access courses on any device, anytime. Study at your own pace.
                </p>
              </div>
              <div className="text-center space-y-3 p-6">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                  </svg>
                </div>
                <h3 className="font-semibold">Expert Instructors</h3>
                <p className="text-sm text-muted-foreground">
                  Learn from industry professionals with real-world experience.
                </p>
              </div>
              <div className="text-center space-y-3 p-6">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Earn Certificates</h3>
                <p className="text-sm text-muted-foreground">
                  Complete courses and earn verified certificates to showcase your skills.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} E-Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
