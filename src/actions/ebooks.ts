"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getEbooks(options?: {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
}) {
  const admin = createAdminClient()

  let query = admin.from("ebooks").select("*")

  if (options?.featured) {
    query = query.eq('"featured"', true)
  }

  if (options?.category) {
    query = query.eq('"category"', options.category)
  }

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,author.ilike.%${options.search}%`)
  }

  query = query.order('"createdAt"', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data } = await query
  return (data || []) as Ebook[]
}

export async function getEbook(id: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("ebooks").select("*").eq('"id"', id).single()
  return data as Ebook | null
}

export async function getEbookCategories() {
  const admin = createAdminClient()
  const { data } = await admin.from("ebooks").select('"category"')
  const categories = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))]
  return categories.sort() as string[]
}

export type Ebook = {
  id: string
  title: string
  author: string
  description: string | null
  coverUrl: string | null
  fileUrl: string
  source: string
  category: string | null
  pages: number | null
  isFree: boolean
  featured: boolean
  readCount: number
  createdAt: string
  updatedAt: string
}
