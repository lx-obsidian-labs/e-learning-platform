"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { uploadProof } from "@/actions/payments"
import { CheckCircle, Upload } from "lucide-react"

export function CheckoutForm({ orderId, hasProof }: { orderId: string; hasProof: boolean }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(hasProof)
  const [error, setError] = useState("")

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB")
      return
    }

    if (!["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
      setError("Only PNG, JPG, or PDF files are accepted")
      return
    }

    setUploading(true)
    setError("")

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })

      const result = await uploadProof(orderId, base64, file.type)
      if (result.error) {
        setError(result.error)
        return
      }

      setUploaded(true)
      router.refresh()
    } catch {
      setError("Failed to upload proof")
    } finally {
      setUploading(false)
    }
  }

  if (uploaded) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-6 text-center">
        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Proof uploaded successfully!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your payment is pending verification. We&apos;ll notify you once it&apos;s approved.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <h3 className="font-semibold mb-4">Upload Proof of Payment</h3>
      <p className="text-sm text-muted-foreground mb-4">
        After making the EFT payment, upload a screenshot or PDF of your payment confirmation.
      </p>

      <div className="flex items-center gap-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 file:cursor-pointer"
        />
        <Button onClick={handleUpload} disabled={uploading} size="sm">
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}
