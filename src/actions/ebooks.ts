"use server"

import { getDefaultEbookService } from "@/lib/ebooks/aggregation"
import type { Ebook } from "@/lib/ebooks/types"

export { type Ebook }

const service = getDefaultEbookService()

export async function getEbooks(options?: {
  category?: string
  search?: string
  limit?: number
}) {
  try {
    return await service.searchEbooks(options?.search, {
      category: options?.category,
      limit: options?.limit || 24,
    })
  } catch {
    return [] as Ebook[]
  }
}

export async function getEbook(id: string) {
  try {
    return await service.getEbook(id)
  } catch {
    return null
  }
}

export async function getEbookCategories() {
  return service.getCategories()
}

export async function getEbookContent(id: string): Promise<string | null> {
  try {
    return await service.getEbookContent(id)
  } catch {
    return null
  }
}
