import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "";
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");

export function isFirebaseAdminConfigured() {
  return Boolean(projectId && clientEmail && privateKey);
}

export function getFirebaseAdminDb() {
  if (!isFirebaseAdminConfigured()) return null;

  const app = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return getFirestore(app);
}
