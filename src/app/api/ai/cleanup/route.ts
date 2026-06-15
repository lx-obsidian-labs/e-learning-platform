import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const secret = body?.secret || request.headers.get('x-cleanup-secret')
  if (!secret || secret !== process.env.AI_CLEANUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  // delete chats older than 1 day
  const { error } = await admin.rpc('delete_ai_chats_older_than', { p_days: 1 }).catch(() => ({ error: true }))
  if (error) {
    // fallback to SQL delete
    const res = await admin.from('ai_chats').delete().lt('"createdAt"', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    if (res.error) return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
