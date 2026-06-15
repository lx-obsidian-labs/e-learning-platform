"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type ExternalCourse = {
  title: string
  description: string
  url: string
  platform: string
  isFree: boolean
  sourceId: string
}

export function ImportForm() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ExternalCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/external-courses?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
    } catch {
      toast.error("Failed to search external courses")
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(course: ExternalCourse) {
    setImportingId(course.sourceId)
    try {
      const res = await fetch("/api/external-courses/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success("Course imported successfully")
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
          placeholder="Search free courses..."
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
          <Card key={course.sourceId} variant="pro">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-1 text-base">{course.title}</CardTitle>
                <Badge variant="outline">{course.platform}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Free
              </Badge>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={course.url} target="_blank" rel="noopener noreferrer">
                  View Original
                </a>
              </Button>
              <Button
                size="sm"
                disabled={importingId === course.sourceId}
                onClick={() => handleImport(course)}
              >
                {importingId === course.sourceId ? "Importing..." : "Import"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p className="text-center text-muted-foreground py-12">
          Search for free courses to import
        </p>
      )}
    </div>
  )
}
