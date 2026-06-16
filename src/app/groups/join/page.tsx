import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinGroupByInviteCode } from "@/actions/study-groups"
import { getCurrentUserWithRole } from "@/actions/auth"
import { Users } from "lucide-react"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ code?: string }>
}

export default async function JoinByCodePage({ searchParams }: Props) {
  const params = await searchParams
  const user = await getCurrentUserWithRole()

  if (params.code) {
    const result = await joinGroupByInviteCode(params.code)
    if (result.error) {
      return (
        <div className="min-h-screen pt-16 sm:pt-20 flex items-center justify-center">
          <Card variant="pro" className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <Users className="h-12 w-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold">Could Not Join</h1>
              <p className="text-muted-foreground">{result.error}</p>
              <Button asChild>
                <Link href="/groups">Back to Groups</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    redirect("/groups")
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 flex items-center justify-center">
      <Card variant="pro" className="w-full max-w-md mx-4">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            <Users className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Join Study Group</h1>
            <p className="text-sm text-muted-foreground">
              Enter the invite code shared by the group creator.
            </p>
          </div>

          <form
            action={async (formData: FormData) => {
              "use server"
              const code = formData.get("code") as string
              if (!code) return
              if (!user) {
                redirect(`/auth/login?redirect=/groups/join?code=${encodeURIComponent(code)}`)
              }
              const result = await joinGroupByInviteCode(code)
              if (!result.error) redirect("/groups")
            }}
            className="space-y-4"
          >
            <Input
              name="code"
              placeholder="Paste invite code here"
              required
              className="text-center font-mono text-lg"
            />
            <Button type="submit" className="btn-premium w-full">
              Join Group
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Don&apos;t have a code?{" "}
            <Link href="/groups" className="text-primary hover:underline">
              Browse public groups
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
