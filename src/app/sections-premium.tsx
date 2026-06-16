"use client"

import { PremiumButton } from "@/components/premium-button"
import { PremiumCard } from "@/components/premium-card"
import { ScrollReveal, Parallax } from "@/components/scroll-effects"
import { Section, PageWrapper } from "@/components/layouts/premium-layout"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Zap,
  Rocket,
  Shield,
  Clock,
  Globe,
} from "lucide-react"

const benefits = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI-Powered Learning",
    description: "Personalized course recommendations and AI tutoring adapted to your pace.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Gamification & Rewards",
    description: "Earn XP, unlock badges, maintain streaks, and compete on leaderboards.",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Spaced Repetition",
    description: "Smart SM-2 algorithm for optimal long-term retention of knowledge.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Verified Certificates",
    description: "Blockchain-verified certificates with cryptographic validation.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Learn at Your Pace",
    description: "Self-paced learning with lifetime access to all course materials.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Community",
    description: "Connect with learners worldwide through study groups and forums.",
  },
]

export function BenefitsSection() {
  return (
    <Section
      title="Premium Features"
      description="Everything you need to succeed in your learning journey"
      gradient
    >
      <PageWrapper>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 80}>
              <PremiumCard variant="elevated" hover="lift" className="p-6">
                <div className="inline-flex items-center justify-center rounded-lg bg-indigo-600/20 p-3 text-indigo-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </PremiumCard>
            </ScrollReveal>
          ))}
        </div>
      </PageWrapper>
    </Section>
  )
}

/**
 * CTA Section
 */
export function CTASection() {
  return (
    <Section className="py-16 md:py-24">
      <PageWrapper maxWidth="2xl">
        <ScrollReveal>
          <Parallax offset={0.3}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-indigo-500/20">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                  Join thousands of learners. No credit card required. 100% free with optional premium features.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <PremiumButton
                    variant="secondary"
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-white/90 w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/auth/register">
                      Get Started Free
                    </Link>
                  </PremiumButton>
                  <PremiumButton
                    variant="glass"
                    size="lg"
                    className="border-white/20 text-white w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/courses">
                      Browse Courses
                    </Link>
                  </PremiumButton>
                </div>
              </div>
            </div>
          </Parallax>
        </ScrollReveal>
      </PageWrapper>
    </Section>
  )
}
