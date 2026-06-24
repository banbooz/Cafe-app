import { NextResponse } from "next/server";
import { checkRateLimit } from "../../lib/rateLimit";
import { validateAndBuildOrder, type OrderRequestBody } from "../../lib/serverOrderValidation";

function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "Too many order attempts. Try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export async function POST(request: Request) {
  const limit = checkRateLimit(request, { keyPrefix: "orders:create", maxRequests: 20, windowMs: 60_000 });
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  let body: OrderRequestBody = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid order request." }, { status: 400 });
  }

  const result = await validateAndBuildOrder(body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
