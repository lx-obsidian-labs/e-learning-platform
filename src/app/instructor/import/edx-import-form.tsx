"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type EdxCourse = {
  id: string
  providerCourseId: string
  title: string
  description: string
  thumbnail?: string
  instructor?: string
  videoUrl?: string
  url?: string
}

export function EdxImportForm() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<EdxCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/edx/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.courses || [])
      if (data.courses?.length === 0) {
        toast.error("No edX courses found")
      }
    } catch {
      toast.error("Failed to search edX courses")
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(course: EdxCourse) {
    setImportingId(course.id)
    try {
      const res = await fetch("/api/edx/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success("Course imported with videos")
        router.push(`/instructor/courses/${data.id}`)
        router.refresh()
      }
    } catch {
      toast.error("Failed to import course")
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Search edX courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((course) => (
          <Card key={course.id} variant="pro">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-1 text-base">{course.title}</CardTitle>
                <Badge variant="outline">edX</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Free
                </Badge>
                {course.videoUrl && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 gap-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Video
                  </Badge>
                )}
              </div>
              {course.instructor && (
                <p className="text-xs text-muted-foreground">By {course.instructor}</p>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              {course.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    View on edX
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                disabled={importingId === course.id}
                onClick={() => handleImport(course)}
              >
                {importingId === course.id ? "Importing..." : "Import"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p className="text-center text-muted-foreground py-12">
          Search for edX courses to import
        </p>
      )}
    </div>
  )
}
