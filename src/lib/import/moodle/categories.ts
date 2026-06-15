import { moodleFetch } from "./auth"
import type { MoodleConfig } from "./auth"

export type MoodleCategory = {
  id: number
  name: string
  idnumber?: string
  description?: string
  parent: number
  coursecount: number
  visible: number
  depth: number
  path: string
}

export async function getCategories(
  config: MoodleConfig,
  options?: { parent?: number }
): Promise<MoodleCategory[]> {
  const params: Record<string, any> = {}
  if (options?.parent !== undefined) {
    params.criteria = JSON.stringify([{ key: "parent", value: options.parent }])
  }
  return moodleFetch<MoodleCategory[]>(config, "core_course_get_categories", params)
}
