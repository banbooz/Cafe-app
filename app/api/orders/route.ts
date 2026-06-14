import { NextResponse } from "next/server";
import { cafeConfig } from "../../lib/cafeConfig";
import { menuItems } from "../../lib/menu";

const MAX_TOTAL_ITEMS = 30;
const MAX_ITEM_QTY = 10;
const MAX_NOTES = 180;

export async function POST(request: Request) {
  let body: { items?: { id?: number; quantity?: number }[]; notes?: string } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid order request." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, error: "Add at least one item before ordering." }, { status: 400 });
  }

  const quantities = new Map<number, number>();

  for (const requested of body.items) {
    const id = Number(requested.id);
    const quantity = Number(requested.quantity);
    const exists = menuItems.some((item) => item.id === id);

    if (!Number.isInteger(id) || !exists) {
      return NextResponse.json({ ok: false, error: "Unknown menu item." }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QTY) {
      return NextResponse.json({ ok: false, error: "Invalid item quantity." }, { status: 400 });
    }

    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const totalQuantity = Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0);
  if (totalQuantity > MAX_TOTAL_ITEMS) {
    return NextResponse.json({ ok: false, error: "Too many items in one order." }, { status: 400 });
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

  const order = {
    id: Date.now(),
    cafeId: cafeConfig.id,
    table: cafeConfig.tableNumber,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "new" as const,
    notes: typeof body.notes === "string" ? body.notes.trim().slice(0, MAX_NOTES) : "",
    total: Number(total.toFixed(2)),
    items,
  };

  return NextResponse.json({ ok: true, order });
}
