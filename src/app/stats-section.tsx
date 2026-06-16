"use client"

import { AnimatedSection, AnimatedCounter } from "@/components/motion"

const stats = [
  { value: 10, suffix: "+", label: "Expert-led courses", note: "Curated learning paths with structured modules" },
  { value: 30, suffix: "+", label: "Video lessons", note: "Designed for repeatable study sessions" },
  { value: 100, suffix: "%", label: "Free access", note: "Open learning without paywalls at entry" },
  { value: 24, suffix: "/7", label: "Community support", note: "Peer discussion and instructor guidance" },
]

export function StatsSection() {
  return (
    <AnimatedSection className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="section-shell research-panel grid gap-4 rounded-[2rem] p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[1.5rem] border border-border/60 bg-background/65 p-5 text-left shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Platform signal</div>
              <div className="mt-4 text-3xl font-semibold gradient-text bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 sm:text-4xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-base font-medium text-foreground">{s.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
