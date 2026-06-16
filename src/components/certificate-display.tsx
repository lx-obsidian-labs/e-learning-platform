"use client"

import { Award, Shield } from "lucide-react"

interface CertificateDisplayProps {
  cert: {
    id: string
    hash: string
    issuedAt: string
    course?: {
      title: string
      slug: string
      description?: string
      users?: { name: string }
      instructor?: { name: string }
      instructorName?: string
    }
    user?: { name: string; email: string }
    [key: string]: any
  }
}

export function CertificateDisplay({ cert }: CertificateDisplayProps) {
  const issueDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const instructorName =
    cert.course?.users?.name ||
    cert.course?.instructor?.name ||
    cert.course?.instructorName ||
    ""

  return (
    <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/30 dark:via-background dark:to-purple-950/30 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-xl print:shadow-none print:border-2 print:border-gray-300">
      <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-indigo-400 dark:border-indigo-500 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-indigo-400 dark:border-indigo-500 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-indigo-400 dark:border-indigo-500 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-indigo-400 dark:border-indigo-500 rounded-br-2xl" />

      <div className="relative px-8 sm:px-16 py-12 sm:py-16 text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
            EL
          </div>
          <span className="text-lg font-bold">Edu Learn</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-indigo-300 dark:text-indigo-600">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-400" />
          <Award className="h-6 w-6" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-400" />
        </div>

        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Certificate of Completion
          </p>
        </div>

        <div className="py-4">
          <p className="text-3xl sm:text-4xl font-bold tracking-wide text-foreground font-serif">
            {cert.user?.name || "Student"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">has successfully completed the course</p>
          <p className="text-xl sm:text-2xl font-semibold text-indigo-700 dark:text-indigo-300">
            {cert.course?.title || "Course"}
          </p>
          {cert.course?.description && (
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {cert.course.description}
            </p>
          )}
        </div>

        {instructorName && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">Instructor</p>
            <p className="font-medium">{instructorName}</p>
          </div>
        )}

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">Issued on</p>
          <p className="font-medium">{issueDate}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-4">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Blockchain Verified
          </span>
        </div>

        <div className="text-xs text-muted-foreground font-mono pt-2">
          ID: {cert.id.slice(0, 8)}...{cert.id.slice(-6)}
        </div>
      </div>
    </div>
  )
}
