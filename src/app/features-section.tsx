"use client"

import { Badge } from "@/components/ui/badge"
import { AnimatedSection, staggerContainer, fadeInUp, motion } from "@/components/motion"

const features = [
  {
    title: "Professional Video Lessons",
    desc: "High-quality video content with interactive transcripts and playback controls optimized for all devices.",
    gradient: "from-blue-500 to-cyan-500",
    icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  },
  {
    title: "Progress Tracking",
    desc: "Track your learning journey with detailed progress bars, completion badges, and achievement certificates.",
    gradient: "from-emerald-500 to-teal-500",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "Interactive Quizzes",
    desc: "Test your knowledge with interactive quizzes at the end of each module. Instant feedback and detailed results.",
    gradient: "from-orange-500 to-rose-500",
    icon: "M9 12l3 3m0 0l3-3m-3 3v-6m-9 3a9 9 0 1118 0 9 9 0 01-18 0z",
  },
  {
    title: "Discussion Forums",
    desc: "Engage with instructors and peers through integrated discussion forums. Get your questions answered fast.",
    gradient: "from-purple-500 to-pink-500",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    title: "AI Tutor Assistant",
    desc: "Get personalized help from our AI tutor. Ask questions, get explanations, and deepen your understanding.",
    gradient: "from-indigo-500 to-blue-500",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
  },
  {
    title: "Verified Certificates",
    desc: "Earn verified certificates upon course completion. Share them on LinkedIn or add to your portfolio.",
    gradient: "from-amber-500 to-orange-500",
    icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  },
]

export function FeaturesSection() {
  return (
    <AnimatedSection className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full border border-primary/10 bg-primary/[0.06] px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-primary">
            Why learners stay
          </Badge>
          <h2 className="text-4xl text-balance sm:text-5xl">
            A learning system that feels guided from the first click.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Each surface is built to reduce friction: study clearly, revisit concepts, and
            keep momentum without hunting for the next step.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              custom={i}
              className="group research-panel relative overflow-hidden rounded-[1.8rem] p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute right-5 top-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} p-2.5 shadow-lg transition-all duration-300 group-hover:scale-110`}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl leading-tight text-balance">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-primary/20 via-border to-transparent" />
              <div className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Study signal / workflow upgrade
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  )
}
