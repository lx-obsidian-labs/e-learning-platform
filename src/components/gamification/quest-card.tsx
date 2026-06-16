"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Celebration } from "@/components/gamification/celebration"
import { claimQuestReward } from "@/actions/quests"

interface QuestCardQuest {
  id: string
  userId: string
  questId: string
  progress: number
  completed: boolean
  claimed: boolean
  date: string
  title: string
  description: string
  xpReward: number
  icon: string
  requirementType: string
  requirementCount: number
}

interface QuestCardProps {
  quest: QuestCardQuest
  onClaimed?: () => void
}

export function QuestCard({ quest, onClaimed }: QuestCardProps) {
  const [claiming, setClaiming] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [claimed, setClaimed] = useState(quest.claimed)

  const percent = Math.min(100, Math.round((quest.progress / quest.requirementCount) * 100))

  async function handleClaim() {
    setClaiming(true)
    const result = await claimQuestReward(quest.id)
    setClaiming(false)

    if (!result.error) {
      setClaimed(true)
      setShowCelebration(true)
      onClaimed?.()
    }
  }

  return (
    <>
      <Card variant="pro" className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{quest.icon}</span>
              <div>
                <h4 className="font-semibold text-sm leading-tight">{quest.title}</h4>
                <p className="text-xs text-muted-foreground">{quest.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              +{quest.xpReward} XP
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{quest.progress} / {quest.requirementCount}</span>
            </div>
            <Progress value={percent} />
          </div>

          <div>
            {claimed ? (
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span>✓</span>
                <span>Claimed</span>
              </div>
            ) : quest.completed ? (
              <Button
                size="sm"
                className="w-full btn-premium"
                onClick={handleClaim}
                disabled={claiming}
              >
                {claiming ? "Claiming..." : `Claim ${quest.xpReward} XP`}
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs">
                In progress
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Celebration
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
        message={`+${quest.xpReward} XP Earned!`}
      />
    </>
  )
}
