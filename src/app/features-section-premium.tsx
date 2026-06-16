"use client"

import { PremiumCard, PremiumStatCard } from "@/components/premium-card"
import { ScrollReveal } from "@/components/scroll-effects"
import { Section, PageWrapper } from "@/components/layouts/premium-layout"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Brain,
  Award,
  Users,
  Sparkles,
  BarChart3,
} from "lucide-react"

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Professional Video Lessons",
    description: "High-quality video content with interactive transcripts optimized for all devices.",
    color: "primary",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Progress Tracking",
    description: "Track your learning with detailed progress bars, badges, and completion certificates.",
    color: "success",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Interactive Quizzes",
    description: "Test your knowledge with instant feedback and detailed results for each module.",
    color: "primary",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Discussion Forums",
    description: "Engage with instructors and peers. Get questions answered fast by the community.",
    color: "success",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Tutor Assistant",
    description: "Get personalized help from our AI tutor. Ask questions and deepen your understanding.",
    color: "primary",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Verified Certificates",
    description: "Earn blockchain-verified certificates. Share on LinkedIn or add to your portfolio.",
    color: "success",
  },
]

export function FeaturesSection() {
  return (
    <Section title="Why Choose Edu Learn" description="A premium learning experience designed for modern learners" gradient>
      <PageWrapper>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 100}>
              <PremiumCard variant="glass" hover="glow" className="p-6 h-full">
                {/* Icon */}
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </PremiumCard>
            </ScrollReveal>
          ))}
        </div>
      </PageWrapper>
    </Section>
  )
}
