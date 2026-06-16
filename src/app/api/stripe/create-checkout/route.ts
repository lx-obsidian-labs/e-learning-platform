import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateCoupon } from "@/actions/coupons"
import { getStripePriceId } from "@/lib/pricing"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { priceId, planId, couponCode } = await req.json()

    const resolvedPriceId = priceId || getStripePriceId(planId)
    if (!resolvedPriceId) {
      return NextResponse.json({ error: "No Stripe price configured for this plan" }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from("users")
      .select("name, email")
      .eq('"id"', user.id)
      .single()

    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    let customerId = customers.data[0]?.id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.name || user.email?.split("@")[0] || "User",
        metadata: { userId: user.id },
      })
      customerId = customer.id
    }

    const sessionParams: any = {
      mode: "subscription",
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      client_reference_id: user.id,
      customer: customerId,
      metadata: { planId, userId: user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    }

    if (couponCode) {
      const result = await validateCoupon(couponCode)
      if (result.valid && result.coupon) {
        const discountType = result.coupon.discountType === "percentage" ? "percent" : "amount"
        const promotionCode = await stripe.promotionCodes.create({
          coupon: result.coupon.code,
          active: true,
        })
        sessionParams.discounts = [{ promotion_code: promotionCode.id }]
        sessionParams.metadata.couponId = result.coupon.id
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 })
  }
}
