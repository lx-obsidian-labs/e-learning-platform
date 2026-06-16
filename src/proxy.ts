import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createI18nMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

const i18nMiddleware = createI18nMiddleware(routing)

export async function proxy(request: NextRequest) {
  const i18nResponse = i18nMiddleware(request)

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const path = url.pathname

  let role = "STUDENT"
  if (user) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await admin
      .from("users")
      .select("role")
      .eq('"id"', user.id)
      .maybeSingle()

    if (profile) {
      role = profile.role
    }
  }

  if (!user && (path.startsWith("/dashboard") || path.startsWith("/instructor") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (user && role === "STUDENT" && (path.startsWith("/instructor") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (user && role === "INSTRUCTOR" && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (user && (path === "/auth/login" || path === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  const response = supabaseResponse

  if (i18nResponse.cookies) {
    const i18nCookies = i18nResponse.cookies as unknown as { getAll: () => { name: string; value: string }[] }
    const cookies = i18nCookies.getAll()
    for (const cookie of cookies) {
      response.cookies.set(cookie.name, cookie.value)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
