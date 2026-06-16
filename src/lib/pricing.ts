export function getStripePriceId(planId: string): string {
  const prices: Record<string, string> = {
    plan_premium: process.env.STRIPE_PRICE_PREMIUM || "",
    plan_enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
  }
  return prices[planId] || ""
}
