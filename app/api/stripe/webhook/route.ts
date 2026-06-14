import { NextResponse } from "next/server";
import { stripeConfig } from "../../../lib/stripeConfig";
import { verifyStripeWebhookSignature } from "../../../lib/stripeWebhook";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  id?: string;
  payment_status?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
};

type StripeWebhookEvent = {
  type?: string;
  data?: {
    object?: StripeCheckoutSession;
  };
};

function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const paid = session.payment_status === "paid";
  const cafeId = session.metadata?.cafeId || "unknown-cafe";
  const orderId = session.metadata?.orderId || session.client_reference_id || "unknown-order";

  // Production next step:
  // After this verified webhook fires, write the paid order to the database from the server.
  // Then block direct customer writes in Firestore rules.
  console.info("Stripe checkout completed", { paid, cafeId, orderId, sessionId: session.id });
}

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

  if (event.type === "checkout.session.completed" && event.data?.object) {
    handleCheckoutCompleted(event.data.object);
  }

  return NextResponse.json({ ok: true, received: true });
}
