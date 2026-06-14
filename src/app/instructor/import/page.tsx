import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ImportForm } from "./import-form"

export default async function ImportCoursePage() {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Free Courses</h1>
        <p className="text-muted-foreground">
          Browse free educational content from Khan Academy and other sources
        </p>
      </div>
      <ImportForm />
    </div>
  )
}
