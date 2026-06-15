"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type Insights = {
  summary: string
  suggestions: string[]
  tip: string
}

export function AiInsights({ initialInsights, autoOpen = false }: { initialInsights: Insights | null, autoOpen?: boolean }) {
  const [open, setOpen] = useState(autoOpen)
  const [insights, setInsights] = useState<Insights | null>(initialInsights)

  useEffect(() => {
    if (autoOpen && initialInsights) setOpen(true)
  }, [autoOpen, initialInsights])

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="btn-premium">Insights</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[40vh]">
          <SheetHeader>
            <SheetTitle>Learning Insights & Advice</SheetTitle>
          </SheetHeader>
          <div className="p-4 overflow-auto space-y-4">
            {insights ? (
              <div>
                <p className="font-medium">Summary</p>
                <p className="text-sm text-muted-foreground">{insights.summary}</p>
                <div className="mt-3">
                  <p className="font-medium">Suggestions</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {insights.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="font-medium">Tip</p>
                  <p className="text-sm text-muted-foreground">{insights.tip}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No insights available.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
