"use client"

import { useState, useRef } from "react"
import { importCourses, previewImport } from "@/actions/importer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Eye, Upload, FileCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

type ImportResult = {
  title: string
  status: string
  error?: string
  details?: { modules: number; lessons: number; quizzes: number }
}

type PreviewItem = {
  title: string
  valid: boolean
  error: string | null
  modules: number
  lessons: number
  quizzes: number
}

export function UploadForm() {
  const [format, setFormat] = useState<"json" | "csv">("json")
  const [raw, setRaw] = useState("")
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [preview, setPreview] = useState<PreviewItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"input" | "preview" | "done">("input")
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setRaw(ev.target?.result as string)
    reader.readAsText(file)
  }

  async function handlePreview() {
    if (!raw.trim()) { toast.error("Paste content or upload a file"); return }

    setLoading(true)
    try {
      const res = await previewImport(raw, format)
      if (res.error) { toast.error(res.error); setLoading(false); return }
      setPreview(res.courses || [])
      setStep("preview")
    } catch {
      toast.error("Preview failed")
    }
    setLoading(false)
  }

  async function handleSubmit() {
    setLoading(true)
    setResults(null)

    try {
      const res = await importCourses(raw, format)
      if (res.error) { toast.error(res.error); setLoading(false); return }
      setResults(res.results || [])
      const imported = (res.results || []).filter((r) => r.status === "imported").length
      toast.success(`Imported ${imported} course(s)`)
      setStep("done")
    } catch {
      toast.error("Import failed")
    }
    setLoading(false)
  }

  function resetForm() {
    setRaw("")
    setResults(null)
    setPreview(null)
    setStep("input")
  }

  if (step === "preview" && preview) {
    const validCount = preview.filter((p) => p.valid).length
    const total = preview.length

    return (
      <div className="space-y-6">
        <Card variant="pro">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" /> Import Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {validCount} of {total} courses are valid and ready to import.
            </p>
            <div className="space-y-2">
              {preview.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {item.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.modules} module{item.modules !== 1 ? "s" : ""}, {item.lessons} lesson{item.lessons !== 1 ? "s" : ""}
                        {item.quizzes > 0 && `, ${item.quizzes} quiz${item.quizzes !== 1 ? "zes" : ""}`}
                      </p>
                    </div>
                  </div>
                  {item.error && (
                    <Badge variant="destructive" className="text-xs shrink-0 ml-2">{item.error}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={loading || validCount === 0} className="btn-premium">
            <Upload className="h-4 w-4 mr-2" /> Import {validCount} Course{validCount !== 1 ? "s" : ""}
          </Button>
          <Button variant="outline" onClick={resetForm} disabled={loading}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handlePreview() }} className="space-y-4">
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

        <Button type="submit" disabled={loading || !raw.trim()}>
          {loading ? "Analyzing..." : <><Eye className="h-4 w-4 mr-2" /> Preview Import</>}
        </Button>
      </form>

      {results && step === "done" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> Import Results
            </h3>
            <Button variant="outline" size="sm" onClick={resetForm}>Import More</Button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Badge variant={r.status === "imported" ? "default" : r.status === "skipped" ? "secondary" : "destructive"}>
                  {r.status}
                </Badge>
                <span className="text-sm font-medium">{r.title}</span>
                {r.error && <span className="text-xs text-muted-foreground">— {r.error}</span>}
              </div>
              {r.details && (
                <span className="text-xs text-muted-foreground">
                  {r.details.modules}m · {r.details.lessons}l{r.details.quizzes > 0 ? ` · ${r.details.quizzes}q` : ""}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
