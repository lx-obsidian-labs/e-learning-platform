"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RevenueData = { date: string; amount: number }

export function RevenueChart({ data }: { data: RevenueData[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue (30 days)</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground py-8">
          No revenue data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-0.5 h-40">
          {data.map((d) => (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className="w-full rounded-t-sm bg-indigo-500 hover:bg-indigo-600 transition-colors min-h-[2px]"
                style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                title={`${d.date}: $${d.amount.toFixed(2)}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {data
            .filter((_, i) => i % 5 === 0 || i === data.length - 1)
            .map((d) => (
              <span key={d.date}>
                {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
