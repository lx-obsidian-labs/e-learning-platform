"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Sun, Moon, Menu, X } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getMyStats } from "@/actions/gamification"

export type NavbarUser = {
  id: string
  name: string
  email?: string
  role: string
  image?: string
}

export function Navbar({ initialUser }: { initialUser?: NavbarUser | null }) {
  const t = useTranslations("nav")
  const tc = useTranslations("common")
  const tg = useTranslations("gamification")
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<NavbarUser | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)
  const [stats, setStats] = useState<{ level: number; xp: number; xpForNext: number; currentStreak: number } | null>(null)

  const isAuthPage = pathname.startsWith("/auth/")
  const isAdmin = pathname.startsWith("/admin")

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/courses", label: t("courses") },
    { href: "/ebooks", label: "eBooks" },
    { href: "/about", label: t("about") },
    { href: "/help", label: "Help" },
    { href: "/contact", label: t("contact") },
  ]

  useEffect(() => {
    setMounted(true)

    if (initialUser) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          try {
            const res = await fetch("/api/user/role")
            const data = await res.json()
            setUser({
              id: session.user.id,
              email: session.user.email ?? undefined,
              name: session.user.email?.split("@")[0] || "User",
              role: data.role || "STUDENT",
            })
          } catch {
            setUser({
              id: session.user.id,
              email: session.user.email ?? undefined,
              name: session.user.email?.split("@")[0] || "User",
              role: "STUDENT",
            })
          }
        }
        setLoading(false)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { getMyStats().then(setStats) }, [])

  if (isAuthPage || isAdmin) return null

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
            EL
          </div>
          <span className="text-lg font-bold tracking-tight">
              <span className="gradient-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                EL
              </span>
              <span className="text-muted-foreground"> Edu Learn</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "INSTRUCTOR" && (
            <Link
              href="/instructor"
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/20 ${
                pathname.startsWith("/instructor") ? "ring-2 ring-white/30" : ""
              }`}
            >
              <svg className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
              Teach
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full"
              aria-label={t("toggleTheme")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {loading ? null : user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 rounded-full hover:bg-accent">
                  <Avatar className="h-7 w-7 ring-2 ring-indigo-200 dark:ring-indigo-800">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                      {(user.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
                  {user.email}
                </div>
                {stats && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-b flex items-center gap-1">
                    <span>{tg("level", { level: stats.level })}</span>
                    <span>·</span>
                    <span>{tg("xp", { xp: stats.xp })}</span>
                    <span>·</span>
                    <span>{tg("streak", { days: stats.currentStreak })}</span>
                  </div>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">{t("dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/review" className="cursor-pointer">{t("reviews")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/analytics" className="cursor-pointer">{t("analytics")}</Link>
                </DropdownMenuItem>
                {user.role === "INSTRUCTOR" && (
                  <DropdownMenuItem asChild className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 font-medium">
                    <Link href="/instructor" className="cursor-pointer">
                      🎓 {t("instructorPanel")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">{t("adminPanel")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">{t("orders")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">{t("notifications")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard" className="cursor-pointer">{t("leaderboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/badges" className="cursor-pointer">{t("badges")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/certificates" className="cursor-pointer">{t("certificates")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/groups" className="cursor-pointer">{t("studyGroups")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">{t("settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  {tc("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">{tc("signIn")}</Link>
              </Button>
              <Button size="sm" asChild className="shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0">
                <Link href="/auth/register">{t("getStartedFree")}</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t glass-nav animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "INSTRUCTOR" && (
              <Link
                href="/instructor"
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors bg-gradient-to-r from-indigo-500 to-purple-600 text-white ${
                  pathname.startsWith("/instructor") ? "ring-2 ring-white/30" : ""
                }`}
              >
                🎓 Teach
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
