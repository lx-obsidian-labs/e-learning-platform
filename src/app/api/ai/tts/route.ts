import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 })
    }

    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 })

    const openai = new OpenAI({ apiKey })
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text.slice(0, 4096),
    })

    const audioBuffer = Buffer.from(await response.arrayBuffer())
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("TTS error:", error)
    return NextResponse.json({ error: "TTS failed" }, { status: 500 })
  }
}
