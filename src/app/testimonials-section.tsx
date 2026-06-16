"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AnimatedSection, motion, AnimatePresence } from "@/components/motion"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    content: "This platform completely transformed my career. The structured curriculum and hands-on projects helped me land my dream job at a top tech company.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    content: "The quality of instruction is outstanding. I particularly love the interactive quizzes and the AI tutor feature that helps when I'm stuck on complex topics.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    content: "Finally, an e-learning platform that gets it right. The video lessons are professional, and the progress tracking keeps me motivated to complete every course.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "DevOps Engineer",
    content: "The hands-on approach to learning is incredible. Being able to practice in real-time and get instant feedback accelerated my learning tremendously.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const t = testimonials[current]

  return (
    <AnimatedSection className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full border border-primary/10 bg-primary/[0.06] px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-primary">
            Field notes
          </Badge>
          <h2 className="text-4xl text-balance sm:text-5xl">
            Learners describe a calmer, sharper way to study online.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The strongest products feel trustworthy before they feel flashy. That is the
            benchmark for every learning flow here.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="research-panel rounded-[2rem] p-8 text-center sm:p-10"
              >
                <div className="mb-6 flex justify-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="mb-5 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Learner interview / rotating excerpt
                </div>
                <p className="text-lg leading-relaxed text-foreground/90 italic sm:text-[1.35rem]">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-10 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
