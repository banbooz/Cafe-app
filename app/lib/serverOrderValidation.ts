import { randomBytes } from "crypto";
import { cafeConfig } from "./cafeConfig";
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from "./firebaseAdmin";
import { allMenuItems, type MenuExperienceId, type MenuItem } from "./menu";
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
  experienceMode?: MenuExperienceId;
};

type TrustedMenuState = {
  menuItems: Map<number, MenuItem>;
  availability: Record<number, boolean>;
};

const MAX_TOTAL_ITEMS = 30;
const MAX_ITEM_QTY = 10;
const MAX_NOTES = 180;
const MIN_TABLE_NUMBER = 1;
const MAX_TABLE_NUMBER = 999;
const STAFF_ITEM_ID_START = 10000;
const ALLOWED_TIP_PERCENTAGES = [0, 5, 10, 20];

function stateCollectionName() {
  return process.env.NEXT_PUBLIC_FIREBASE_STATE_COLLECTION || "cafes";
}

function cleanText(value: unknown, fallback: string, maxLength = 180) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : fallback;
}

function cleanCategory(value: unknown, fallback = "Other") {
  return cleanText(value, fallback);
}

function cleanPrice(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? Number(next.toFixed(2)) : fallback;
}

function cleanAllergens(value: unknown, fallback: string[] = ["None listed"]) {
  if (!Array.isArray(value)) return fallback;
  const next = value.map((entry) => String(entry).trim()).filter(Boolean).slice(0, 12);
  return next.length ? next : fallback;
}

function cleanTableNumber(value: unknown) {
  const next = Number(value);
  return Number.isInteger(next) && next >= MIN_TABLE_NUMBER && next <= MAX_TABLE_NUMBER ? next : cafeConfig.tableNumber;
}

function cleanTipPercentage(value: unknown) {
  const next = Number(value || 0);
  return ALLOWED_TIP_PERCENTAGES.includes(next) ? next : 0;
}

function cleanExperienceMode(value: unknown): MenuExperienceId {
  return value === "cafe" || value === "drinks" || value === "restaurant" ? value : "restaurant";
}

function moneyValue(value: number) {
  return Number(value.toFixed(2));
}

function createOrderId() {
  return randomBytes(6).readUIntBE(0, 6);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normaliseStaffItem(value: unknown): MenuItem | null {
  if (!isRecord(value)) return null;
  const id = Number(value.id);
  if (!Number.isInteger(id) || id < STAFF_ITEM_ID_START) return null;

  return {
    id,
    experienceMode: cleanExperienceMode(value.experienceMode),
    name: cleanText(value.name, "Menu item"),
    category: cleanCategory(value.category),
    description: cleanText(value.description, "Menu item"),
    price: cleanPrice(value.price),
    image: cleanText(value.image, ""),
    prep: cleanText(value.prep, "5 min"),
    allergens: cleanAllergens(value.allergens),
    popular: value.popular === true,
    vegetarian: value.vegetarian === true,
    vegan: value.vegan === true,
  };
}

function normaliseMenuSettings(value: unknown): Record<number, Partial<MenuItem>> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([rawId, rawSettings]) => {
        const id = Number(rawId);
        return Number.isInteger(id) && isRecord(rawSettings) ? [id, rawSettings as Partial<MenuItem>] : null;
      })
      .filter((entry): entry is [number, Partial<MenuItem>] => Boolean(entry))
  );
}

function normaliseHiddenIds(value: unknown) {
  if (!Array.isArray(value)) return new Set<number>();
  return new Set(value.map(Number).filter((id) => Number.isInteger(id)));
}

function normaliseAvailability(value: unknown) {
  if (!isRecord(value)) return {} as Record<number, boolean>;
  return Object.fromEntries(
    Object.entries(value)
      .map(([rawId, rawAvailable]) => {
        const id = Number(rawId);
        return Number.isInteger(id) && typeof rawAvailable === "boolean" ? [id, rawAvailable] : null;
      })
      .filter((entry): entry is [number, boolean] => Boolean(entry))
  ) as Record<number, boolean>;
}

function applyTrustedSettings(item: MenuItem, settings: Record<number, Partial<MenuItem>>) {
  const saved = settings[item.id];
  if (!saved) return item;
  return {
    ...item,
    name: cleanText(saved.name, item.name),
    category: cleanCategory(saved.category, item.category),
    description: cleanText(saved.description, item.description),
    price: saved.price === undefined ? item.price : cleanPrice(saved.price, item.price),
    image: cleanText(saved.image, item.image),
    prep: cleanText(saved.prep, item.prep),
    allergens: cleanAllergens(saved.allergens, item.allergens),
    popular: Boolean(saved.popular ?? item.popular),
    vegetarian: Boolean(saved.vegetarian ?? item.vegetarian),
    vegan: Boolean(saved.vegan ?? item.vegan),
  };
}

async function loadTrustedMenuState(): Promise<TrustedMenuState> {
  let data: Record<string, unknown> = {};
  if (isFirebaseAdminConfigured()) {
    const db = getFirebaseAdminDb();
    const snapshot = db ? await db.collection(stateCollectionName()).doc(cafeConfig.id).get() : null;
    data = snapshot?.data() || {};
  }

  const menuSettings = normaliseMenuSettings(data.menuSettings);
  const hiddenIds = normaliseHiddenIds(data.hiddenMenuItemIds);
  const staffItems = Array.isArray(data.staffMenuItems) ? data.staffMenuItems.map(normaliseStaffItem).filter((item): item is MenuItem => Boolean(item)) : [];
  const availability = normaliseAvailability(data.availability);
  const menuItems = new Map<number, MenuItem>();

  [...allMenuItems, ...staffItems].forEach((item) => {
    if (!hiddenIds.has(item.id)) menuItems.set(item.id, applyTrustedSettings(item, menuSettings));
  });

  return { menuItems, availability };
}

function isTrustedItemAvailable(id: number, availability: Record<number, boolean>) {
  return availability[id] !== false;
}

export async function validateAndBuildOrder(body: OrderRequestBody): Promise<{ ok: true; order: KitchenOrder } | { ok: false; error: string }> {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: "Add at least one item before ordering." };
  }

  const trustedState = await loadTrustedMenuState();
  const quantities = new Map<number, number>();
  const resolvedItems = new Map<number, MenuItem>();

  for (const requested of body.items) {
    const id = Number(requested.id);
    const quantity = Number(requested.quantity);
    const menuItem = Number.isInteger(id) ? trustedState.menuItems.get(id) || null : null;

    if (!Number.isInteger(id) || !menuItem) {
      return { ok: false, error: "Unknown menu item." };
    }

    if (!isTrustedItemAvailable(id, trustedState.availability)) {
      return { ok: false, error: `${menuItem.name} is not available right now.` };
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
  const createdAt = Date.now();

  return {
    ok: true,
    order: {
      id: createOrderId(),
      createdAt,
      cafeId: cafeConfig.id,
      orderType: cleanExperienceMode(body.experienceMode),
      table: cleanTableNumber(body.table),
      time: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
