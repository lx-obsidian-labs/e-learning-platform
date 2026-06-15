export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
export type PaymentMethod = "EFT" | "PAYFAST" | "YOCO" | "STRIPE"

export interface PricingPlan {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  interval: string | null
  features: string[]
  active: boolean
  createdAt: string
}

export interface Order {
  id: string
  stripeSessionId: string | null
  amount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  reference: string | null
  currency: string
  createdAt: string
  updatedAt: string
  userId: string
  courseId: string | null
  planId: string | null
}

export interface PaymentProof {
  id: string
  fileUrl: string
  uploadedAt: string
  verifiedAt: string | null
  orderId: string
  verifiedBy: string | null
}
