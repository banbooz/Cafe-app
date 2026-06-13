"use client";

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { doc, getFirestore, type DocumentData, type DocumentReference } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredFirebaseValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = requiredFirebaseValues.every(
  (value) => typeof value === "string" && value.trim().length > 0
);

let anonymousSignInPromise: Promise<boolean> | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirebaseStateDoc(): DocumentReference<DocumentData> | null {
  const app = getFirebaseApp();
  if (!app) return null;

  const collectionName = process.env.NEXT_PUBLIC_FIREBASE_STATE_COLLECTION || "cafes";
  const cafeId = process.env.NEXT_PUBLIC_FIREBASE_CAFE_ID || "default-cafe";

  return doc(getFirestore(app), collectionName, cafeId);
}

export async function ensureFirebaseSignedIn() {
  const app = getFirebaseApp();
  if (!app) return false;

  const auth = getAuth(app);
  if (auth.currentUser) return true;

  if (!anonymousSignInPromise) {
    anonymousSignInPromise = signInAnonymously(auth)
      .then(() => true)
      .catch((error) => {
        console.warn("Firebase anonymous sign-in failed. Falling back to local browser storage.", error);
        return false;
      })
      .finally(() => {
        anonymousSignInPromise = null;
      });
  }

  return anonymousSignInPromise;
}
