import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Cookie Policy - Edu Learn",
  description: "Edu Learn's Cookie Policy explains how we use cookies and similar tracking technologies on our platform.",
}

const sections = [
  {
    title: "What Are Cookies",
    content: "Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences, authenticate your session, and analyse how the site is used. Cookies may be set by the website itself ('first-party cookies') or by third-party services we integrate ('third-party cookies').",
  },
  {
    title: "How We Use Cookies",
    content: "We use cookies for the following purposes: Essential cookies for authentication and security (required for the platform to function), Preference cookies to remember your language, theme, and notification settings, Analytics cookies to understand how users interact with the platform (anonymised), and Session cookies to maintain your login state during a browsing session.",
  },
  {
    title: "Types of Cookies We Use",
    content: "Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device for a set period or until you delete them. Essential cookies are strictly necessary for the platform to function and cannot be disabled. Functional cookies enhance your experience by remembering your preferences. Analytics cookies help us improve the platform by tracking usage patterns in aggregate.",
  },
  {
    title: "Managing Cookies",
    content: "You can control and manage cookies in your browser settings. Most browsers allow you to block or delete cookies, and you can set preferences for specific websites. Please note that disabling essential cookies may prevent certain features of Edu Learn from functioning properly, such as staying logged in or maintaining your learning progress across sessions.",
  },
  {
    title: "Updates to This Policy",
    content: "We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. Material changes will be communicated via email or a prominent notice on the platform.",
  },
  {
    title: "Contact Us",
    content: "If you have questions about our use of cookies, please contact us at privacy@lxobsidianlabs.com or through our Contact page.",
  },
]

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Cookie Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 15, 2026
          </p>
        </div>
        <p className="lead">
          This Cookie Policy explains how Edu Learn uses cookies and similar
          tracking technologies to enhance your browsing experience.
        </p>
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title} variant="pro">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
