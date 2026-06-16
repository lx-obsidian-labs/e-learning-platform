"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { WeakSpot } from "@/actions/analytics"

interface WeakSpotsSectionProps {
  spots: WeakSpot[]
}

function easinessColor(easiness: number): string {
  if (easiness < 2.0) return "text-red-500 font-medium"
  if (easiness < 2.5) return "text-yellow-500 font-medium"
  return "text-green-500 font-medium"
}

function easinessLabel(easiness: number): string {
  if (easiness < 1.5) return "Very Hard"
  if (easiness < 2.0) return "Hard"
  if (easiness < 2.5) return "Medium"
  return "Easy"
}

export function WeakSpotsSection({ spots }: WeakSpotsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Lesson</th>
                <th className="pb-2 font-medium">Module</th>
                <th className="pb-2 font-medium text-right">Easiness</th>
                <th className="pb-2 font-medium text-right">Interval (days)</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((spot) => (
                <tr key={spot.lessonId} className="border-b last:border-0">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">{spot.title}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{spot.moduleTitle}</td>
                  <td className={cn("py-2.5 text-right", easinessColor(spot.easiness))}>
                    {spot.easiness.toFixed(1)} — {easinessLabel(spot.easiness)}
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">
                    {Math.round(spot.interval)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
