import { NextResponse } from "next/server";
import { confirmPaidStripeOrder, type StripePaidSession } from "../../../lib/paymentOrders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") || "";
  const stripeKey = process.env.STRIPE_SECRET_KEY || "";

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ ok: false, error: "Missing Stripe checkout session ID." }, { status: 400 });
  }

  if (!stripeKey) {
    return NextResponse.json({ ok: false, error: "Stripe is not configured." }, { status: 501 });
  }

  try {
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId), {
      method: "GET",
      headers: {
        Authorization: "Bearer " + stripeKey,
      },
      cache: "no-store",
    });

    const session = await stripeResponse.json();
    if (!stripeResponse.ok) throw new Error("Stripe session verification failed.");

    await confirmPaidStripeOrder(session as StripePaidSession);
    return NextResponse.json({ ok: true, orderId: session.metadata?.orderId || session.client_reference_id || null });
  } catch (error) {
    console.error("Could not confirm paid Stripe checkout", error);
    return NextResponse.json({ ok: false, error: "Could not confirm paid Stripe checkout." }, { status: 500 });
  }
}
