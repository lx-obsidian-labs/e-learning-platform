import { CreateGroupForm } from "@/components/study/create-group-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Study Group - Edu Learn",
}

export default function CreateGroupPage() {
  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <CreateGroupForm />
      </div>
    </div>
  )
}
