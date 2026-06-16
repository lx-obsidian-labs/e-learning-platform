import { type Metadata } from "next"
import { AiCourseGenerator } from "./client-page"

export const metadata: Metadata = {
  title: "AI Course Generator - Instructor",
}

export default function AiGeneratorPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <AiCourseGenerator />
    </div>
  )
}
