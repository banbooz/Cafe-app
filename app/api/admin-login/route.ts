import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Admin PIN is not configured. Add ADMIN_PIN in the deployment environment variables.",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({})) as { pin?: unknown };
  const submittedPin = typeof body.pin === "string" ? body.pin : "";

  if (submittedPin !== adminPin) {
    return NextResponse.json(
      { ok: false, configured: true, message: "Incorrect admin PIN." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, configured: true });
}
