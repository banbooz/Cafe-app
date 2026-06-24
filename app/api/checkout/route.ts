import { NextResponse } from "next/server";
import { cafeConfig } from "../../lib/cafeConfig";
import type { KitchenOrder } from "../../lib/orders";
import { attachStripeSessionToPendingOrder, isProductionPaymentStoreConfigured, savePendingStripeOrder } from "../../lib/paymentOrders";
import { checkRateLimit } from "../../lib/rateLimit";
import { isStripeServerConfigured, stripeConfig } from "../../lib/stripeConfig";
import { validateAndBuildOrder, type OrderRequestBody } from "../../lib/serverOrderValidation";

function getAppUrl() {
  const raw = stripeConfig.appUrl || "";
  if (!raw) return "";
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw.replace(/\/$/, "")}`;
}

function moneyValue(value: number | undefined) {
  return Number(value || 0).toFixed(2);
}

function orderItemSummary(order: KitchenOrder) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ").slice(0, 480);
}

function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "Too many checkout attempts. Try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

function appendOrderMetadata(form: URLSearchParams, prefix: "metadata" | "payment_intent_data[metadata]", order: KitchenOrder) {
  const metadata = {
    cafeId: cafeConfig.id,
    cafeName: cafeConfig.name,
    table: String(order.table),
    orderId: String(order.id),
    orderType: order.orderType || "restaurant",
    orderItems: orderItemSummary(order),
    orderSubtotal: moneyValue(order.subtotal || order.total),
    tipPercentage: String(order.tipPercentage || 0),
    tipAmount: moneyValue(order.tipAmount),
    orderTotal: moneyValue(order.total),
  };

  Object.entries(metadata).forEach(([key, value]) => form.append(`${prefix}[${key}]`, value));
}

function appendLineItems(form: URLSearchParams, order: KitchenOrder) {
  order.items.forEach((item, index) => {
    form.append(`line_items[${index}][quantity]`, String(item.quantity));
    form.append(`line_items[${index}][price_data][currency]`, "gbp");
    form.append(`line_items[${index}][price_data][unit_amount]`, String(Math.round(Number(item.unitPrice || 0) * 100)));
    form.append(`line_items[${index}][price_data][product_data][name]`, item.name);
    if (item.description) form.append(`line_items[${index}][price_data][product_data][description]`, item.description);
  });

  if (order.tipAmount && order.tipAmount > 0) {
    const tipIndex = order.items.length;
    form.append(`line_items[${tipIndex}][quantity]`, "1");
    form.append(`line_items[${tipIndex}][price_data][currency]`, "gbp");
    form.append(`line_items[${tipIndex}][price_data][unit_amount]`, String(Math.round(order.tipAmount * 100)));
    form.append(`line_items[${tipIndex}][price_data][product_data][name]`, `Tip ${order.tipPercentage || 0}%`);
    form.append(`line_items[${tipIndex}][price_data][product_data][description]`, "Optional customer tip");
  }
}

export async function POST(request: Request) {
  const limit = checkRateLimit(request, { keyPrefix: "checkout:create", maxRequests: 8, windowMs: 60_000 });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  let body: OrderRequestBody = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid checkout request." }, { status: 400 });
  }

  const result = await validateAndBuildOrder(body);
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
  form.append("customer_creation", "always");
  form.append("success_url", `${appUrl}/?payment=success&order_id=${result.order.id}&session_id={CHECKOUT_SESSION_ID}`);
  form.append("cancel_url", `${appUrl}/?payment=cancelled&order_id=${result.order.id}`);
  form.append("client_reference_id", String(result.order.id));
  form.append("payment_intent_data[description]", `${cafeConfig.name} table ${result.order.table} order #${result.order.id}`);
  appendOrderMetadata(form, "metadata", result.order);
  appendOrderMetadata(form, "payment_intent_data[metadata]", result.order);
  appendLineItems(form, result.order);

  const headers = new Headers();
  headers.set("Authorization", ["Bearer", stripeConfig.secretKey].join(" "));
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
