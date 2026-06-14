import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-bold">E-Learning</span>
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
      <main className="flex flex-1 items-center justify-center">
        <section className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Learn anything, anywhere
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Access expert-led courses, track your progress, and earn
            certificates. Start your learning journey today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/register">Start learning free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
