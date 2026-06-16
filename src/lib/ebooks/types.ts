export interface Ebook {
  id: string
  title: string
  author: string
  description: string | null
  coverUrl: string | null
  fileUrl: string
  source: string
  sourceName: string
  category: string | null
  pages: number | null
}

export interface EbookProvider {
  readonly name: string
  readonly sourceName: string
  searchEbooks(query?: string, options?: { category?: string; limit?: number }): Promise<Ebook[]>
  getEbook(id: string): Promise<Ebook | null>
  getContent?(id: string): Promise<string | null>
}
