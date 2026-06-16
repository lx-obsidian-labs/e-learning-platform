"use client"

import Link from "next/link"
import { PremiumButton } from "@/components/premium-button"
import { Typewriter, Parallax } from "@/components/animations-advanced"
import { ScrollReveal } from "@/components/scroll-effects"
import { PageWrapper, Section } from "@/components/layouts/premium-layout"

export function HeroSection() {
  return (
    <Section gradient className="py-20 md:py-32 relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Parallax offset={0.3} className="absolute top-40 -left-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        <Parallax offset={-0.2} className="absolute bottom-20 -right-32 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <PageWrapper maxWidth="4xl" className="relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm text-sm font-medium text-muted-foreground animate-in">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              🚀 Free & Premium E-Learning Platform
            </div>
          </ScrollReveal>

          {/* Main Heading */}
          <ScrollReveal delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-5xl">
              Master New Skills with
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
                <Typewriter text="Expert-Led Courses" speed={50} cursor />
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={200}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Access high-quality video lessons, interactive quizzes, AI tutoring, and earn verified certificates — all completely free. Start your learning journey with Edu Learn today.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <PremiumButton
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/auth/register">
                  Start Learning Free
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </PremiumButton>
              <PremiumButton
                variant="outline-premium"
                size="lg"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/courses">
                  Explore Courses
                </Link>
              </PremiumButton>
            </div>
          </ScrollReveal>

          {/* Hero Image/Video Preview */}
          <ScrollReveal delay={400} className="w-full">
            <Parallax offset={0.2} className="w-full">
              <div className="mt-16 relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-b from-muted/50 to-muted/20 backdrop-blur-sm shadow-2xl shadow-primary/10">
                {/* Video placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center group">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play button */}
                  <button className="relative z-10 h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-black/20">
                    <svg className="h-10 w-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">Introduction to Computer Science</p>
                        <p className="text-white/70 text-xs">Start your journey here</p>
                      </div>
                      <span className="text-white/60 text-xs">0:32 / 12:45</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </Parallax>
          </ScrollReveal>

          {/* Trust indicators */}
          <ScrollReveal delay={500} className="pt-8 border-t border-border/20 w-full">
            <p className="text-sm text-muted-foreground mb-4">Trusted by learners worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {['100% Free', 'No Sign-up', 'Certificates', 'AI Support', '24/7 Access'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </PageWrapper>
    </Section>
  )
}
