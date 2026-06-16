"use client"

import { CountUp } from "@/components/animations-advanced"
import { ScrollReveal } from "@/components/scroll-effects"
import { Section, PageWrapper } from "@/components/layouts/premium-layout"
import { PremiumStatCard } from "@/components/premium-card"
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react"

const stats = [
  {
    value: 50,
    suffix: "+",
    label: "Expert-Led Courses",
    icon: <BookOpen className="h-5 w-5" />,
    variant: "primary" as const,
  },
  {
    value: 500,
    suffix: "+",
    label: "Video Lessons",
    icon: <TrendingUp className="h-5 w-5" />,
    variant: "success" as const,
  },
  {
    value: 10000,
    suffix: "+",
    label: "Active Learners",
    icon: <Users className="h-5 w-5" />,
    variant: "primary" as const,
  },
  {
    value: 5000,
    suffix: "+",
    label: "Certificates Earned",
    icon: <Award className="h-5 w-5" />,
    variant: "success" as const,
  },
]

export function StatsSection() {
  return (
    <Section className="py-12 md:py-16 bg-gradient-to-b from-muted/30 to-transparent">
      <PageWrapper>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 100}>
              <PremiumStatCard
                label={stat.label}
                value={
                  <span>
                    <CountUp to={stat.value} duration={2000} />
                    {stat.suffix}
                  </span>
                }
                icon={stat.icon}
                variant={stat.variant}
              />
            </ScrollReveal>
          ))}
        </div>
      </PageWrapper>
    </Section>
  )
}
