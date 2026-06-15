import { moodleFetch } from "./auth"
import type { MoodleConfig } from "./auth"

export type MoodleCourse = {
  id: number
  shortname: string
  fullname: string
  summary: string
  summaryformat: number
  categoryid: number
  categoryname?: string
  startdate: number
  enddate: number
  visible: number
  courseimage?: string
}

export async function getCourses(config: MoodleConfig, options?: { ids?: number[] }): Promise<MoodleCourse[]> {
  const params: Record<string, any> = {}
  if (options?.ids?.length) {
    params.options = JSON.stringify({ ids: options.ids })
  }
  return moodleFetch<MoodleCourse[]>(config, "core_course_get_courses", params)
}

export type MoodleCourseContent = {
  id: number
  name: string
  visible: number
  summary?: string
  modules: {
    id: number
    url?: string
    name: string
    description?: string
    modicon?: string
    modname: string
    contents?: {
      type: string
      filename: string
      fileurl: string
      filesize: number
    }[]
  }[]
}

export async function getCourseContents(config: MoodleConfig, courseId: number): Promise<MoodleCourseContent[]> {
  return moodleFetch<MoodleCourseContent[]>(config, "core_course_get_contents", { courseid: courseId })
}
