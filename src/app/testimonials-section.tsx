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
    <AnimatedSection className="border-t border-border/40 py-24 bg-muted/20">
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

        <div className="mx-auto max-w-3xl">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="glass-card-strong rounded-2xl p-8 sm:p-10 text-center"
              >
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-base sm:text-lg text-foreground/90 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Avatar className="h-10 w-10 ring-2 ring-indigo-200 dark:ring-indigo-800">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
                  i === current ? "w-8 bg-indigo-500" : "w-2 bg-border hover:bg-muted-foreground/30"
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
