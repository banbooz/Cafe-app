# Stripe production payment setup

The app now has a production-style Stripe payment flow.

## What has been added

- Server-side order validation is shared by normal demo orders and Stripe checkout.
- The checkout route calculates prices on the server and creates a Stripe Checkout Session.
- The checkout route saves a pending order to Firebase from the server before redirecting to Stripe.
- The webhook route verifies the Stripe webhook signature before trusting the event.
- After Stripe confirms payment, the webhook moves the pending order into the live kitchen orders list.
- If webhook fulfilment fails, the webhook returns an error so Stripe can retry.

## Vercel values needed

Add these in Vercel Project Settings > Environment Variables before switching Stripe checkout on:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY

Keep `NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED` set to `false` until the Stripe keys, Firebase Admin values and webhook endpoint are ready.

When everything is ready, set:

`NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED=true`

## Stripe webhook endpoint

Use this endpoint in the Stripe dashboard:

`/api/stripe/webhook`

The full URL will be your app domain plus that path.

## Firebase Admin setup

Create a Firebase service account key from Firebase Project Settings > Service accounts.

Put these values into Vercel as sensitive environment variables:

- project_id -> FIREBASE_ADMIN_PROJECT_ID
- client_email -> FIREBASE_ADMIN_CLIENT_EMAIL
- private_key -> FIREBASE_ADMIN_PRIVATE_KEY

Do not commit the service account JSON file to GitHub.

## Production order flow

1. Customer clicks send order.
2. App sends item IDs and quantities to `/api/checkout`.
3. Server validates the order and recalculates the total.
4. Server saves the order as pending in Firebase.
5. Server creates a Stripe Checkout Session.
6. Customer pays on Stripe.
7. Stripe calls `/api/stripe/webhook`.
8. Webhook verifies the Stripe signature.
9. Webhook checks payment is paid and the amount matches the server order total.
10. Webhook moves the order from `pendingOrders` to `orders`.
11. Kitchen receives only verified paid orders.

## Firestore rules

The file `firestore.production.rules` is the target production rule set for payment-protected orders. Do not deploy it yet unless you understand the impact, because it blocks direct browser writes and can break the current demo controls until staff login/roles are finished.
