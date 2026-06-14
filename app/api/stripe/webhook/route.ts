import { NextResponse } from "next/server";
import { confirmPaidStripeOrder, type StripePaidSession } from "../../../lib/paymentOrders";
import { stripeConfig } from "../../../lib/stripeConfig";
import { verifyStripeWebhookSignature } from "../../../lib/stripeWebhook";

export const runtime = "nodejs";

type StripeWebhookEvent = {
  type?: string;
  data?: {
    object?: StripePaidSession;
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const verified = verifyStripeWebhookSignature(payload, signature, stripeConfig.webhookSecret);
  if (!verified) {
    return NextResponse.json({ ok: false, error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(payload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid Stripe webhook payload." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" && event.data?.object) {
      await confirmPaidStripeOrder(event.data.object);
    }
  } catch (error) {
    console.error("Could not fulfil paid Stripe order", error);
    return NextResponse.json({ ok: false, error: "Could not fulfil paid Stripe order." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, received: true });
}
