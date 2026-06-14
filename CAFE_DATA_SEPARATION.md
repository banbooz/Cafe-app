# Cafe data separation

The demo app now keeps each cafe separate by using one configured cafe ID for the deployed app.

## Current demo cafe

- Cafe name: The Corner Cafe
- Cafe ID: corner-cafe-demo
- Firestore path: cafes/corner-cafe-demo

Orders, menu edits, availability toggles and business analytics are saved under that cafe only.

## Why this matters

A real QR ordering app must stop one cafe from seeing another cafe's orders or menu settings.

The safest rule is: do not trust a cafe ID typed into the browser URL. The deployed app should get the cafe ID from trusted configuration.

## How to make another demo cafe later

Create another Vercel deployment/project and set a different cafe ID and cafe name in that deployment's environment variables.

Example values:

- Cafe ID: another-cafe-demo
- Cafe name: Another Cafe
- Table number: 3

That second deployment will use a different Firestore document, so its orders and menu edits stay separate from the current demo.

## Still needed for the real paid app

For a production version, this should later be upgraded with real staff login and role checks:

- Customers should only create and view their own order.
- Kitchen staff should only see orders for their cafe.
- Owners should only edit settings for their cafe.
- Developers should only access cafe data when strictly needed for support.
