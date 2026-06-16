"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "@/components/motion"

export function HeroSection() {
  return (
    <section className="relative flex min-h-[96vh] items-center overflow-hidden pt-16">
      <div className="hero-mesh absolute inset-0" />
      <div className="surface-grid absolute inset-x-0 top-0 h-[78%] opacity-50" />
      <div className="absolute left-[-8rem] top-32 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-3xl">
              <div className="eyebrow mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Free and open education platform
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-balance text-5xl leading-[0.97] sm:text-6xl lg:text-7xl xl:text-[5.2rem]"
              >
                Study in a{" "}
                <span className="gradient-text bg-gradient-to-r from-primary via-indigo-500 to-cyan-500">
                  modern learning lab
                </span>{" "}
                built for depth, not distraction.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Explore expert-led courses, adaptive review, AI tutoring, and progress systems
                that make serious online learning feel deliberate, guided, and motivating.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-primary px-7 text-base text-primary-foreground shadow-xl shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90"
                  asChild
                >
                  <Link href="/auth/register">
                    Start learning free
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-border/80 bg-background/70 px-7 text-base backdrop-blur-xl hover:bg-accent/60"
                  asChild
                >
                  <Link href="/courses">Explore courses</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 grid gap-4 sm:grid-cols-3"
              >
                {[
                  { value: "92%", label: "completion momentum", note: "for learners using review tools" },
                  { value: "AI", label: "co-tutor support", note: "inline help during lessons" },
                  { value: "24/7", label: "structured access", note: "web, mobile, offline-ready" },
                ].map((item) => (
                  <div key={item.label} className="research-panel rounded-3xl p-5">
                    <div className="text-2xl font-semibold text-foreground">{item.value}</div>
                    <div className="mt-2 text-sm font-medium text-foreground">{item.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.note}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="lg:justify-self-end"
          >
            <div className="research-panel section-shell relative overflow-hidden rounded-[2rem] p-3">
              <div className="surface-grid absolute inset-0 opacity-40" />
              <div className="relative rounded-[1.6rem] border border-white/10 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/30">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Featured session</p>
                    <h3 className="mt-1 font-heading text-2xl text-white">Intro to Computer Science</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Week 01
                  </div>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(142,162,255,0.25),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(82,219,198,0.2),transparent_28%)]" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                    Learning preview
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white">Foundations, systems, and problem solving</p>
                          <p className="mt-1 text-xs text-slate-300">Watch, annotate, quiz, and review in one flow.</p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 shadow-lg shadow-black/20">
                          <svg className="ml-1 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary via-indigo-400 to-cyan-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Learning stack</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-200">
                      <span className="rounded-full bg-white/8 px-2.5 py-1">Video lessons</span>
                      <span className="rounded-full bg-white/8 px-2.5 py-1">AI tutor</span>
                      <span className="rounded-full bg-white/8 px-2.5 py-1">Review cards</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Outcome</div>
                    <div className="mt-2 text-sm text-slate-100">Understand concepts faster and retain more after each session.</div>
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
