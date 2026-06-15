import { UploadForm } from "./upload-form"

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Courses</h1>
        <p className="text-muted-foreground">
          Upload a JSON or CSV file to bulk-import courses. Each course can include modules, lessons, and quizzes.
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">JSON Format</h2>
        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
{`{
  "courses": [
    {
      "title": "Course Title",
      "description": "Course description",
      "category": "Web Development",
      "price": 0,
      "isFree": true,
      "modules": [
        {
          "title": "Module 1",
          "lessons": [
            {
              "title": "Lesson 1",
              "content": "Lesson content here...",
              "videoUrl": "https://...",
              "duration": 30
            }
          ],
          "quiz": {
            "title": "Module Quiz",
            "passingScore": 70,
            "questions": [
              {
                "text": "Question?",
                "type": "MULTIPLE_CHOICE",
                "points": 1,
                "options": [
                  { "text": "Correct", "isCorrect": true },
                  { "text": "Wrong", "isCorrect": false }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}`}
        </pre>
      </div>

      <UploadForm />
    </div>
  )
}
