import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import express from "express";
import { getOrderById, updateOrderStatus, updateOrderStripeIds } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as any,
});

/* ─── Create Checkout Session ─── */
export async function createCheckoutSession(opts: {
  orderId: number;
  userId: number;
  userEmail: string;
  userName: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  currency: string;
  origin: string;
}) {
  const currency = (opts.currency || "usd").toLowerCase();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    opts.items.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: opts.userEmail,
    client_reference_id: opts.userId.toString(),
    allow_promotion_codes: true,
    metadata: {
      order_id: opts.orderId.toString(),
      user_id: opts.userId.toString(),
      customer_email: opts.userEmail,
      customer_name: opts.userName,
    },
    success_url: `${opts.origin}/orders/${opts.orderId}?payment=success`,
    cancel_url: `${opts.origin}/orders/${opts.orderId}?payment=cancelled`,
  });

  // Save session ID to order
  await updateOrderStripeIds(opts.orderId, session.id);

  return { url: session.url, sessionId: session.id };
}

/* ─── Webhook Handler ─── */
async function handleWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(
      "[Stripe Webhook] Signature verification failed:",
      err.message
    );
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Test event verification
  if (event.id.startsWith("evt_test_")) {
    console.log(
      "[Webhook] Test event detected, returning verification response"
    );
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = Number(session.metadata?.order_id);
      if (orderId) {
        await updateOrderStatus(orderId, "paid");
        await updateOrderStripeIds(
          orderId,
          session.id,
          session.payment_intent as string
        );
        console.log(`[Stripe] Order #${orderId} marked as paid`);
      }
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe] PaymentIntent ${pi.id} succeeded`);
      break;
    }
    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

/* ─── Register Webhook Route ─── */
export function registerStripeWebhook(app: Express) {
  // Must use raw body for signature verification - registered BEFORE json parser
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleWebhook
  );
}
