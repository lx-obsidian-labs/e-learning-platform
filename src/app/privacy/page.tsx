import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy — Edu Learn",
  description:
    "Edu Learn's Privacy Policy explains how we collect, use, store, and protect your personal data, including compliance with POPIA and GDPR.",
}

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect personal information you provide directly, such as your name, email address, profile photo, and billing details when you create an account or make a purchase. We also collect usage data automatically, including your IP address, browser type, device information, pages visited, and time spent on courses. Learning progress, quiz scores, and certificates earned are stored as part of your educational record.",
  },
  {
    title: "2. How We Use Your Data",
    content:
      "We use your data to provide, personalise, and improve the Platform. This includes: delivering course content, processing payments, issuing certificates, sending service-related communications, analysing usage trends to enhance learning outcomes, and providing customer support. Where required by law, we will obtain your explicit consent before processing your data for additional purposes.",
  },
  {
    title: "3. Cookies & Tracking Technologies",
    content:
      "Edu Learn uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyse platform performance. Essential cookies are required for the Platform to function. Analytics cookies (e.g., session tracking, feature usage) help us improve. You can manage cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.",
  },
  {
    title: "4. Third-Party Services",
    content:
      "We engage trusted third-party service providers to process payments (e.g., PayFast, Stripe), deliver emails, host video content, and analyse platform usage. These providers are contractually bound to process your data only on our instructions and to implement adequate security measures. We do not sell your personal information to third parties for their own marketing purposes.",
  },
  {
    title: "5. Data Retention",
    content:
      "We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we retain limited data for up to 90 days to comply with legal obligations, resolve disputes, and enforce agreements. Anonymised, aggregated data may be retained indefinitely for analytics and research purposes.",
  },
  {
    title: "6. Your Rights",
    content:
      "Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. South African users have rights under POPIA, and European users have rights under the GDPR. You may also object to or restrict certain processing. To exercise your rights, contact us at privacy@lxobsidianlabs.com. We will respond within 30 days.",
  },
  {
    title: "7. Data Security",
    content:
      "We implement industry-standard technical and organisational measures to protect your data, including encryption in transit (TLS 1.3) and at rest, access controls, regular security audits, and staff training on data protection. Despite these measures, no method of electronic transmission or storage is 100% secure. We will notify you and relevant authorities of any data breach as required by law.",
  },
  {
    title: "8. Children's Privacy",
    content:
      "Edu Learn is not directed at children under 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete it. Users under 18 must have parental or guardian consent to use the Platform. Schools using Edu Learn with students are responsible for obtaining appropriate consent.",
  },
  {
    title: "9. International Data Transfers",
    content:
      "As a South African-based platform serving a global audience, your data may be transferred to and processed in countries outside your residence, including South Africa and the United States. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) for GDPR compliance and equivalent protections under POPIA.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Material changes will be communicated via email or through a notice on the Platform. We encourage you to review this page periodically for the latest information on our privacy practices. The 'Last updated' date at the top of this page reflects the most recent revision.",
  },
  {
    title: "11. Contact & Complaints",
    content:
      "If you have questions, wish to exercise your data rights, or wish to lodge a complaint, please contact our Data Protection Officer at privacy@lxobsidianlabs.com or write to us at Obsidian Labs (Pty) Ltd, Cape Town, South Africa. If you are unsatisfied with our response, you have the right to lodge a complaint with the Information Regulator (South Africa) or your local data protection authority.",
  },
]

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 15, 2026
          </p>
        </div>
        <p className="lead">
          Edu Learn ("we", "us", "our") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your personal information when you use our e-learning
          platform. It applies to all users worldwide and complies with the
          Protection of Personal Information Act (POPIA) in South Africa, the
          General Data Protection Regulation (GDPR) in Europe, and other
          applicable data protection laws. For more on our regulatory
          commitments, visit our{" "}
          <Link href="/compliance" className="underline underline-offset-4 hover:text-primary">
            Compliance page
          </Link>.
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
