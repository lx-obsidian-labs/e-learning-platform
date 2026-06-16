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
import { Sun, Moon, Menu, X, ChevronDown, GraduationCap, Sparkles } from "lucide-react"
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
  const isDashboard = pathname.startsWith("/dashboard")

  const navLinks = [
    { href: "/", label: t("home"), note: "Overview" },
    { href: "/courses", label: t("courses"), note: "Catalog" },
    { href: "/ebooks", label: "eBooks", note: "Library" },
    { href: "/about", label: t("about"), note: "Mission" },
    { href: "/help", label: "Help", note: "Support" },
    { href: "/contact", label: t("contact"), note: "Reach us" },
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
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary text-[11px] font-semibold tracking-[0.24em] text-primary-foreground shadow-lg shadow-primary/15 transition-transform duration-300 group-hover:-translate-y-0.5">
            EL
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
              Research-grade learning
            </p>
            <span className="block truncate font-heading text-lg leading-none text-foreground">
              Edu Learn
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-background/65 p-1 shadow-sm backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              }`}
              title={link.note}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "INSTRUCTOR" && (
            <Link
              href="/instructor"
              className={`ml-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                pathname.startsWith("/instructor") ? "ring-2 ring-white/30" : ""
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Teach
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && !loading && !isDashboard && (
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-border/70 bg-background/65 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl transition hover:text-foreground lg:inline-flex"
            >
              Learning cockpit
            </Link>
          )}
          <LanguageSwitcher />

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full border border-border/60 bg-background/60"
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
                <Button variant="ghost" className="h-11 rounded-full border border-border/70 bg-background/65 px-2.5 hover:bg-accent/80">
                  <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/10 text-xs text-primary dark:bg-primary/20">
                      {(user.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                    <div className="hidden min-w-0 text-left sm:block">
                      <div className="max-w-[120px] truncate text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl border-border/70 bg-background/95 p-2 backdrop-blur-xl">
                <div className="rounded-xl border border-border/60 bg-muted/35 px-3 py-2">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Account</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                  {user.email}
                  </div>
                </div>
                {stats && (
                  <div className="mt-2 rounded-xl border border-primary/10 bg-primary/[0.06] px-3 py-2 text-xs text-muted-foreground">
                    <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Learning signal
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{tg("level", { level: stats.level })}</span>
                      <span>·</span>
                      <span>{tg("xp", { xp: stats.xp })}</span>
                      <span>·</span>
                      <span>{tg("streak", { days: stats.currentStreak })}</span>
                    </div>
                  </div>
                )}
                <div className="my-2 h-px bg-border/70" />
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
              <Button size="sm" asChild className="rounded-full bg-primary px-4 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90">
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
        <div className="animate-slide-up border-t glass-nav md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div>{link.label}</div>
                <div className={`text-[11px] uppercase tracking-[0.22em] ${pathname === link.href ? "text-background/70" : "text-muted-foreground/70"}`}>
                  {link.note}
                </div>
              </Link>
            ))}
            {user?.role === "INSTRUCTOR" && (
              <Link
                href="/instructor"
                onClick={() => setMenuOpen(false)}
                className={`block rounded-2xl bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground transition-colors ${
                  pathname.startsWith("/instructor") ? "ring-2 ring-white/30" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Teach
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
