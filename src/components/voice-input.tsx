"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { transcribeAudio } from "@/lib/voice"

interface VoiceInputProps {
  onTranscribe: (text: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscribe, disabled }: VoiceInputProps) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    chunksRef.current = []

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"
      recognitionRef.current = recognition

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setProcessing(false)
        if (transcript.trim()) onTranscribe(transcript)
      }
      recognition.onerror = () => {
        recognitionRef.current = null
        startMediaRecorder()
      }
      recognition.onend = () => {
        setProcessing(false)
        setRecording(false)
      }

      setProcessing(true)
      recognition.start()
      return
    }

    startMediaRecorder()
  }, [onTranscribe])

  async function startMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach((t) => t.stop())

        if (blob.size < 1000) {
          setProcessing(false)
          return
        }

        try {
          const text = await transcribeAudio(blob)
          if (text.trim()) onTranscribe(text)
        } catch {
          toast.error("Failed to transcribe audio")
        }
        setProcessing(false)
      }

      recorder.start()
      setRecording(true)
    } catch {
      toast.error("Microphone access denied")
      setRecording(false)
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant={recording ? "destructive" : "ghost"}
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || processing}
      className={`h-9 w-9 rounded-full shrink-0 ${recording ? "animate-pulse" : ""}`}
      aria-label={recording ? "Stop recording" : "Start recording"}
      title={recording ? "Stop recording" : "Voice input"}
    >
      {processing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : recording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}
