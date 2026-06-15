"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "@/components/motion"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05] animate-gradient-shift" />
      <div className="absolute top-40 -left-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 -right-32 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/3 via-purple-500/5 to-indigo-500/3 rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm text-sm text-muted-foreground mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Free &amp; Open Education Platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-balance"
          >
            Master New Skills{" "}
            <span className="gradient-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              With Expert-Led Courses
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Access high-quality video lessons, interactive quizzes, and earn verified certificates
            — all completely free. Start your learning journey with Edu Learn today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
          >
            <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 hover:scale-105 transition-all duration-300" asChild>
              <Link href="/auth/register">
                Start learning free
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base border-2 border-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors" asChild>
              <Link href="/courses">Explore courses</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-3xl">
              <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-xl p-1 shadow-2xl shadow-indigo-500/5">
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 aspect-video flex items-center justify-center relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="h-20 w-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-xl">
                    <svg className="h-10 w-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-white/90 text-sm font-medium">Introduction to Computer Science</p>
                        <p className="text-white/60 text-xs">Start your journey here</p>
                      </div>
                      <span className="text-white/40 text-xs">0:32 / 12:45</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
