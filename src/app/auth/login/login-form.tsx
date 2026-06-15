"use client"

import { useActionState } from "react"
import { signIn } from "@/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="underline hover:text-primary">
          Register
        </a>
      </p>
    </form>
  )
}
