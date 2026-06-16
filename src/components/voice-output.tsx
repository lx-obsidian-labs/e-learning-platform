"use client"

import { useEffect, useRef } from "react"
import { synthesizeSpeech } from "@/lib/voice"
import { isSpeechSynthesisSupported } from "@/lib/voice"

interface VoiceOutputProps {
  text: string
  enabled: boolean
}

export function VoiceOutput({ text, enabled }: VoiceOutputProps) {
  const spokenRef = useRef<string>("")

  useEffect(() => {
    if (!enabled || !text || text === spokenRef.current) return
    spokenRef.current = text

    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 1.0
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Female")
      ) || voices.find((v) => v.lang.startsWith("en"))
      if (preferredVoice) utterance.voice = preferredVoice
      window.speechSynthesis.speak(utterance)
      return
    }

    synthesizeSpeech(text).then((buffer) => {
      const blob = new Blob([buffer], { type: "audio/mpeg" })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => URL.revokeObjectURL(url)
      audio.play().catch(() => {})
    }).catch(() => {})
  }, [text, enabled])

  return null
}
