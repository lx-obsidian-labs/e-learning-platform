// Required env vars:
// STRIPE_SECRET_KEY=sk_live_...
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
// STRIPE_WEBHOOK_SECRET=whsec_...
// STRIPE_PRICE_PREMIUM=price_...
// STRIPE_PRICE_ENTERPRISE=price_...
// NEXT_PUBLIC_APP_URL=https://edulearn.com

import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as any,
  typescript: true,
})

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
}
