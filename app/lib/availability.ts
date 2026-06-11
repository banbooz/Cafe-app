"use client";

import { useEffect, useState } from "react";
import { menuItems } from "./menu";

export type AvailabilityMap = Record<number, boolean>;

export const AVAILABILITY_STORAGE_KEY = "cafeItemAvailability";

export function isItemAvailable(id: number, availability: AvailabilityMap) {
  return availability[id] !== false;
}

function defaultAvailability() {
  return Object.fromEntries(menuItems.map((item) => [item.id, true])) as AvailabilityMap;
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

export function useMenuAvailability() {
  const [availability, setAvailability] = useState<AvailabilityMap>(() => defaultAvailability());

  useEffect(() => {
    setAvailability(readAvailability());

    function refresh(event?: StorageEvent) {
      if (!event || event.key === AVAILABILITY_STORAGE_KEY) setAvailability(readAvailability());
    }

    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function setItemAvailability(id: number, available: boolean) {
    setAvailability((current) => {
      const next = { ...current, [id]: available };
      window.localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key: AVAILABILITY_STORAGE_KEY }));
      return next;
    });
  }

  function resetAvailability() {
    const next = defaultAvailability();
    window.localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent("storage", { key: AVAILABILITY_STORAGE_KEY }));
    setAvailability(next);
  }

  return { availability, setItemAvailability, resetAvailability };
}
