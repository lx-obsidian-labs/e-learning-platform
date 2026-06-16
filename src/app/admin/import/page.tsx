import { UploadForm } from "./upload-form"
import { LmsImportForm } from "./lms-import-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminImportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Import Courses</h1>
        <p className="lead">
          Upload JSON/CSV files, or import directly from Open edX and Moodle.
        </p>
      </div>

      <Card variant="pro">
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      <Card variant="pro">
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>

      <Card variant="pro">
        <CardHeader>
          <CardTitle className="text-lg">LMS Import</CardTitle>
        </CardHeader>
        <CardContent>
          <LmsImportForm />
        </CardContent>
      </Card>
    </div>
  )
}
