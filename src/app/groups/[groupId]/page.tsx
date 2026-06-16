import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getGroupDetails, joinGroup, leaveGroup, deleteGroup } from "@/actions/study-groups"
import { getCurrentUserWithRole } from "@/actions/auth"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ groupId: string }> }): Promise<Metadata> {
  const { groupId } = await params
  const group = await getGroupDetails(groupId)
  if (!group) return { title: "Group Not Found" }
  return {
    title: `${group.name} - Study Groups`,
  }
}

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const [group, user] = await Promise.all([
    getGroupDetails(groupId),
    getCurrentUserWithRole(),
  ])

  if (!group) notFound()

  const isMember = user ? group.members.some((m: any) => m.userId === user.id) : false
  const membership = user
    ? group.members.find((m: any) => m.userId === user.id)
    : null
  const isAdmin = membership?.role === "admin" || user?.role === "ADMIN"
  const isCreator = group.createdBy === user?.id

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/groups" className="hover:text-foreground transition-colors">
            Study Groups
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{group.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <Badge variant={group.isPublic ? "default" : "secondary"}>
                {group.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            {group.description && (
              <p className="text-muted-foreground mt-2">{group.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              👥 {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
              {group.maxMembers && <span> · Max {group.maxMembers}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isMember ? (
              <>
                {isCreator && (
                  <form
                    action={async () => {
                      "use server"
                      await deleteGroup(groupId)
                    }}
                  >
                    <Button variant="destructive" type="submit">
                      Delete Group
                    </Button>
                  </form>
                )}
                {!isCreator && (
                  <form
                    action={async () => {
                      "use server"
                      await leaveGroup(groupId)
                    }}
                  >
                    <Button variant="outline" type="submit">
                      Leave Group
                    </Button>
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
                <Button type="submit">Join Group</Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section>
            <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
            {group.activities.length > 0 ? (
              <div className="space-y-3">
                {group.activities.map((activity: any) => (
                  <Card key={activity.id}>
                    <CardContent className="flex items-start gap-3 py-3">
                      <Avatar size="sm">
                        <AvatarImage src={activity.user?.image} />
                        <AvatarFallback>
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
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
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
          </section>

          <aside className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <div className="space-y-3">
                {group.members.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={member.user?.image} />
                      <AvatarFallback>
                        {(member.user?.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
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
