import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GroupCard } from "@/components/study/group-card"
import { getMyGroups, getPublicGroups, joinGroup } from "@/actions/study-groups"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Study Groups - Edu Learn",
}

export const dynamic = "force-dynamic"

export default async function GroupsPage() {
  const [myGroups, publicGroups] = await Promise.all([
    getMyGroups(),
    getPublicGroups(),
  ])

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground mt-1">
              Learn together, share progress, and stay motivated.
            </p>
          </div>
          <Button asChild className="btn-premium">
            <Link href="/groups/create">Create Group</Link>
          </Button>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">My Groups</h2>
          {myGroups.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group: any) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-muted-foreground">
                  You haven&apos;t joined any study groups yet.
                </p>
                <Button asChild variant="outline">
                  <Link href="/groups/create">Create your first group</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Discover Groups</h2>
          {publicGroups.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicGroups
                .filter((g: any) => !myGroups.some((mg: any) => mg.id === g.id))
                .map((group: any) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={async () => {
                      "use server"
                      await joinGroup(group.id)
                    }}
                  />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No public groups available yet.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
