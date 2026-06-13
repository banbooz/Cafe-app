"use client";

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

export const customerStatusText: Record<OrderStatus, string> = {
  new: "Order received",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served / Completed",
};

export function readKitchenOrders(): KitchenOrder[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(KITCHEN_ORDERS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeKitchenOrders(orders: KitchenOrder[]) {
  window.localStorage.setItem(KITCHEN_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(KITCHEN_ORDERS_CHANGED_EVENT));
}

export function subscribeToKitchenOrders(callback: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === KITCHEN_ORDERS_STORAGE_KEY) callback();
  }

  window.addEventListener(KITCHEN_ORDERS_CHANGED_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(KITCHEN_ORDERS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function findKitchenOrder(id: number) {
  return readKitchenOrders().find((order) => order.id === id) || null;
}
