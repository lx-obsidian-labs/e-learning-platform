import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Accessibility Statement - Edu Learn",
  description: "Edu Learn is committed to ensuring digital accessibility for all users, including those with disabilities. Read our accessibility statement.",
}

const sections = [
  {
    title: "Our Commitment",
    content: "Edu Learn is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards to achieve WCAG 2.2 Level AA conformance.",
  },
  {
    title: "Accessibility Standards",
    content: "Our platform is designed and developed following the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. These guidelines define how to make web content more accessible to people with a wide range of disabilities, including blindness and low vision, hearing loss, limited movement, speech disabilities, photosensitivity, and cognitive limitations.",
  },
  {
    title: "What We've Implemented",
    content: "We have integrated the following accessibility features: semantic HTML structure with proper heading hierarchy, ARIA labels and roles on interactive elements, keyboard-accessible navigation throughout, sufficient colour contrast ratios (minimum 4.5:1 for normal text), screen-reader-friendly announcements via aria-live regions, focus indicators on all interactive elements, alternative text on images and icons, responsive design supporting 200% browser zoom, reduced motion support for vestibular disorders, and descriptive link text that makes sense out of context.",
  },
  {
    title: "Known Limitations",
    content: "While we strive for full accessibility, some third-party content (such as embedded videos or externally authored course materials) may not fully meet our accessibility standards. We actively encourage content creators to follow accessibility best practices and provide alternatives where possible.",
  },
  {
    title: "Feedback & Contact",
    content: "We welcome your feedback on the accessibility of Edu Learn. If you encounter any barriers or have suggestions for improvement, please contact our accessibility team at accessibility@lxobsidianlabs.com or use our Contact page. We aim to respond within 3 business days.",
  },
]

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Accessibility Statement
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 15, 2026
          </p>
        </div>
        <p className="lead">
          Edu Learn is dedicated to making our platform accessible to everyone,
          regardless of ability. We believe inclusive design creates a better
          learning experience for all.
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
