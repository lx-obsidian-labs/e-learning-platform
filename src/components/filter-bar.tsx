"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = { id: string; name: string; slug: string }

type Props = {
  categories: Category[]
  current: {
    category?: string
    q?: string
    sort?: string
    price?: string
    rating?: string
  }
}

export function FilterBar({ categories, current }: Props) {
  const router = useRouter()
  const sp = new URLSearchParams(
    Object.fromEntries(Object.entries(current).filter(([_, v]) => v))
  )

  function navigate(updates: Record<string, string | undefined>) {
    const p = new URLSearchParams(sp)
    for (const [key, value] of Object.entries(updates)) {
      if (!value) p.delete(key)
      else p.set(key, value)
    }
    router.push(`/courses?${p.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Explore Courses</h1>
          <p className="text-muted-foreground mt-1">
            Browse our course catalog
          </p>
        </div>
        <form
          className="relative w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const q = fd.get("q") as string
            navigate({ q: q || undefined })
          }}
        >
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            name="q"
            defaultValue={current.q ?? ""}
            placeholder="Search courses..."
            className="pl-9"
          />
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/courses?${(() => { const p = new URLSearchParams(sp); p.delete("category"); return p.toString() })() || ""}`}
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm transition-colors hover:bg-secondary ${!current.category ? "bg-primary text-primary-foreground border-primary" : ""}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?${new URLSearchParams({ ...sp, category: cat.slug }).toString()}`}
              className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm transition-colors hover:bg-secondary ${current.category === cat.slug ? "bg-primary text-primary-foreground border-primary" : ""}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Select
            defaultValue={current.price || "all"}
            onValueChange={(v) => navigate({ price: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-28 h-9 text-xs">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select
            defaultValue={current.rating || "0"}
            onValueChange={(v) => navigate({ rating: v === "0" ? undefined : v })}
          >
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Select
            defaultValue={current.sort || "newest"}
            onValueChange={(v) => navigate({ sort: v })}
          >
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_asc">Price: Low</SelectItem>
              <SelectItem value="price_desc">Price: High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
