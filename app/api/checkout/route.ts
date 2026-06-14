import { NextResponse } from "next/server";
import { cafeConfig } from "../../lib/cafeConfig";
import { menuItems } from "../../lib/menu";
import type { KitchenOrder } from "../../lib/orders";
import { attachStripeSessionToPendingOrder, isProductionPaymentStoreConfigured, savePendingStripeOrder } from "../../lib/paymentOrders";
import { isStripeServerConfigured, stripeConfig } from "../../lib/stripeConfig";
import { validateAndBuildOrder, type OrderRequestBody } from "../../lib/serverOrderValidation";

function getAppUrl() {
  const raw = stripeConfig.appUrl || "";
  if (!raw) return "";
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw.replace(/\/$/, "")}`;
}

function appendLineItems(form: URLSearchParams, order: KitchenOrder) {
  order.items.forEach((item, index) => {
    const menuItem = menuItems.find((entry) => entry.id === item.id)!;
    form.append(`line_items[${index}][quantity]`, String(item.quantity));
    form.append(`line_items[${index}][price_data][currency]`, "gbp");
    form.append(`line_items[${index}][price_data][unit_amount]`, String(Math.round(menuItem.price * 100)));
    form.append(`line_items[${index}][price_data][product_data][name]`, menuItem.name);
    form.append(`line_items[${index}][price_data][product_data][description]`, menuItem.description);
  });
}

export async function POST(request: Request) {
  let body: OrderRequestBody = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid checkout request." }, { status: 400 });
  }

  const result = validateAndBuildOrder(body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  if (!isStripeServerConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe checkout is not configured yet." }, { status: 501 });
  }

  if (!isProductionPaymentStoreConfigured()) {
    return NextResponse.json({ ok: false, error: "Firebase Admin payment store is not configured yet." }, { status: 501 });
  }

  await savePendingStripeOrder(result.order);

  const appUrl = getAppUrl();
  const form = new URLSearchParams();
  form.append("mode", "payment");
  form.append("success_url", `${appUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  form.append("cancel_url", `${appUrl}/?payment=cancelled`);
  form.append("client_reference_id", String(result.order.id));
  form.append("metadata[cafeId]", cafeConfig.id);
  form.append("metadata[table]", String(cafeConfig.tableNumber));
  form.append("metadata[orderId]", String(result.order.id));
  form.append("metadata[orderTotal]", String(result.order.total));
  appendLineItems(form, result.order);

  const headers = new Headers();
  headers.set("Authorization", "Bearer " + stripeConfig.secretKey);
  headers.set("Content-Type", "application/x-www-form-urlencoded");

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers,
    body: form,
  });

  const session = await stripeResponse.json();
  if (!stripeResponse.ok || !session?.url) {
    return NextResponse.json({ ok: false, error: "Could not create Stripe checkout session." }, { status: 502 });
  }

  if (session.id) {
    await attachStripeSessionToPendingOrder(result.order.id, session.id);
  }

  return NextResponse.json({ ok: true, checkoutUrl: session.url, orderId: result.order.id });
}
