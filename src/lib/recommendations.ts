import { createAdminClient } from "@/lib/supabase/admin"
import { chatCompletion } from "@/lib/nvidia-ai"

export async function getRecommendationsForUser(userId: string) {
  const admin = createAdminClient()

  // fetch user's enrollments and progress
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('courseId,progress,status')
    .eq('"userId"', userId)

  const courseIds = (enrollments || []).map((e: any) => e.courseId)

  // fetch all published courses (small sample)
  const { data: courses } = await admin
    .from('courses')
    .select('id,title,slug,description,price')
    .eq('"status"', 'PUBLISHED')
    .limit(200)

  // Build a compact context for the model
  const userContext = {
    enrollments: enrollments || [],
    completedCourseIds: (enrollments || []).filter((e: any) => e.status === 'COMPLETED').map((e: any) => e.courseId),
  }

  const coursesSummary = (courses || []).map((c: any) => ({ id: c.id, title: c.title, slug: c.slug, price: c.price }))

  const prompt = `You are a course recommendation engine. Given the user's current enrollments and progress, recommend up to 5 courses from the provided catalog.

Input JSON:
USER_CONTEXT: ${JSON.stringify(userContext)}
COURSES: ${JSON.stringify(coursesSummary)}

Output:
Return a strict JSON array of objects with keys: slug, title, score (0-100 integer), reason (short string), predicted_weeks_to_complete (integer).
Pick courses that complement the user's progress and suggest next steps. Do not include courses the user is already enrolled in.
` 

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: 'system', content: 'You are an expert educational recommender.' },
    { role: 'user', content: prompt }
  ]

  const reply = await chatCompletion({ messages, temperature: 0.2, maxTokens: 800 })

  // try parse JSON
  try {
    const jsonStart = reply.indexOf('[')
    const jsonText = jsonStart >= 0 ? reply.slice(jsonStart) : reply
    const parsed = JSON.parse(jsonText)
    return parsed
  } catch (err) {
    console.warn('Recommendation parsing failed', err)
    return []
  }
}

export async function getInsightsForUser(userId: string) {
  const admin = createAdminClient()
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('courseId,progress,status')
    .eq('"userId"', userId)

  const userContext = {
    enrollments: enrollments || [],
  }

  const prompt = `Provide up to 5 concise insights and actionable advice for a learner based on the following context. Include: (1) a short performance summary, (2) 2-3 suggested next steps, (3) one personalized tip to improve completion rate. Output as JSON with keys: summary, suggestions (array), tip.

CONTEXT: ${JSON.stringify(userContext)}`

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: 'system', content: 'You are an educational coach that provides short, actionable insights.' },
    { role: 'user', content: prompt }
  ]

  try {
    const reply = await chatCompletion({ messages, temperature: 0.2, maxTokens: 400 })
    const jsonStart = reply.indexOf('{')
    const jsonText = jsonStart >= 0 ? reply.slice(jsonStart) : reply
    const parsed = JSON.parse(jsonText)
    return parsed
  } catch (err) {
    console.warn('Insights generation failed', err)
    return { summary: 'No insights available', suggestions: [], tip: '' }
  }
}
