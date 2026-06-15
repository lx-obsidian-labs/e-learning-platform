import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProgressCardProps {
  title: string
  slug: string
  instructorName?: string
  progress: number
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  totalLessons: number
  gradient?: string
  category?: string
}

const STATUS_MAP = {
  NOT_STARTED: { label: "Not Started", variant: "outline" as const },
  IN_PROGRESS: { label: "In Progress", variant: "secondary" as const },
  COMPLETED: { label: "Completed", variant: "default" as const },
}

const GRADIENTS = [
  "from-blue-600 to-purple-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-red-600",
  "from-pink-600 to-rose-600",
  "from-indigo-600 to-blue-600",
  "from-teal-600 to-cyan-600",
]

export function ProgressCard({
  title,
  slug,
  instructorName,
  progress,
  status,
  totalLessons,
  gradient,
  category,
}: ProgressCardProps) {
  const bg = gradient || GRADIENTS[0]
  const statusInfo = STATUS_MAP[status]

  return (
    <Link href={`/courses/${slug}`} className="group">
      <Card className="overflow-hidden card-hover h-full pro-card">
        <div className={`h-20 bg-gradient-to-br ${bg} relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="text-white font-semibold text-sm truncate">
              {title}
            </h3>
          </div>
        </div>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{instructorName}</span>
            <Badge variant={statusInfo.variant} className="text-[10px]">
              {statusInfo.label}
            </Badge>
          </div>

          {category && (
            <p className="text-xs text-muted-foreground">{category}</p>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalLessons} lessons
            </span>
            <span className="group-hover:text-primary transition-colors font-medium text-xs">
              {status === "COMPLETED" ? "Review →" : "Continue →"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
