"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ActivityDay } from "@/actions/analytics"

interface ActivityCalendarProps {
  data: ActivityDay[]
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]
const CELL_SIZE = 12
const CELL_GAP = 3

function getColor(count: number): string {
  if (count === 0) return "bg-muted"
  if (count <= 2) return "bg-indigo-200 dark:bg-indigo-800"
  if (count <= 5) return "bg-indigo-400 dark:bg-indigo-600"
  return "bg-indigo-600 dark:bg-indigo-400"
}

export function ActivityCalendar({ data }: ActivityCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const countMap = new Map(data.map((d) => [d.date, d.count]))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: { date: Date; count: number }[] = []
    for (let i = 69; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      days.push({ date: d, count: countMap.get(dateStr) || 0 })
    }

    const weeks: { days: { date: Date; count: number }[]; month?: string }[] = []
    const monthLabels: { label: string; colSpan: number }[] = []

    let currentWeek: { date: Date; count: number }[] = []
    let lastMonth = -1
    let monthSpan = 0
    let currentMonthLabel = ""

    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      currentWeek.push(day)

      const month = day.date.getMonth()
      if (month !== lastMonth) {
        if (currentMonthLabel) {
          monthLabels.push({ label: currentMonthLabel, colSpan: monthSpan })
        }
        currentMonthLabel = day.date.toLocaleDateString("en-US", { month: "short" })
        monthSpan = 0
        lastMonth = month
      }

      if (day.date.getDay() === 6 || i === days.length - 1) {
        if (currentMonthLabel) {
          monthSpan++
        }
        weeks.push({ days: currentWeek })
        currentWeek = []
      }
    }

    if (currentMonthLabel) {
      monthLabels.push({ label: currentMonthLabel, colSpan: monthSpan })
    }

    return { weeks, monthLabels }
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1">
            <div className="flex gap-[3px] ml-8">
              {monthLabels.map((m, i) => (
                <div
                  key={i}
                  className="text-[10px] text-muted-foreground font-medium"
                  style={{ width: m.colSpan * (CELL_SIZE + CELL_GAP) - CELL_GAP }}
                >
                  {m.label}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              <div className="flex flex-col gap-[3px] mr-1">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-muted-foreground leading-none flex items-center"
                    style={{ height: CELL_SIZE }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                    const day = week.days[dayIdx]
                    if (!day) return <div key={dayIdx} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                    return (
                      <div
                        key={dayIdx}
                        className={cn("rounded-[3px]", getColor(day.count))}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        title={`${day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}: ${day.count} completion${day.count !== 1 ? "s" : ""}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 ml-8">
              <span className="text-[10px] text-muted-foreground">Less</span>
              <div className="w-3 h-3 rounded-[3px] bg-muted" />
              <div className="w-3 h-3 rounded-[3px] bg-indigo-200 dark:bg-indigo-800" />
              <div className="w-3 h-3 rounded-[3px] bg-indigo-400 dark:bg-indigo-600" />
              <div className="w-3 h-3 rounded-[3px] bg-indigo-600 dark:bg-indigo-400" />
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
