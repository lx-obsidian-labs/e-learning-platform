import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Compliance — Edu Learn",
  description:
    "Edu Learn's compliance framework covering POPIA (South Africa), GDPR (Europe), WCAG 2.2 accessibility, copyright, data protection, and violation reporting.",
}

const sections = [
  {
    title: "1. POPIA Compliance (South Africa)",
    content:
      "Edu Learn fully complies with the Protection of Personal Information Act (POPIA) of 2013. As a South African-based platform, we have appointed an Information Officer, registered our processing activities with the Information Regulator, and implemented lawful processing conditions for all personal data collected. We adhere to the eight processing conditions: accountability, processing limitation, purpose specification, further processing limitation, information quality, openness, security safeguards, and data subject participation.",
  },
  {
    title: "2. GDPR Compliance (European Union)",
    content:
      "For users in the European Economic Area (EEA) and the United Kingdom, Edu Learn complies with the General Data Protection Regulation (GDPR) and the UK GDPR. We process personal data only where we have a lawful basis (consent, contract, legal obligation, or legitimate interest). Users have the right to access, rectify, erase, restrict processing, data portability, and object. Cross-border data transfers are safeguarded via Standard Contractual Clauses (SCCs). Our Data Protection Officer can be reached at dpo@lxobsidianlabs.com.",
  },
  {
    title: "3. Accessibility Compliance (WCAG 2.2)",
    content:
      "Edu Learn is committed to digital inclusion and strives to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. Our platform features: semantic HTML structure, proper heading hierarchies, ARIA labels, keyboard-navigable interfaces, sufficient colour contrast ratios, screen-reader-friendly announcements, and resizable text without loss of functionality. We conduct regular automated and manual accessibility audits. If you encounter barriers, please report them to accessibility@lxobsidianlabs.com.",
  },
  {
    title: "4. Copyright Compliance",
    content:
      "Edu Learn respects intellectual property rights and expects users to do the same. All course materials are either original works created by our instructors, properly licensed, or used under fair use / fair dealing provisions. We respond to valid takedown notices under the South African Copyright Act and the Digital Millennium Copyright Act (DMCA) for international users. To report alleged infringement, please contact copyright@lxobsidianlabs.com with full details.",
  },
  {
    title: "5. Data Protection Framework",
    content:
      "Our data protection framework is built on a privacy-by-design and privacy-by-default approach. Key measures include: data minimisation (we collect only what is necessary), purpose limitation (data is used only for specified purposes), retention scheduling (data is deleted when no longer needed), encryption (TLS 1.3 in transit, AES-256 at rest), access controls (role-based access with least-privilege principle), and regular third-party security audits. We conduct Data Protection Impact Assessments (DPIAs) for high-risk processing activities.",
  },
  {
    title: "6. Reporting Violations",
    content:
      "If you believe that Edu Learn or any user has violated a law, regulation, or these policies, you may report it confidentially. Reports can be submitted via email to compliance@lxobsidianlabs.com or through our anonymous whistleblower channel. We investigate all reports promptly and take appropriate remedial action. You will not be penalised for reporting a suspected violation made in good faith. For urgent security concerns, contact security@lxobsidianlabs.com.",
  },
  {
    title: "7. Regulatory Inquiries",
    content:
      "Regulatory authorities and law enforcement agencies may direct inquiries to our legal team at legal@lxobsidianlabs.com. We cooperate with legitimate requests while protecting user privacy and due process rights. Our registered address is Obsidian Labs (Pty) Ltd, Cape Town, South Africa. Relevant regulatory bodies include the Information Regulator (South Africa) and, for GDPR matters, the relevant Supervisory Authority in the user's jurisdiction.",
  },
]

export default async function CompliancePage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Compliance
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 15, 2026
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Edu Learn is committed to operating with integrity and transparency
          across all jurisdictions. This page outlines our compliance with key
          regulations and standards applicable to our global user base. It is
          part of our broader legal documentation — please also review our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          , and{" "}
          <Link href="/disclaimer" className="underline underline-offset-4 hover:text-primary">
            Disclaimer
          </Link>{" "}
          for complete information.
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
