"use client"

import { AnimatedSection, AnimatedCounter } from "@/components/motion"

const stats = [
  { value: 10, suffix: "+", label: "Expert-Led Courses" },
  { value: 30, suffix: "+", label: "Video Lessons" },
  { value: 100, suffix: "%", label: "Free Access" },
  { value: 24, suffix: "/7", label: "Community Support" },
]

export function StatsSection() {
  return (
    <AnimatedSection className="border-t border-border/40 py-16 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-muted-foreground mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
