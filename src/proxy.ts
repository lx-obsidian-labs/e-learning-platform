import { auth } from "@/lib/auth"

export const proxy = auth

export const config = {
  matcher: ["/(dashboard|instructor|admin)/:path*"],
}
