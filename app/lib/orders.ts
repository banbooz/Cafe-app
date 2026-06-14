"use client";

import { onSnapshot, setDoc } from "firebase/firestore";
import { getCafeStorageKey, cafeConfig } from "./cafeConfig";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "./firebase";

export type OrderStatus = "new" | "preparing" | "ready" | "served";
export type PaymentStatus = "demo" | "pending" | "paid" | "failed";

export type KitchenOrderItem = {
  id?: number;
  name: string;
  quantity: number;
  unitPrice?: number;
  description?: string;
  allergens?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
};

export type KitchenOrderPayment = {
  provider: "demo" | "stripe";
  status: PaymentStatus;
  checkoutSessionId?: string;
  paidAt?: number;
  amountPaid?: number;
};

export type KitchenOrder = {
  id: number;
  cafeId: string;
  table: number;
  time: string;
  status: OrderStatus;
  notes?: string;
  subtotal?: number;
  tipPercentage?: number;
  tipAmount?: number;
  total: number;
  items: KitchenOrderItem[];
  payment?: KitchenOrderPayment;
};

const BASE_KITCHEN_ORDERS_STORAGE_KEY = "cafeKitchenOrders";
const BASE_CURRENT_CUSTOMER_ORDER_STORAGE_KEY = "cafeCurrentCustomerOrderId";

export const KITCHEN_ORDERS_STORAGE_KEY = getCafeStorageKey(BASE_KITCHEN_ORDERS_STORAGE_KEY);
export const KITCHEN_ORDERS_CHANGED_EVENT = "cafeKitchenOrdersChanged";
export const CURRENT_CUSTOMER_ORDER_STORAGE_KEY = getCafeStorageKey(BASE_CURRENT_CUSTOMER_ORDER_STORAGE_KEY);

export const customerStatusText: Record<OrderStatus, string> = {
  new: "Order received",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served / Completed",
};

function normaliseOrders(value: unknown): KitchenOrder[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((order): order is KitchenOrder => Boolean(order && typeof order === "object" && "id" in order))
    .map((order) => ({ ...order, cafeId: order.cafeId || cafeConfig.id }))
    .filter((order) => order.cafeId === cafeConfig.id);
}

function emitKitchenOrdersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(KITCHEN_ORDERS_CHANGED_EVENT));
}

function writeKitchenOrdersLocally(orders: KitchenOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KITCHEN_ORDERS_STORAGE_KEY, JSON.stringify(normaliseOrders(orders)));
  emitKitchenOrdersChanged();
}

async function writeKitchenOrdersToFirebase(orders: KitchenOrder[]) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;

  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;

  try {
    await setDoc(stateDoc, { cafeId: cafeConfig.id, orders: normaliseOrders(orders), updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Could not sync kitchen orders to Firebase. Local storage still works.", error);
  }
}

export function readKitchenOrders(): KitchenOrder[] {
  if (typeof window === "undefined") return [];

  try {
    return normaliseOrders(JSON.parse(window.localStorage.getItem(KITCHEN_ORDERS_STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function writeKitchenOrders(orders: KitchenOrder[]) {
  writeKitchenOrdersLocally(orders);
  void writeKitchenOrdersToFirebase(orders);
}

export function prependKitchenOrder(order: KitchenOrder) {
  writeKitchenOrders([{ ...order, cafeId: cafeConfig.id, payment: order.payment || { provider: "demo", status: "demo" } }, ...readKitchenOrders()]);
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
          const data = snapshot.data();
          if (data?.cafeId && data.cafeId !== cafeConfig.id) return;

          const cloudOrders = normaliseOrders(data?.orders);
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
  return readKitchenOrders().find((order) => order.id === id && order.cafeId === cafeConfig.id) || null;
}
