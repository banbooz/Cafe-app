import { NextResponse } from "next/server";
import { validateAndBuildOrder, type OrderRequestBody } from "../../lib/serverOrderValidation";

export async function POST(request: Request) {
  let body: OrderRequestBody = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid order request." }, { status: 400 });
  }

  const result = validateAndBuildOrder(body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
