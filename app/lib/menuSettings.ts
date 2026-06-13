"use client";

import { useEffect, useState } from "react";
import { onSnapshot, setDoc } from "firebase/firestore";
import { menuItems, type MenuItem } from "./menu";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "./firebase";

export type MenuItemSetting = {
  name?: string;
  image?: string;
  description?: string;
  price?: number;
  allergens?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
};

export type MenuSettingsMap = Record<number, MenuItemSetting>;

export const MENU_SETTINGS_STORAGE_KEY = "cafeMenuItemSettings";

function defaults(): MenuSettingsMap {
  return Object.fromEntries(
    menuItems.map((item) => [
      item.id,
      {
        name: item.name,
        image: item.image,
        description: item.description,
        price: item.price,
        allergens: item.allergens,
        vegetarian: Boolean(item.vegetarian),
        vegan: Boolean(item.vegan),
      },
    ])
  ) as MenuSettingsMap;
}

export function cleanAllergenList(value: string) {
  const next = value.split(",").map((item) => item.trim()).filter(Boolean);
  return next.length ? next : ["None listed"];
}

function readMenuSettings() {
  if (typeof window === "undefined") return defaults();

  try {
    const saved = window.localStorage.getItem(MENU_SETTINGS_STORAGE_KEY);
    return { ...defaults(), ...(saved ? JSON.parse(saved) : {}) } as MenuSettingsMap;
  } catch {
    return defaults();
  }
}

function writeMenuSettingsLocally(settings: MenuSettingsMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MENU_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new StorageEvent("storage", { key: MENU_SETTINGS_STORAGE_KEY }));
}

async function writeMenuSettingsToFirebase(settings: MenuSettingsMap) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;

  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;

  try {
    await setDoc(stateDoc, { menuSettings: settings, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Could not sync menu settings to Firebase. Local storage still works.", error);
  }
}

export function applyMenuSettings<T extends MenuItem>(item: T, settings: MenuSettingsMap): T {
  const saved = settings[item.id];
  if (!saved) return item;

  return {
    ...item,
    name: saved.name ?? item.name,
    image: saved.image ?? item.image,
    description: saved.description ?? item.description,
    price: saved.price ?? item.price,
    allergens: saved.allergens ?? item.allergens,
    vegetarian: saved.vegetarian ?? Boolean(item.vegetarian),
    vegan: saved.vegan ?? Boolean(item.vegan),
  };
}

export function useMenuSettings() {
  const [settings, setSettings] = useState<MenuSettingsMap>(() => defaults());

  useEffect(() => {
    setSettings(readMenuSettings());

    function refresh(event?: StorageEvent) {
      if (!event || event.key === MENU_SETTINGS_STORAGE_KEY) setSettings(readMenuSettings());
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
            const cloudSettings = snapshot.data()?.menuSettings;
            if (!cloudSettings || Array.isArray(cloudSettings) || typeof cloudSettings !== "object") return;

            const next = { ...defaults(), ...cloudSettings } as MenuSettingsMap;
            writeMenuSettingsLocally(next);
            setSettings(next);
          },
          (error) => {
            console.warn("Could not listen to Firebase menu settings. Local storage still works.", error);
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

  function updateItemSettings(id: number, changes: MenuItemSetting) {
    setSettings((current) => {
      const next = {
        ...current,
        [id]: {
          ...current[id],
          ...changes,
        },
      };
      writeMenuSettingsLocally(next);
      void writeMenuSettingsToFirebase(next);
      return next;
    });
  }

  function resetMenuSettings() {
    const next = defaults();
    writeMenuSettingsLocally(next);
    void writeMenuSettingsToFirebase(next);
    setSettings(next);
  }

  return { settings, updateItemSettings, resetMenuSettings };
}
