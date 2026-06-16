export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append("file", audioBlob, "recording.webm")

  const res = await fetch("/api/ai/transcribe", {
    method: "POST",
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Transcription failed")
  return data.text
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const res = await fetch("/api/ai/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error("TTS failed")
  return res.arrayBuffer()
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}
