import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getGroupDetails,
  joinGroup,
  leaveGroup,
  deleteGroup,
  updateGroup,
  generateInviteCodeAction,
  getGroupProgress,
} from "@/actions/study-groups"
import { getCurrentUserWithRole } from "@/actions/auth"
import type { Metadata } from "next"
import type { GroupMember, GroupActivity, GroupWithDetails } from "@/types/study-groups"
import { Copy, RefreshCw, BookOpen, Settings, Users, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ groupId: string }> }): Promise<Metadata> {
  const { groupId } = await params
  const group = await getGroupDetails(groupId)
  if (!group) return { title: "Group Not Found" }
  return { title: `${group.name} - Study Groups` }
}

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const [rawGroup, user] = await Promise.all([
    getGroupDetails(groupId),
    getCurrentUserWithRole(),
  ])

  if (!rawGroup) notFound()
  const group = rawGroup as GroupWithDetails

  const isMember = user ? group.members.some((m: GroupMember) => m.userId === user.id) : false
  const membership = user
    ? group.members.find((m: GroupMember) => m.userId === user.id)
    : null
  const isAdmin = membership?.role === "admin" || user?.role === "ADMIN"
  const isCreator = group.createdBy === user?.id
  const canEdit = isCreator || user?.role === "ADMIN"

  const courses = canEdit ? await getGroupProgress(groupId) : []

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/groups" className="hover:text-foreground transition-colors">Study Groups</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{group.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <Badge variant={group.isPublic ? "default" : "secondary"}>
                {group.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            {group.description && (
              <p className="text-muted-foreground mt-2">{group.description}</p>
            )}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {group.memberCount} / {group.maxMembers} members
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isMember ? (
              <>
                {isCreator && (
                  <form
                    action={async () => {
                      "use server"
                      await deleteGroup(groupId)
                      redirect("/groups")
                    }}
                  >
                    <Button variant="destructive" type="submit" size="sm">Delete Group</Button>
                  </form>
                )}
                {!isCreator && (
                  <form
                    action={async () => {
                      "use server"
                      await leaveGroup(groupId)
                    }}
                  >
                    <Button variant="outline" type="submit" size="sm">Leave Group</Button>
                  </form>
                )}
              </>
            ) : (
              <form
                action={async () => {
                  "use server"
                  await joinGroup(groupId)
                }}
              >
                <Button type="submit" size="sm">Join Group</Button>
              </form>
            )}
          </div>
        </div>

        {canEdit && (
          <Card variant="pro">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" /> Group Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server"
                  const name = formData.get("name") as string
                  const description = formData.get("description") as string
                  const maxMembers = parseInt(formData.get("maxMembers") as string, 10)
                  const isPublic = formData.get("isPublic") === "on"
                  await updateGroup(groupId, {
                    name: name || undefined,
                    description: description || null,
                    maxMembers: maxMembers || undefined,
                    isPublic,
                  })
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input id="name" name="name" defaultValue={group.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Max Members</Label>
                    <Input id="maxMembers" name="maxMembers" type="number" min={2} max={100} defaultValue={group.maxMembers} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={2} defaultValue={group.description || ""} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPublic" name="isPublic" defaultChecked={group.isPublic} className="h-4 w-4 rounded border-gray-300" />
                  <Label htmlFor="isPublic">Public group (anyone can find and join)</Label>
                </div>
                <Button type="submit" size="sm">Save Settings</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canEdit && (
          <Card variant="pro">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Copy className="h-4 w-4" /> Invite Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Share this invite code with others. They can join at <code className="text-xs bg-muted px-1 py-0.5 rounded">/groups/join?code=YOUR_CODE</code>
              </p>
              <div className="flex items-center gap-2">
                <code id="inviteCode" className="flex-1 px-3 py-2 rounded-lg bg-muted text-sm font-mono">
                  {group.inviteCode || "No code — generate one below"}
                </code>
                <form
                  action={async () => {
                    "use server"
                    await generateInviteCodeAction(groupId)
                  }}
                >
                  <Button variant="outline" size="sm" type="submit">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> New Code
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Activity Feed
            </h2>
            {group.activities.length > 0 ? (
              <div className="space-y-3">
                {group.activities.map((activity: GroupActivity) => (
                  <Card key={activity.id}>
                    <CardContent className="flex items-start gap-3 py-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user?.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {(activity.user?.name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user?.name || "Someone"}</span>
                          {" "}{activity.message || activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(activity.createdAt).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No activity yet.
                </CardContent>
              </Card>
            )}

            {canEdit && courses.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Group Courses
                </h2>
                <div className="space-y-3">
                  {courses.map((course: Record<string, unknown>) => (
                    <Card key={course.id as string}>
                      <CardContent className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">{course.title as string}</p>
                          <p className="text-xs text-muted-foreground">
                            {(course.enrolledCount as number)} member{(course.enrolledCount as number) !== 1 ? "s" : ""} enrolled
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {(course.enrolledCount as number)} enrolled
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {(member.user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user?.name || "Anonymous"}
                      </p>
                    </div>
                    <Badge variant={member.role === "admin" ? "default" : "secondary"} className="shrink-0 text-xs">
                      {member.role === "admin" ? "Admin" : "Member"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
