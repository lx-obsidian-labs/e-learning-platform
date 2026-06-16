"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  BookMarked,
  Users,
  User,
} from "lucide-react"

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

export function MobileNavigation() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      label: "Home",
    },
    {
      href: "/courses",
      icon: <Search className="h-5 w-5" />,
      label: "Courses",
    },
    {
      href: "/review",
      icon: <BookMarked className="h-5 w-5" />,
      label: "Review",
    },
    {
      href: "/groups",
      icon: <Users className="h-5 w-5" />,
      label: "Groups",
    },
    {
      href: "/settings",
      icon: <User className="h-5 w-5" />,
      label: "Profile",
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href.split("?")[0])

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-1 flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-2 transition-all duration-200",
                  isActive ? "bg-primary/10" : "group-hover:bg-muted"
                )}
              >
                {item.icon}
              </div>
              <span className="line-clamp-1">{item.label}</span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * Spacer component to prevent bottom nav from overlapping content
 */
export function MobileNavSpacer() {
  return <div className="h-20 md:h-0" />
}
