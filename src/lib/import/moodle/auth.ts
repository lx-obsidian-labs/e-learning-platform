export type MoodleConfig = {
  baseUrl: string
  token: string
}

export async function moodleFetch<T>(config: MoodleConfig, wsfunction: string, params: Record<string, any> = {}): Promise<T> {
  const query = new URLSearchParams({
    wstoken: config.token,
    wsfunction,
    moodlewsrestformat: "json",
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  })

  const res = await fetch(`${config.baseUrl}/webservice/rest/server.php?${query}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Moodle API error: ${res.status}`)
  const data = await res.json()

  if (data.exception) throw new Error(`Moodle error: ${data.message || data.exception}`)

  return data as T
}
