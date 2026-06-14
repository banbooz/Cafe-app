export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "",
  checkoutEnabled: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED === "true",
};

export function isStripeServerConfigured() {
  return Boolean(stripeConfig.secretKey && stripeConfig.appUrl);
}

export function isStripeWebhookConfigured() {
  return Boolean(stripeConfig.webhookSecret);
}
