import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar, type NavbarUser } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LX Obsidian Labs - Premium E-Learning Platform",
  description: "Access expert-led courses, track your progress with interactive lessons, and earn verified certificates. Start your learning journey today.",
  keywords: ["e-learning", "online courses", "education", "LX Obsidian Labs", "certificates"],
  openGraph: {
    title: "LX Obsidian Labs - Premium E-Learning Platform",
    description: "Learn anything, anywhere, anytime with expert-led courses and verified certificates.",
    type: "website",
  },
}

async function getInitialUser(): Promise<NavbarUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("name, role")
    .eq('"id"', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? undefined,
    name: profile?.name || user.email?.split("@")[0] || "User",
    role: profile?.role || "STUDENT",
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialUser = await getInitialUser()

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <div className="relative">
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
              <div className="ambient-orb ambient-orb-1" />
              <div className="ambient-orb ambient-orb-2" />
            </div>
            <Navbar initialUser={initialUser} />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
