import type { Metadata } from "next"
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"
import { Providers } from "./providers"
import { Navbar, type NavbarUser } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateEnv } from "@/lib/env"
import { FloatingAiAssistant } from "@/components/floating-ai-assistant"
import { PwaPrompt } from "@/components/pwa-prompt"
import { NotificationPermissionBanner } from "@/components/notification-permission-banner"

validateEnv()

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const messages = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>
  const metadataMessages = messages.metadata as { title: string; description: string } | undefined

  return {
    title: metadataMessages?.title ?? "Edu Learn - Premium E-Learning Platform",
    description: metadataMessages?.description ?? "Access expert-led courses, track your progress with interactive lessons, and earn verified certificates. Start your learning journey today.",
    keywords: ["e-learning", "online courses", "education", "Edu Learn", "certificates"],
    openGraph: {
      title: metadataMessages?.title ?? "Edu Learn - Premium E-Learning Platform",
      description: metadataMessages?.description ?? "Learn anything, anywhere, anytime with expert-led courses and verified certificates.",
      type: "website",
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/icons/icon-192.svg',
    },
    manifest: '/manifest.json',
    other: {
      'theme-color': '#6366f1',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
  }
}

async function getInitialUser(): Promise<NavbarUser | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("users")
      .select("name, role, image")
      .eq('"id"', user.id)
      .maybeSingle()

    return {
      id: user.id,
      email: user.email ?? undefined,
      name: profile?.name || user.email?.split("@")[0] || "User",
      role: profile?.role || "STUDENT",
      image: profile?.image || undefined,
    }
  } catch {
    return null
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialUser = await getInitialUser()
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${plexSans.variable} ${plexMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="relative">
              <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="ambient-orb ambient-orb-1" />
                <div className="ambient-orb ambient-orb-2" />
              </div>
              <Navbar initialUser={initialUser} />
              <main>{children}</main>
              <Footer />
              <FloatingAiAssistant />
              <PwaPrompt />
              <NotificationPermissionBanner />
            </div>
          </Providers>
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
