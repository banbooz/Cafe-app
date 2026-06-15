"use client";

import { useEffect, useState } from "react";
import { onSnapshot, setDoc } from "firebase/firestore";
import { allMenuItems } from "./menu";
import { cafeConfig, getCafeStorageKey } from "./cafeConfig";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "./firebase";

export type AvailabilityMap = Record<number, boolean>;

export const AVAILABILITY_STORAGE_KEY = getCafeStorageKey("cafeItemAvailability");

export function isItemAvailable(id: number, availability: AvailabilityMap) {
  return availability[id] !== false;
}

function defaultAvailability() {
  return Object.fromEntries(allMenuItems.map((item) => [item.id, true])) as AvailabilityMap;
}

function readAvailability() {
  if (typeof window === "undefined") return defaultAvailability();

  try {
    const saved = window.localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    return { ...defaultAvailability(), ...(saved ? JSON.parse(saved) : {}) } as AvailabilityMap;
  } catch {
    return defaultAvailability();
  }
}

function writeAvailabilityLocally(availability: AvailabilityMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(availability));
  window.dispatchEvent(new StorageEvent("storage", { key: AVAILABILITY_STORAGE_KEY }));
}

async function writeAvailabilityToFirebase(availability: AvailabilityMap) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;

  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;

  try {
    await setDoc(stateDoc, { cafeId: cafeConfig.id, availability, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Could not sync menu availability to Firebase. Local storage still works.", error);
  }
}

export function useMenuAvailability() {
  const [availability, setAvailability] = useState<AvailabilityMap>(() => defaultAvailability());

  useEffect(() => {
    setAvailability(readAvailability());

    function refresh(event?: StorageEvent) {
      if (!event || event.key === AVAILABILITY_STORAGE_KEY) setAvailability(readAvailability());
    }

    let active = true;
    let unsubscribeFromFirebase: (() => void) | undefined;

    window.addEventListener("storage", refresh);

    const stateDoc = getFirebaseStateDoc();
    if (stateDoc) {
      void ensureFirebaseSignedIn().then((signedIn) => {
        if (!active || !signedIn) return;

        unsubscribeFromFirebase = onSnapshot(
          stateDoc,
          (snapshot) => {
            const data = snapshot.data();
            if (data?.cafeId && data.cafeId !== cafeConfig.id) return;

            const cloudAvailability = data?.availability;
            if (!cloudAvailability || Array.isArray(cloudAvailability) || typeof cloudAvailability !== "object") return;

            const next = { ...defaultAvailability(), ...cloudAvailability } as AvailabilityMap;
            writeAvailabilityLocally(next);
            setAvailability(next);
          },
          (error) => {
            console.warn("Could not listen to Firebase menu availability. Local storage still works.", error);
          }
        );
      });
    }

    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      unsubscribeFromFirebase?.();
    };
  }, []);

  function setItemAvailability(id: number, available: boolean) {
    setAvailability((current) => {
      const next = { ...current, [id]: available };
      writeAvailabilityLocally(next);
      void writeAvailabilityToFirebase(next);
      return next;
    });
  }

  function resetAvailability() {
    const next = defaultAvailability();
    writeAvailabilityLocally(next);
    void writeAvailabilityToFirebase(next);
    setAvailability(next);
  }

  return { availability, setItemAvailability, resetAvailability };
}
