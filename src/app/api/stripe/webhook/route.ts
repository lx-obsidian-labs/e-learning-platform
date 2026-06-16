import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const admin = createAdminClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        const couponId = session.metadata?.couponId

        if (!userId || !planId) {
          console.error("Missing userId or planId in session metadata")
          break
        }

        const subscriptionId = session.subscription
        const customerId = session.customer

        let subData: any = {}
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          subData = {
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          }
        }

        const orderData: any = {
          id: randomUUID(),
          userId,
          planId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: (session.currency || "usd").toUpperCase(),
          paymentMethod: "STRIPE",
          status: "COMPLETED",
          stripeSessionId: session.id,
          updatedAt: new Date().toISOString(),
        }

        if (couponId) {
          orderData.couponId = couponId
          orderData.discountAmount = session.total_details?.amount_discount
            ? session.total_details.amount_discount / 100
            : 0
        }

        const affiliateId = session.metadata?.affiliateId
        if (affiliateId) {
          orderData.affiliateId = affiliateId
        }

        const { error: orderError } = await admin.from("orders").insert(orderData)
        if (orderError) {
          console.error("Failed to create order from checkout:", orderError)
          break
        }

        if (subscriptionId) {
          const { error: subError } = await admin.from("stripe_subscriptions").insert({
            id: randomUUID(),
            userId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            planId,
            status: "active",
            ...subData,
            updatedAt: new Date().toISOString(),
          })
          if (subError) {
            console.error("Failed to create subscription record:", subError)
          }
        }

        if (couponId) {
          await admin.from("coupons").update({
            currentUses: admin.rpc("increment", { x: 1 }) as any,
          }).eq('"id"', couponId)
        }

        const { data: courses } = await admin
          .from("courses")
          .select('"id"')
          .eq('"isFree"', false)

        if (courses) {
          for (const course of courses) {
            const { data: existing } = await admin
              .from("enrollments")
              .select('"id"')
              .eq('"userId"', userId)
              .eq('"courseId"', course.id)
              .maybeSingle()

            if (!existing) {
              await admin.from("enrollments").insert({
                id: randomUUID(),
                userId,
                courseId: course.id,
                status: "IN_PROGRESS",
                progress: 0,
              })
            }
          }
        }

        if (affiliateId) {
          await admin.from("affiliate_referrals")
            .update({
              orderId: orderData.id,
              commission: (orderData.amount * 0.1),
            })
            .eq('"affiliateId"', affiliateId)
            .eq('"referredUserId"', userId)
        }

        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        if (!subscriptionId) break

        const { data: existingSub } = await admin
          .from("stripe_subscriptions")
          .select('"id"')
          .eq('"stripeSubscriptionId"', subscriptionId)
          .maybeSingle()

        if (existingSub) {
          await admin.from("stripe_subscriptions")
            .update({
              currentPeriodStart: new Date(invoice.period_start * 1000).toISOString(),
              currentPeriodEnd: new Date(invoice.period_end * 1000).toISOString(),
              status: "active",
              updatedAt: new Date().toISOString(),
            })
            .eq('"stripeSubscriptionId"', subscriptionId)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any
        const { data: existingSub } = await admin
          .from("stripe_subscriptions")
          .select('"id"')
          .eq('"stripeSubscriptionId"', subscription.id)
          .maybeSingle()

        if (existingSub) {
          await admin.from("stripe_subscriptions")
            .update({
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .eq('"stripeSubscriptionId"', subscription.id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any
        await admin.from("stripe_subscriptions")
          .update({
            status: "canceled",
            cancelAtPeriodEnd: false,
            updatedAt: new Date().toISOString(),
          })
          .eq('"stripeSubscriptionId"', deletedSub.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
