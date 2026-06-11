"use client";

import { useEffect, useState } from "react";
import { menuItems, type MenuItem } from "./menu";

export type MenuItemSetting = {
  description?: string;
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
        description: item.description,
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

export function applyMenuSettings<T extends MenuItem>(item: T, settings: MenuSettingsMap): T {
  const saved = settings[item.id];
  if (!saved) return item;

  return {
    ...item,
    description: saved.description ?? item.description,
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

    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
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
      window.localStorage.setItem(MENU_SETTINGS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key: MENU_SETTINGS_STORAGE_KEY }));
      return next;
    });
  }

  function resetMenuSettings() {
    const next = defaults();
    window.localStorage.setItem(MENU_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent("storage", { key: MENU_SETTINGS_STORAGE_KEY }));
    setSettings(next);
  }

  return { settings, updateItemSettings, resetMenuSettings };
}
