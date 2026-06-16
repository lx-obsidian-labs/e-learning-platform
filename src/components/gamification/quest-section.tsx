"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { QuestCard } from "@/components/gamification/quest-card"

interface QuestSectionProps {
  quests: any[]
}

export function QuestSection({ quests }: QuestSectionProps) {
  const [key, setKey] = useState(0)

  function handleClaimed() {
    setKey((k) => k + 1)
  }

  if (!quests || quests.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Daily Quests</h2>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🎯</span>
            <p className="text-muted-foreground text-sm">
              No quests available today. Check back tomorrow!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div key={key}>
      <h2 className="text-xl font-semibold mb-4">Daily Quests</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} onClaimed={handleClaimed} />
        ))}
      </div>
    </div>
  )
}
