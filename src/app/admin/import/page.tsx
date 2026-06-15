import { UploadForm } from "./upload-form"
import { LmsImportForm } from "./lms-import-form"

export default function AdminImportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Import Courses</h1>
        <p className="text-muted-foreground">
          Upload JSON/CSV files, or import directly from Open edX and Moodle.
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">JSON Format</h2>
        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
{`{ "courses": [{
  "title": "Course Title",
  "description": "...",
  "category": "Web Development",
  "modules": [{
    "title": "Module 1",
    "lessons": [{ "title": "Lesson 1", "content": "..." }],
    "quiz": { "title": "Quiz", "questions": [...] }
  }]
}]}`}
        </pre>
      </div>

      <UploadForm />

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">LMS Import</h2>
        <LmsImportForm />
      </div>
    </div>
  )
}
