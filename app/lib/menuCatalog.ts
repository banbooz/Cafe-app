"use client";

import { useEffect, useMemo, useState } from "react";
import { onSnapshot, setDoc } from "firebase/firestore";
import { cafeConfig, getCafeStorageKey } from "./cafeConfig";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "./firebase";
import { allMenuItems, menuItems, productCategories, type MenuItem } from "./menu";
import { applyMenuSettings, type MenuSettingsMap } from "./menuSettings";

const STAFF_ITEMS_KEY = getCafeStorageKey("cafeStaffMenuItems");
const HIDDEN_ITEMS_KEY = getCafeStorageKey("cafeHiddenMenuItems");
const STAFF_ID_START = 10000;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

export type NewMenuProduct = {
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  prep: string;
  allergens: string[];
  popular: boolean;
  vegetarian: boolean;
  vegan: boolean;
};

type CatalogueState = {
  staffItems: MenuItem[];
  hiddenIds: number[];
};

function safeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeMoney(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? Number(next.toFixed(2)) : 0;
}

function safeCategory(value: unknown) {
  return productCategories.includes(value as never) ? String(value) : "Main";
}

function safeList(value: unknown) {
  if (!Array.isArray(value)) return ["None listed"];
  const next = value.map((entry) => String(entry).trim()).filter(Boolean);
  return next.length ? next : ["None listed"];
}

function normaliseStaffItem(value: unknown): MenuItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<MenuItem>;
  const id = Number(raw.id);
  if (!Number.isInteger(id) || id < STAFF_ID_START) return null;

  return {
    id,
    name: safeText(raw.name, "New product"),
    category: safeCategory(raw.category),
    description: safeText(raw.description, "New menu item"),
    price: safeMoney(raw.price),
    image: safeText(raw.image, FALLBACK_IMAGE),
    prep: safeText(raw.prep, "5 min"),
    allergens: safeList(raw.allergens),
    popular: raw.popular === true,
    vegetarian: raw.vegetarian === true,
    vegan: raw.vegan === true,
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

function readCatalogue(): CatalogueState {
  return {
    staffItems: readJson<unknown[]>(STAFF_ITEMS_KEY, []).map(normaliseStaffItem).filter((item): item is MenuItem => Boolean(item)),
    hiddenIds: readJson<unknown[]>(HIDDEN_ITEMS_KEY, []).map(Number).filter((id) => Number.isInteger(id)),
  };
}

function writeCatalogueLocal(state: CatalogueState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_ITEMS_KEY, JSON.stringify(state.staffItems));
  window.localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify(state.hiddenIds));
  window.dispatchEvent(new StorageEvent("storage", { key: STAFF_ITEMS_KEY }));
}

async function writeCatalogueCloud(state: CatalogueState) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;
  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;

  try {
    await setDoc(stateDoc, { cafeId: cafeConfig.id, staffMenuItems: state.staffItems, hiddenMenuItemIds: state.hiddenIds, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Could not sync staff menu items. Local storage still works.", error);
  }
}

function saveCatalogue(state: CatalogueState) {
  writeCatalogueLocal(state);
  void writeCatalogueCloud(state);
}

function nextStaffId(staffItems: MenuItem[]) {
  return Math.max(STAFF_ID_START - 1, ...allMenuItems.map((item) => item.id), ...staffItems.map((item) => item.id)) + 1;
}

export function blankNewMenuProduct(): NewMenuProduct {
  return {
    name: "",
    category: "Main",
    price: 0,
    image: FALLBACK_IMAGE,
    description: "",
    prep: "5 min",
    allergens: ["None listed"],
    popular: false,
    vegetarian: false,
    vegan: false,
  };
}

export function buildMenuCatalogue(settings: MenuSettingsMap, staffItems: MenuItem[], hiddenIds: number[]) {
  const hidden = new Set(hiddenIds);
  return [...menuItems, ...staffItems].filter((item) => !hidden.has(item.id)).map((item) => applyMenuSettings(item, settings));
}

export function useMenuCatalogue(settings: MenuSettingsMap) {
  const [catalogue, setCatalogue] = useState<CatalogueState>(() => ({ staffItems: [], hiddenIds: [] }));

  useEffect(() => {
    setCatalogue(readCatalogue());

    function refresh(event?: StorageEvent) {
      if (!event || event.key === STAFF_ITEMS_KEY || event.key === HIDDEN_ITEMS_KEY) setCatalogue(readCatalogue());
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;
    window.addEventListener("storage", refresh);

    const stateDoc = getFirebaseStateDoc();
    if (stateDoc) {
      void ensureFirebaseSignedIn().then((signedIn) => {
        if (!active || !signedIn) return;
        unsubscribe = onSnapshot(stateDoc, (snapshot) => {
          const data = snapshot.data();
          if (data?.cafeId && data.cafeId !== cafeConfig.id) return;

          const next = {
            staffItems: Array.isArray(data?.staffMenuItems) ? data.staffMenuItems.map(normaliseStaffItem).filter((item): item is MenuItem => Boolean(item)) : readCatalogue().staffItems,
            hiddenIds: Array.isArray(data?.hiddenMenuItemIds) ? data.hiddenMenuItemIds.map(Number).filter((id: number) => Number.isInteger(id)) : readCatalogue().hiddenIds,
          };
          writeCatalogueLocal(next);
          setCatalogue(next);
        });
      });
    }

    return () => {
      active = false;
      window.removeEventListener("storage", refresh);
      unsubscribe?.();
    };
  }, []);

  const visibleItems = useMemo(() => buildMenuCatalogue(settings, catalogue.staffItems, catalogue.hiddenIds), [settings, catalogue]);

  function addStaffProduct(product: NewMenuProduct) {
    const id = nextStaffId(catalogue.staffItems);
    const item: MenuItem = {
      id,
      name: safeText(product.name, "New product"),
      category: safeCategory(product.category),
      description: safeText(product.description, "New menu item"),
      price: safeMoney(product.price),
      image: safeText(product.image, FALLBACK_IMAGE),
      prep: safeText(product.prep, "5 min"),
      allergens: safeList(product.allergens),
      popular: product.popular,
      vegetarian: product.vegetarian,
      vegan: product.vegan,
    };

    setCatalogue((current) => {
      const next = { staffItems: [...current.staffItems, item], hiddenIds: current.hiddenIds.filter((entry) => entry !== id) };
      saveCatalogue(next);
      return next;
    });

    return id;
  }

  function hideStaffProduct(id: number) {
    setCatalogue((current) => {
      const next = { ...current, hiddenIds: Array.from(new Set([...current.hiddenIds, id])) };
      saveCatalogue(next);
      return next;
    });
  }

  return { staffItems: catalogue.staffItems, hiddenIds: catalogue.hiddenIds, visibleItems, addStaffProduct, hideStaffProduct };
}
