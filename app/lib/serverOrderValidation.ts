import { cafeConfig } from "./cafeConfig";
import { menuItems, productCategories, type MenuItem } from "./menu";
import type { KitchenOrder } from "./orders";

export type OrderRequestItemSnapshot = Partial<MenuItem>;

export type OrderRequestItem = {
  id?: number;
  quantity?: number;
  item?: OrderRequestItemSnapshot;
};

export type OrderRequestBody = {
  items?: OrderRequestItem[];
  notes?: string;
  table?: number;
  tipPercentage?: number;
};

const MAX_TOTAL_ITEMS = 30;
const MAX_ITEM_QTY = 10;
const MAX_NOTES = 180;
const MIN_TABLE_NUMBER = 1;
const MAX_TABLE_NUMBER = 999;
const CUSTOM_ITEM_ID_START = 10000;
const ALLOWED_TIP_PERCENTAGES = [0, 5, 10, 20];

function cleanText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 180) : fallback;
}

function cleanCategory(value: unknown) {
  return productCategories.includes(value as never) ? String(value) : "Other";
}

function cleanPrice(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? Number(next.toFixed(2)) : 0;
}

function cleanAllergens(value: unknown) {
  if (!Array.isArray(value)) return ["None listed"];
  const next = value.map((entry) => String(entry).trim()).filter(Boolean).slice(0, 12);
  return next.length ? next : ["None listed"];
}

function cleanTableNumber(value: unknown) {
  const next = Number(value);
  return Number.isInteger(next) && next >= MIN_TABLE_NUMBER && next <= MAX_TABLE_NUMBER ? next : cafeConfig.tableNumber;
}

function cleanTipPercentage(value: unknown) {
  const next = Number(value || 0);
  return ALLOWED_TIP_PERCENTAGES.includes(next) ? next : 0;
}

function moneyValue(value: number) {
  return Number(value.toFixed(2));
}

function resolveOrderItem(requested: OrderRequestItem, id: number): MenuItem | null {
  const staticItem = menuItems.find((item) => item.id === id);
  const snapshot = requested.item;

  if (!snapshot) return staticItem || null;

  const isCustomItem = id >= CUSTOM_ITEM_ID_START;
  const canUseSnapshot = isCustomItem || staticItem;
  if (!canUseSnapshot) return null;

  return {
    id,
    name: cleanText(snapshot.name, staticItem?.name || "Menu item"),
    category: cleanCategory(snapshot.category || staticItem?.category),
    description: cleanText(snapshot.description, staticItem?.description || "Menu item"),
    price: cleanPrice(snapshot.price ?? staticItem?.price),
    image: cleanText(snapshot.image, staticItem?.image || ""),
    prep: cleanText(snapshot.prep, staticItem?.prep || "5 min"),
    allergens: cleanAllergens(snapshot.allergens || staticItem?.allergens),
    popular: snapshot.popular ?? staticItem?.popular,
    vegetarian: Boolean(snapshot.vegetarian ?? staticItem?.vegetarian),
    vegan: Boolean(snapshot.vegan ?? staticItem?.vegan),
  };
}

export function validateAndBuildOrder(body: OrderRequestBody): { ok: true; order: KitchenOrder } | { ok: false; error: string } {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: "Add at least one item before ordering." };
  }

  const quantities = new Map<number, number>();
  const resolvedItems = new Map<number, MenuItem>();

  for (const requested of body.items) {
    const id = Number(requested.id);
    const quantity = Number(requested.quantity);
    const menuItem = Number.isInteger(id) ? resolveOrderItem(requested, id) : null;

    if (!Number.isInteger(id) || !menuItem) {
      return { ok: false, error: "Unknown menu item." };
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QTY) {
      return { ok: false, error: "Invalid item quantity." };
    }

    quantities.set(id, (quantities.get(id) || 0) + quantity);
    resolvedItems.set(id, menuItem);
  }

  const totalQuantity = Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0);
  if (totalQuantity > MAX_TOTAL_ITEMS) {
    return { ok: false, error: "Too many items in one order." };
  }

  const items = Array.from(quantities.entries()).map(([id, quantity]) => {
    const menuItem = resolvedItems.get(id)!;
    return {
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      quantity,
      unitPrice: menuItem.price,
      description: menuItem.description,
      prep: menuItem.prep,
      allergens: menuItem.allergens,
      vegetarian: Boolean(menuItem.vegetarian),
      vegan: Boolean(menuItem.vegan),
    };
  });

  const subtotal = moneyValue(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const tipPercentage = cleanTipPercentage(body.tipPercentage);
  const tipAmount = moneyValue((subtotal * tipPercentage) / 100);
  const total = moneyValue(subtotal + tipAmount);

  return {
    ok: true,
    order: {
      id: Date.now(),
      cafeId: cafeConfig.id,
      table: cleanTableNumber(body.table),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "new",
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, MAX_NOTES) : "",
      subtotal,
      tipPercentage,
      tipAmount,
      total,
      items,
    } as KitchenOrder,
  };
}
