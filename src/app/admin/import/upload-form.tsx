"use client"

import { useState, useRef } from "react"
import { importCourses } from "@/actions/importer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type ImportResult = {
  title: string
  status: string
  error?: string
}

export function UploadForm() {
  const [format, setFormat] = useState<"json" | "csv">("json")
  const [raw, setRaw] = useState("")
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setRaw(ev.target?.result as string)
    reader.readAsText(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!raw.trim()) { toast.error("Paste content or upload a file"); return }

    setLoading(true)
    setResults(null)

    try {
      const res = await importCourses(raw, format)
      if (res.error) { toast.error(res.error); setLoading(false); return }
      setResults(res.results || [])
      const imported = (res.results || []).filter((r) => r.status === "imported").length
      toast.success(`Imported ${imported} course(s)`)
    } catch {
      toast.error("Import failed")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Button type="button" variant={format === "json" ? "default" : "outline"} onClick={() => setFormat("json")}>JSON</Button>
          <Button type="button" variant={format === "csv" ? "default" : "outline"} onClick={() => setFormat("csv")}>CSV</Button>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Upload file</label>
          <input ref={fileRef} type="file" accept={format === "json" ? ".json" : ".csv"} onChange={handleFile} className="block text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Or paste {format.toUpperCase()} content</label>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            placeholder={`Paste your ${format.toUpperCase()} here...`}
            className="font-mono text-sm"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Importing..." : `Import ${format.toUpperCase()}`}
        </Button>
      </form>

      {results && (
        <div className="space-y-2">
          <h3 className="font-semibold">Results</h3>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Badge variant={r.status === "imported" ? "default" : r.status === "skipped" ? "secondary" : "destructive"}>
                {r.status}
              </Badge>
              <span>{r.title}</span>
              {r.error && <span className="text-xs text-muted-foreground">— {r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
