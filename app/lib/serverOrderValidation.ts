import { cafeConfig } from "./cafeConfig";
import { menuItems } from "./menu";
import type { KitchenOrder } from "./orders";

export type OrderRequestItem = {
  id?: number;
  quantity?: number;
};

export type OrderRequestBody = {
  items?: OrderRequestItem[];
  notes?: string;
};

const MAX_TOTAL_ITEMS = 30;
const MAX_ITEM_QTY = 10;
const MAX_NOTES = 180;

export function validateAndBuildOrder(body: OrderRequestBody): { ok: true; order: KitchenOrder } | { ok: false; error: string } {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: "Add at least one item before ordering." };
  }

  const quantities = new Map<number, number>();

  for (const requested of body.items) {
    const id = Number(requested.id);
    const quantity = Number(requested.quantity);
    const exists = menuItems.some((item) => item.id === id);

    if (!Number.isInteger(id) || !exists) {
      return { ok: false, error: "Unknown menu item." };
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QTY) {
      return { ok: false, error: "Invalid item quantity." };
    }

    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const totalQuantity = Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0);
  if (totalQuantity > MAX_TOTAL_ITEMS) {
    return { ok: false, error: "Too many items in one order." };
  }

  const items = Array.from(quantities.entries()).map(([id, quantity]) => {
    const menuItem = menuItems.find((item) => item.id === id)!;
    return {
      id: menuItem.id,
      name: menuItem.name,
      quantity,
      description: menuItem.description,
      allergens: menuItem.allergens,
      vegetarian: Boolean(menuItem.vegetarian),
      vegan: Boolean(menuItem.vegan),
    };
  });

  const total = items.reduce((sum, item) => {
    const menuItem = menuItems.find((entry) => entry.id === item.id)!;
    return sum + menuItem.price * item.quantity;
  }, 0);

  return {
    ok: true,
    order: {
      id: Date.now(),
      cafeId: cafeConfig.id,
      table: cafeConfig.tableNumber,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "new",
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, MAX_NOTES) : "",
      total: Number(total.toFixed(2)),
      items,
    },
  };
}
