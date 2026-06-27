"use client";

import { useCallback, useEffect, useState } from "react";
import { onSnapshot, setDoc } from "firebase/firestore";
import { cafeConfig, getCafeStorageKey } from "./cafeConfig";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "./firebase";

export const DEMO_EDITING_LOCK_STORAGE_KEY = getCafeStorageKey("demoEditingLocked");

function readLocalLock() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(DEMO_EDITING_LOCK_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeLocalLock(locked: boolean) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(DEMO_EDITING_LOCK_STORAGE_KEY, String(locked));
  window.dispatchEvent(new StorageEvent("storage", { key: DEMO_EDITING_LOCK_STORAGE_KEY }));
}

async function writeCloudLock(locked: boolean) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;

  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;

  await setDoc(
    stateDoc,
    {
      cafeId: cafeConfig.id,
      demoEditingLocked: locked,
      demoEditingLockedUpdatedAt: Date.now(),
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export function useDemoEditingLock() {
  const [locked, setLockedState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    function refresh(event?: StorageEvent) {
      if (!event || event.key === DEMO_EDITING_LOCK_STORAGE_KEY) setLockedState(readLocalLock());
    }

    setLockedState(readLocalLock());
    window.addEventListener("storage", refresh);

    const stateDoc = getFirebaseStateDoc();
    if (!stateDoc) {
      setLoading(false);
      return () => window.removeEventListener("storage", refresh);
    }

    void ensureFirebaseSignedIn().then((signedIn) => {
      if (!active) return;
      if (!signedIn) {
        setLoading(false);
        return;
      }

      unsubscribe = onSnapshot(
        stateDoc,
        (snapshot) => {
          if (!active) return;
          const data = snapshot.data();
          if (data?.cafeId && data.cafeId !== cafeConfig.id) {
            setLoading(false);
            return;
          }

          if (typeof data?.demoEditingLocked === "boolean") {
            writeLocalLock(data.demoEditingLocked);
            setLockedState(data.demoEditingLocked);
          }

          setLoading(false);
        },
        (snapshotError) => {
          console.warn("Could not listen to demo editing lock. Local storage still works.", snapshotError);
          if (!active) return;
          setError("Could not sync demo editing lock. Local browser state is being used.");
          setLoading(false);
        }
      );
    });

    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      unsubscribe?.();
    };
  }, []);

  const setLocked = useCallback(async (nextLocked: boolean) => {
    setError(null);
    setLockedState(nextLocked);
    writeLocalLock(nextLocked);

    try {
      await writeCloudLock(nextLocked);
    } catch (writeError) {
      console.warn("Could not save demo editing lock to Firebase. Local storage still works.", writeError);
      setError("Could not sync demo editing lock to Firebase. Local browser state was updated.");
    }
  }, []);

  return { locked, loading, error, setLocked };
}
