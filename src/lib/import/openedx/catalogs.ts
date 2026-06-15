import { authedFetch } from "./auth"
import type { OpenEdxConfig } from "./auth"

export type OpenEdxCatalog = {
  id: number
  name: string
  query: string
  created: string
}

export async function getCatalogs(config: OpenEdxConfig): Promise<OpenEdxCatalog[]> {
  const data = await authedFetch(config, "/catalog/v1/catalogs/")
  return data.results || data
}
