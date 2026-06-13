# Firebase + Vercel setup for Cafe App

This app is now coded to use Firebase Firestore as the live shared database, while still falling back to browser localStorage if Firebase is not configured yet.

## What is now synced

- Customer orders
- Kitchen order status updates
- Menu item availability toggles
- Menu edits: name, image, description, price, allergens, V/VG badges
- Business dashboard order analytics

## 1. Firebase setup

1. Go to the Firebase console.
2. Create a Firebase project.
3. Add a Web app.
4. Copy the Firebase config values.
5. Enable **Authentication -> Sign-in method -> Anonymous**.
6. Enable **Firestore Database**.
7. Start Firestore in production mode.
8. Add the rules from `firestore.rules`.

## 2. Vercel environment variables

In Vercel:

1. Open the Cafe App project.
2. Go to **Settings -> Environment Variables**.
3. Add these variables for Production, Preview and Development:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_STATE_COLLECTION=cafes
NEXT_PUBLIC_FIREBASE_CAFE_ID=corner-cafe-demo
```

Use the values from Firebase for the first six. Keep `NEXT_PUBLIC_FIREBASE_STATE_COLLECTION=cafes`. Change `NEXT_PUBLIC_FIREBASE_CAFE_ID` for each real cafe so each cafe gets its own data document.

## 3. Redeploy on Vercel

After adding the environment variables, redeploy the latest commit from `main`.

If the app is already connected to GitHub in Vercel, Vercel should deploy automatically when `main` changes. If not, import the GitHub repo in Vercel and select the Next.js preset.

## 4. Quick test

1. Open the customer app on one device.
2. Open `/kitchen` on another device or browser.
3. Place an order from the customer app.
4. Check that the order appears in the kitchen app.
5. Change an order status in the kitchen app.
6. Check that the customer order status updates.
7. Toggle an item off in the kitchen/business controls.
8. Check that it becomes unavailable on the customer menu.

## 5. Important security note

The included `firestore.rules` are starter rules for getting the Firebase connection working. They require users to be signed in anonymously, which is better than totally open public writes, but it is not the final security model for a real cafe.

Before taking real customer payments/orders, upgrade to proper staff/customer roles:

- Customers can create their own orders only.
- Customers can only read their own order status.
- Kitchen/admin staff can read and update orders for their cafe.
- Menu settings can only be edited by authorised staff.
- Payments should be verified server-side before orders are accepted.

## 6. If Firebase is not configured

The app will still run using localStorage, but orders and menu edits will only stay on that same browser/device. That is useful for demos, but not enough for a real cafe.
