"use client";

import { onSnapshot, setDoc } from "firebase/firestore";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "./firebase";

export type OrderStatus = "new" | "preparing" | "ready" | "served";

export type KitchenOrderItem = {
  id?: number;
  name: string;
  quantity: number;
  description?: string;
  allergens?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
};

export type KitchenOrder = {
  id: number;
  table: number;
  time: string;
  status: OrderStatus;
  notes?: string;
  total: number;
  items: KitchenOrderItem[];
};

export const KITCHEN_ORDERS_STORAGE_KEY = "cafeKitchenOrders";
export const KITCHEN_ORDERS_CHANGED_EVENT = "cafeKitchenOrdersChanged";
export const CURRENT_CUSTOMER_ORDER_STORAGE_KEY = "cafeCurrentCustomerOrderId";

export const customerStatusText: Record<OrderStatus, string> = {
  new: "Order received",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served / Completed",
};

function emitKitchenOrdersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(KITCHEN_ORDERS_CHANGED_EVENT));
}

function writeKitchenOrdersLocally(orders: KitchenOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KITCHEN_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  emitKitchenOrdersChanged();
}

async function writeKitchenOrdersToFirebase(orders: KitchenOrder[]) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;

  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;

  try {
    await setDoc(stateDoc, { orders, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Could not sync kitchen orders to Firebase. Local storage still works.", error);
  }
}

export function readKitchenOrders(): KitchenOrder[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(KITCHEN_ORDERS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeKitchenOrders(orders: KitchenOrder[]) {
  writeKitchenOrdersLocally(orders);
  void writeKitchenOrdersToFirebase(orders);
}

export function prependKitchenOrder(order: KitchenOrder) {
  writeKitchenOrders([order, ...readKitchenOrders()]);
  window.localStorage.setItem(CURRENT_CUSTOMER_ORDER_STORAGE_KEY, String(order.id));
}

export function readCurrentCustomerOrderId() {
  if (typeof window === "undefined") return null;
  const saved = Number(window.localStorage.getItem(CURRENT_CUSTOMER_ORDER_STORAGE_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : null;
}

export function subscribeToKitchenOrders(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === KITCHEN_ORDERS_STORAGE_KEY || event.key === CURRENT_CUSTOMER_ORDER_STORAGE_KEY) callback();
  }

  let active = true;
  let unsubscribeFromFirebase: (() => void) | undefined;

  window.addEventListener(KITCHEN_ORDERS_CHANGED_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  const stateDoc = getFirebaseStateDoc();
  if (stateDoc) {
    void ensureFirebaseSignedIn().then((signedIn) => {
      if (!active || !signedIn) return;

      unsubscribeFromFirebase = onSnapshot(
        stateDoc,
        (snapshot) => {
          const cloudOrders = snapshot.data()?.orders;
          if (!Array.isArray(cloudOrders)) return;

          window.localStorage.setItem(KITCHEN_ORDERS_STORAGE_KEY, JSON.stringify(cloudOrders));
          callback();
        },
        (error) => {
          console.warn("Could not listen to Firebase kitchen orders. Local storage still works.", error);
        }
      );
    });
  }

  return () => {
    active = false;
    window.removeEventListener(KITCHEN_ORDERS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
    unsubscribeFromFirebase?.();
  };
}

export function findKitchenOrder(id: number) {
  return readKitchenOrders().find((order) => order.id === id) || null;
}
