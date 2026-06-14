import { createHmac, timingSafeEqual } from "crypto";

type StripeSignatureParts = {
  timestamp: string;
  signatures: string[];
};

function parseStripeSignature(header: string): StripeSignatureParts | null {
  const parts = header.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2) || "";
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) return null;
  return { timestamp, signatures };
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null, webhookSecret: string) {
  if (!signatureHeader || !webhookSecret) return false;

  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed) return false;

  const signedPayload = `${parsed.timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");

  return parsed.signatures.some((signature) => safeCompare(signature, expectedSignature));
}
