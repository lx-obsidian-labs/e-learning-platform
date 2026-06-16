import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Disclaimer — Edu Learn",
  description:
    "Edu Learn's disclaimer outlining the limitations of our educational content, accuracy disclaimers, external links, AI-generated content, and liability.",
}

const sections = [
  {
    title: "1. Educational Content Only",
    content:
      "All content provided on Edu Learn — including courses, tutorials, quizzes, and articles — is for general educational and informational purposes only. It is not intended to serve as professional, legal, medical, financial, or technical advice. You should not rely on course content as a substitute for consultation with qualified professionals in the relevant field.",
  },
  {
    title: "2. No Professional Advice",
    content:
      "Edu Learn instructors and contributors are educators, not licensed professionals unless explicitly stated otherwise. Any guidance offered within courses does not constitute a professional-client relationship. Always seek the advice of a qualified professional for matters specific to your situation. We expressly disclaim any liability for decisions made based on course content.",
  },
  {
    title: "3. Accuracy of Content",
    content:
      "We strive to ensure that course materials are accurate, current, and of high quality. However, technology, industry standards, and academic knowledge evolve rapidly. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the content. Errors and omissions may occur, and we encourage users to cross-reference critical information.",
  },
  {
    title: "4. External Links & Third-Party Content",
    content:
      "Edu Learn may contain links to external websites, resources, or third-party content for convenience or reference. We do not endorse, control, or assume responsibility for the accuracy, legality, or content of any third-party site. Accessing external links is at your own risk, and you should review the terms and privacy policies of any third-party sites you visit.",
  },
  {
    title: "5. AI-Generated Content Disclaimer",
    content:
      "Certain materials on Edu Learn, including summaries, practice questions, and AI tutor responses, may be generated or enhanced by artificial intelligence. While we review and curate AI-generated content, it may contain errors, omissions, or inaccuracies. AI outputs should be treated as supplementary learning aids, not authoritative sources. Always verify critical information through primary sources.",
  },
  {
    title: "6. No Warranty",
    content:
      "The Platform and all content are provided on an 'as is' and 'as available' basis without any warranties of any kind, either express or implied. Edu Learn does not guarantee that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time without notice.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "To the maximum extent permitted by law, Edu Learn, its affiliates, instructors, and contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or reliance on the Platform or its content. This includes, but is not limited to, loss of data, learning progress, revenue, or career opportunities. Nothing in this disclaimer excludes liability that cannot be excluded under applicable law.",
  },
  {
    title: "8. Personal Responsibility",
    content:
      "You acknowledge that you are using Edu Learn voluntarily and assume all risks associated with your learning journey. You are responsible for your own learning outcomes, career decisions, and the application of knowledge gained through the Platform. Edu Learn is a tool to support your education, not a guarantee of any particular result or qualification.",
  },
]

export default async function DisclaimerPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Disclaimer
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 15, 2026
          </p>
        </div>
        <p className="lead">
          This disclaimer governs your use of Edu Learn. By accessing the
          Platform, you accept this disclaimer in full. If you disagree with any
          part, please discontinue use immediately. This page forms part of our
          broader legal framework — please also read our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          , and{" "}
          <Link href="/compliance" className="underline underline-offset-4 hover:text-primary">
            Compliance
          </Link>{" "}
          pages for complete information.
        </p>
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title} variant="pro">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
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
