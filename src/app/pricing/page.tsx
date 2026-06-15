import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with our free tier. No credit card required.",
    features: [
      "Access to all free courses",
      "Video lessons & quizzes",
      "Progress tracking",
      "Community discussions",
      "Basic certificates",
    ],
    cta: "Get started free",
    href: "/auth/register",
    featured: false,
  },
  {
    name: "Premium",
    price: "$9",
    period: "/month",
    desc: "Unlock the full LX Obsidian experience.",
    features: [
      "Everything in Free",
      "AI Tutor access",
      "Premium certificates",
      "Priority support",
      "Ad-free experience",
      "Offline downloads",
      "Early access to new courses",
    ],
    cta: "Start premium",
    href: "/auth/register",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/month",
    desc: "For teams and organizations.",
    features: [
      "Everything in Premium",
      "Team management",
      "Custom learning paths",
      "Analytics dashboard",
      "API access",
      "Dedicated support",
      "Custom branding",
    ],
    cta: "Contact sales",
    href: "/contact",
    featured: false,
  },
]

const faq = [
  { q: "Is the platform really free?", a: "Yes! All our courses are completely free to access. Premium plans are optional and unlock additional features." },
  { q: "Can I earn certificates?", a: "Absolutely. Certificates are available for all courses. Premium certificates include verification features." },
  { q: "How do I get started?", a: "Simply create a free account and start exploring our course catalog. No credit card required." },
  { q: "Can I access courses on mobile?", a: "Yes, our platform is fully responsive and works on all devices including smartphones and tablets." },
]

export default function PricingPage() {
  return (
    <div className="pt-16">
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free. Upgrade when you need more.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.featured
                    ? "border-primary/30 bg-primary/[0.03] shadow-xl shadow-primary/10 scale-[1.02] lg:scale-105"
                    : "border-border/50 bg-background/50"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most popular
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full h-11 ${plan.featured ? "" : "variant-outline"}`}
                  variant={plan.featured ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 py-20 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border/50 bg-background/50 open:border-primary/20 transition-colors">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm list-none">
                  {item.q}
                  <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
