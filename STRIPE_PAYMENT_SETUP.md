# Stripe payment verification setup

The app now has a Stripe payment verification scaffold.

## What has been added

- Server-side order validation is shared by the normal order route and the Stripe checkout route.
- The checkout route creates a Stripe Checkout Session from trusted server-calculated prices.
- The webhook route verifies Stripe webhook signatures before trusting payment events.
- The current demo order flow stays active until Stripe checkout is switched on.

## Vercel values needed later

Add these in Vercel Project Settings > Environment Variables when you are ready to test real Stripe payments:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED

Set `NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED` to `true` only when the Stripe keys and webhook are ready.

## Stripe webhook endpoint

Use this endpoint in the Stripe dashboard:

`/api/stripe/webhook`

The full URL will be your app domain plus that path.

## Important production note

The webhook currently verifies the payment event and logs the paid checkout session.

Before using real cafes and real payments, the next upgrade should make the webhook write the paid order to the database from the server. After that, Firestore rules should block customers from directly writing orders.

That is the proper production pattern:

1. Customer creates checkout.
2. Stripe takes payment.
3. Stripe calls verified webhook.
4. Server writes paid order to database.
5. Kitchen only sees paid, verified orders.
