"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteDiscussion } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

type Discussion = {
  id: string
  content: string
  userId: string
  courseId: string
  createdAt: string
  userName: string
  userImage: string | null
  courseTitle: string
}

type Props = {
  discussions: Discussion[]
  total: number
  page: number
  pageSize: number
}

export function DiscussionsTable({ discussions, total, page, pageSize }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const router = useRouter()

  const totalPages = Math.ceil(total / pageSize)

  function goToPage(p: number) {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(p))
    router.push(`/admin/discussions?${params.toString()}`)
  }

  async function handleDelete(discussionId: string) {
    setDeleting(discussionId)
    const result = await deleteDiscussion(discussionId)
    setDeleting(null)
    setConfirmId(null)
    if (result.success) {
      toast.success("Discussion deleted")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete discussion")
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discussions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No discussions found
                </TableCell>
              </TableRow>
            ) : (
              discussions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm font-medium">{d.userName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                    {d.courseTitle}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {d.content}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={confirmId === d.id}
                      onOpenChange={(open) => setConfirmId(open ? d.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Discussion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this discussion? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3 max-h-24 overflow-y-auto">
                          {d.content}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setConfirmId(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={deleting === d.id}
                            onClick={() => handleDelete(d.id)}
                          >
                            {deleting === d.id ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {discussions.length} of {total} discussions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
