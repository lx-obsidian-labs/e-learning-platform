"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createGroup } from "@/actions/study-groups"

export function CreateGroupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createGroup({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      courseId: (formData.get("courseId") as string) || undefined,
      maxMembers: Number(formData.get("maxMembers")) || 10,
      isPublic: formData.get("isPublic") === "on",
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/groups/${result.groupId}`)
    router.refresh()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a Study Group</CardTitle>
        <CardDescription>
          Bring learners together to collaborate on courses and share progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. JavaScript Study Squad"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What will this group focus on?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseId">Course ID (optional)</Label>
            <Input
              id="courseId"
              name="courseId"
              placeholder="Link to a specific course"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Maximum Members</Label>
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min={2}
              max={100}
              defaultValue={10}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="isPublic" name="isPublic" defaultChecked />
            <Label htmlFor="isPublic">Make this group public</Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Study Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
