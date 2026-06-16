import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured", text: "" }, { status: 503 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No audio file provided" }, { status: 400 })

    const openai = new OpenAI({ apiKey })
    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      language: "en",
    })

    return NextResponse.json({ text: transcription.text || "" })
  } catch (error) {
    console.error("Whisper error:", error)
    return NextResponse.json({ error: "Transcription failed", text: "" }, { status: 500 })
  }
}
