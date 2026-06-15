import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service — Edu Learn",
  description:
    "Read the Terms of Service governing your use of Edu Learn, our e-learning platform. Covers accounts, courses, payments, refunds, conduct, and more.",
}

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Edu Learn ('the Platform'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree, you may not use the Platform. These Terms apply to all visitors, registered users, and contributors, whether located in South Africa or abroad. Continued use after updates constitutes acceptance of the revised Terms.",
  },
  {
    title: "2. Accounts & Registration",
    content:
      "You must be at least 13 years old to create an account. Users under 18 must have parental or guardian consent. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to provide accurate, current information and to update it as necessary. We reserve the right to suspend or terminate accounts found to be fraudulent or in violation of these Terms.",
  },
  {
    title: "3. Course Content & Access",
    content:
      "All course materials — including videos, quizzes, reading materials, and code samples — are provided for personal, non-commercial educational use. Enrolled learners receive lifetime access to purchased or enrolled courses, subject to section 11 (Termination). Content may be updated, modified, or retired at our discretion. Unauthorised redistribution, reproduction, or resale of course content is strictly prohibited.",
  },
  {
    title: "4. Payments & Cancellations",
    content:
      "Certain courses and premium features require payment. All prices displayed are in South African Rand (ZAR) unless otherwise indicated and include applicable VAT. Payments are processed securely through third-party gateways. You may cancel a subscription at any time via your account settings. Cancellation takes effect at the end of the current billing period; no partial refunds are given for unused portions.",
  },
  {
    title: "5. Refund Policy",
    content:
      "You may request a full refund within 14 days of purchase if you have completed less than 30% of the course. Refund requests beyond this window or threshold will be reviewed on a case-by-case basis. Refunds are processed within 10 business days and returned to the original payment method. Edu Learn reserves the right to deny refunds in cases of suspected abuse.",
  },
  {
    title: "6. User Conduct",
    content:
      "Users agree to interact respectfully and lawfully on the Platform. Prohibited conduct includes: harassment, hate speech, impersonation, spamming, uploading malicious code, violating others' intellectual property, and any activity that disrupts the Platform's functionality. Violations may result in immediate account suspension and, where applicable, referral to relevant authorities.",
  },
  {
    title: "7. Intellectual Property Rights",
    content:
      "All content on Edu Learn — including course materials, trademarks, logos, and platform code — is owned by or licensed to Edu Learn and is protected by South African and international copyright laws. Users retain ownership of any original work they submit (e.g., assignments, forum posts) and grant Edu Learn a non-exclusive, royalty-free licence to display and distribute that content within the Platform for educational purposes.",
  },
  {
    title: "8. Disclaimers & No Warranty",
    content:
      "Edu Learn provides educational content on an 'as is' and 'as available' basis. While we strive for accuracy, we do not warrant that course content is error-free, complete, or current. The Platform is not a substitute for professional advice (see our Disclaimer page). To the maximum extent permitted by law, Edu Learn disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose.",
  },
  {
    title: "9. Limitation of Liability",
    content:
      "To the fullest extent permitted under South African law and applicable international law, Edu Learn, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including loss of data, revenue, or learning progress. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim.",
  },
  {
    title: "10. Termination",
    content:
      "We reserve the right to suspend or terminate your account at any time without prior notice if you breach these Terms. Upon termination, your access to courses and content will be revoked. You may terminate your account at any time by contacting support. Sections 7 (Intellectual Property), 8 (Disclaimers), and 9 (Limitation of Liability) survive termination.",
  },
  {
    title: "11. Governing Law & Disputes",
    content:
      "These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these Terms shall first be attempted to be resolved through informal negotiation. If unresolved, disputes will be submitted to mediation in accordance with the rules of the Arbitration Foundation of Southern Africa (AFSA), with the seat of mediation in Cape Town.",
  },
  {
    title: "12. Changes to Terms",
    content:
      "We may update these Terms from time to time. Material changes will be notified via email or through a prominent notice on the Platform. Continued use after the effective date of changes constitutes acceptance of the updated Terms. We encourage you to review this page periodically.",
  },
  {
    title: "13. Contact Us",
    content:
      "If you have questions, concerns, or requests regarding these Terms, please contact our legal team at legal@lxobsidianlabs.com or via our Contact page. We aim to respond within 5 business days.",
  },
]

export default async function TermsPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 15, 2026
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          These Terms of Service ('Terms') govern your access to and use of the
          Edu Learn e-learning platform, operated by Obsidian Labs (Pty) Ltd in
          South Africa. Please read them carefully. By using Edu Learn, you enter
          into a binding agreement with us. If you are based in the European
          Union or other regions with specific consumer protections, additional
          rights may apply — see our{" "}
          <Link href="/compliance" className="underline underline-offset-4 hover:text-primary">
            Compliance page
          </Link>{" "}
          for more information.
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
