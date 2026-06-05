"use client";

import { useMemo, useState } from "react";

type Category = "Cake" | "Coffee" | "Food" | "Cold";
type Screen = "menu" | "tables" | "cart" | "allergens" | "confirmed";
type Area = "Indoor" | "Outdoor" | "Window" | "Quiet";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  allergens: string[];
  popular?: boolean;
};

type TableItem = {
  id: number;
  area: Area;
  seats: number;
  col: number;
  row: number;
  w: number;
  h: number;
  shape: "round" | "rect";
  busy?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Dark Chocolate Cake",
    description: "Rich chocolate sponge with ganache.",
    price: 4.8,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    popular: true,
  },
  {
    id: 2,
    name: "Oreo Cheesecake",
    description: "Creamy cheesecake with biscuit crumb.",
    price: 5.2,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    popular: true,
  },
  {
    id: 3,
    name: "Victoria Sponge",
    description: "Jam, cream, soft sponge and icing sugar.",
    price: 3.9,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
  },
  {
    id: 4,
    name: "Flat White",
    description: "Double espresso and silky steamed milk.",
    price: 3.2,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    allergens: ["Milk"],
    popular: true,
  },
  {
    id: 5,
    name: "Iced Latte",
    description: "Cold milk, espresso and ice.",
    price: 3.8,
    category: "Cold",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
    allergens: ["Milk"],
    popular: true,
  },
  {
    id: 6,
    name: "Chicken Sandwich",
    description: "Roast chicken, leaves and house dressing.",
    price: 5.5,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
    allergens: ["Gluten", "Egg", "Mustard"],
  },
  {
    id: 7,
    name: "Avocado Toast",
    description: "Sourdough, avocado, lemon and chilli.",
    price: 5.9,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80",
    allergens: ["Gluten"],
  },
  {
    id: 8,
    name: "Butter Croissant",
    description: "Flaky pastry baked fresh this morning.",
    price: 2.9,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
  },
];

const categories: { label: Category; icon: string }[] = [
  { label: "Cake", icon: "🍰" },
  { label: "Coffee", icon: "☕" },
  { label: "Food", icon: "🥪" },
  { label: "Cold", icon: "🥤" },
];

const tables: TableItem[] = [
  { id: 1, area: "Indoor", seats: 2, col: 1, row: 1, w: 1, h: 2, shape: "rect" },
  { id: 2, area: "Indoor", seats: 2, col: 1, row: 4, w: 1, h: 2, shape: "rect" },
  { id: 3, area: "Indoor", seats: 2, col: 1, row: 7, w: 1, h: 2, shape: "rect" },
  { id: 4, area: "Indoor", seats: 2, col: 1, row: 10, w: 1, h: 2, shape: "rect" },
  { id: 5, area: "Indoor", seats: 6, col: 4, row: 1, w: 2, h: 4, shape: "rect", busy: true },
  { id: 6, area: "Indoor", seats: 6, col: 4, row: 6, w: 2, h: 3, shape: "rect" },
  { id: 7, area: "Indoor", seats: 6, col: 4, row: 10, w: 2, h: 3, shape: "rect" },
  { id: 8, area: "Indoor", seats: 2, col: 8, row: 1, w: 1, h: 2, shape: "rect" },
  { id: 9, area: "Indoor", seats: 2, col: 8, row: 4, w: 1, h: 2, shape: "rect" },
  { id: 10, area: "Indoor", seats: 2, col: 8, row: 7, w: 1, h: 2, shape: "rect" },
  { id: 11, area: "Indoor", seats: 2, col: 8, row: 10, w: 1, h: 2, shape: "rect" },
  { id: 12, area: "Outdoor", seats: 4, col: 2, row: 2, w: 2, h: 2, shape: "round" },
  { id: 13, area: "Outdoor", seats: 4, col: 6, row: 2, w: 2, h: 2, shape: "round" },
  { id: 14, area: "Window", seats: 2, col: 2, row: 5, w: 1, h: 2, shape: "rect" },
  { id: 15, area: "Window", seats: 2, col: 7, row: 5, w: 1, h: 2, shape: "rect" },
  { id: 16, area: "Quiet", seats: 4, col: 4, row: 5, w: 2, h: 2, shape: "round" },
];

const areaTabs: Area[] = ["Indoor", "Outdoor", "Window", "Quiet"];
const taxRate = 0.2;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Cake");
  const [selectedArea, setSelectedArea] = useState<Area>("Indoor");
  const [selectedTable, setSelectedTable] = useState(6);
  const [basket, setBasket] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [waiterCalled, setWaiterCalled] = useState(false);

  const basketItems = menuItems
    .map((item) => ({ ...item, quantity: basket[item.id] || 0 }))
    .filter((item) => item.quantity > 0);

  const itemCount = basketItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = basketItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = item.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  const visibleTables = tables.filter((table) => table.area === selectedArea);

  function addItem(id: number) {
    setBasket((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  }

  function removeItem(id: number) {
    setBasket((current) => {
      const nextQuantity = (current[id] || 0) - 1;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: nextQuantity };
    });
  }

  function openScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function placeOrder() {
    if (itemCount === 0) return;
    setBasket({});
    setNote("");
    openScreen("confirmed");
  }

  if (screen === "tables") {
    return (
      <PhoneShell>
        <TopBar title="Tables" onBack={() => openScreen("menu")} onMore={() => openScreen("allergens")} />

        <section className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {areaTabs.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-black ${
                  selectedArea === area
                    ? "bg-[#203242] text-white"
                    : "bg-white text-[#5a6268] ring-1 ring-[#dfe4e7]"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </section>

        <section className="px-5 pb-28 pt-1">
          <div className="relative min-h-[560px] rounded-[2rem] bg-[#f6f8f8] p-4 shadow-inner ring-1 ring-[#e3e7e8]">
            <div className="absolute left-1/2 top-4 h-5 w-24 -translate-x-1/2 rounded-full bg-[#e4e8ea]" />
            <div className="grid h-[520px] grid-cols-8 grid-rows-12 gap-2 pt-8">
              {visibleTables.map((table) => (
                <button
                  key={table.id}
                  disabled={table.busy}
                  onClick={() => setSelectedTable(table.id)}
                  style={{
                    gridColumn: `${table.col} / span ${table.w}`,
                    gridRow: `${table.row} / span ${table.h}`,
                  }}
                  className={`relative grid place-items-center transition active:scale-95 ${
                    table.shape === "round" ? "rounded-full" : "rounded-2xl"
                  } ${
                    selectedTable === table.id
                      ? "bg-[#203242] text-white shadow-xl shadow-slate-900/20"
                      : table.busy
                        ? "bg-[#d9dee1] text-[#7b858b]"
                        : "bg-[#e9eef0] text-[#203242]"
                  }`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs font-black text-[#203242]">
                    {table.id}
                  </span>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-[#80898e]">
                    {table.busy ? "Busy" : `${table.seats} seats`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
          <button
            onClick={() => openScreen("menu")}
            className="min-h-14 w-full rounded-full bg-[#203242] text-sm font-black text-white shadow-xl shadow-slate-900/20"
          >
            Select table {selectedTable}
          </button>
        </section>
      </PhoneShell>
    );
  }

  if (screen === "cart") {
    return (
      <PhoneShell>
        <TopBar title="Cart" onBack={() => openScreen("menu")} onMore={() => openScreen("allergens")} />

        <section className="px-4 pb-36 pt-3">
          <button
            onClick={() => openScreen("tables")}
            className="mb-4 flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 text-left text-sm font-black text-[#203242] ring-1 ring-[#dfe4e7]"
          >
            <span>Indoor, table {selectedTable}</span>
            <span>⌄</span>
          </button>

          <div className="space-y-3">
            {basketItems.length === 0 ? (
              <div className="rounded-[1.6rem] bg-white p-8 text-center ring-1 ring-[#dfe4e7]">
                <h2 className="text-xl font-black text-[#203242]">Cart is empty</h2>
                <p className="mt-2 text-sm font-semibold text-[#7a858c]">Add something from the menu first.</p>
              </div>
            ) : (
              basketItems.map((item) => (
                <article key={item.id} className="flex gap-3 rounded-[1.35rem] bg-white p-3 ring-1 ring-[#dfe4e7]">
                  <div
                    className="h-20 w-20 shrink-0 rounded-[1rem] bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-black text-[#203242]">{item.name}</h2>
                        <p className="mt-1 text-base font-black text-[#203242]">£{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex h-8 items-center gap-2 rounded-full bg-[#eef2f3] px-2">
                        <button onClick={() => removeItem(item.id)} className="grid h-6 w-6 place-items-center rounded-full bg-[#203242] text-xs font-black text-white">−</button>
                        <span className="min-w-4 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => addItem(item.id)} className="grid h-6 w-6 place-items-center rounded-full bg-[#203242] text-xs font-black text-white">+</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#7a858c]">Note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-20 w-full resize-none rounded-[1.25rem] border border-[#dfe4e7] bg-white px-4 py-3 text-sm font-semibold text-[#203242] outline-none focus:border-[#203242]"
              placeholder="e.g. no tomato, bring with forks"
            />
          </label>
        </section>

        <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
          <div className="mb-3 rounded-[1.35rem] bg-white p-4 text-sm font-bold text-[#4f5b62] ring-1 ring-[#dfe4e7]">
            <div className="flex justify-between"><span>Sub Total</span><span>£{subtotal.toFixed(2)}</span></div>
            <div className="mt-2 flex justify-between"><span>Tax (20%)</span><span>£{tax.toFixed(2)}</span></div>
            <div className="mt-3 border-t border-dashed border-[#dfe4e7] pt-3 text-base font-black text-[#203242]"><div className="flex justify-between"><span>Total</span><span>£{total.toFixed(2)}</span></div></div>
          </div>
          <button
            onClick={placeOrder}
            disabled={itemCount === 0}
            className="min-h-14 w-full rounded-full bg-[#203242] text-sm font-black text-white shadow-xl shadow-slate-900/20 disabled:bg-[#c7ced2]"
          >
            Order Now
          </button>
        </section>
      </PhoneShell>
    );
  }

  if (screen === "allergens") {
    return (
      <PhoneShell>
        <TopBar title="Allergens" onBack={() => openScreen("menu")} onMore={() => openScreen("cart")} />
        <section className="space-y-3 px-4 py-4 pb-24">
          <div className="rounded-[1.6rem] bg-[#203242] p-5 text-white">
            <h1 className="text-xl font-black">Check before ordering</h1>
            <p className="mt-2 text-sm leading-6 text-white/80">Speak to staff if you have a serious allergy. Cross-contact can happen in the kitchen.</p>
          </div>
          {menuItems.map((item) => (
            <article key={item.id} className="rounded-[1.4rem] bg-white p-4 ring-1 ring-[#dfe4e7]">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7a858c]">{item.category}</p>
                  <h2 className="mt-1 text-base font-black text-[#203242]">{item.name}</h2>
                </div>
                <p className="text-sm font-black text-[#203242]">£{item.price.toFixed(2)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.allergens.map((allergen) => (
                  <span key={allergen} className="rounded-full bg-[#eef2f3] px-3 py-2 text-xs font-black text-[#4f5b62]">{allergen}</span>
                ))}
              </div>
            </article>
          ))}
        </section>
      </PhoneShell>
    );
  }

  if (screen === "confirmed") {
    return (
      <PhoneShell>
        <section className="flex min-h-screen flex-col items-center justify-center px-8 text-center sm:min-h-[820px]">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#203242] text-5xl text-white">✓</div>
          <h1 className="mt-6 text-3xl font-black text-[#203242]">Order sent</h1>
          <p className="mt-3 text-sm leading-6 text-[#6b777e]">Your order has gone to the kitchen for table {selectedTable}. Staff will bring it over when it is ready.</p>
          <button onClick={() => openScreen("menu")} className="mt-8 min-h-14 w-full rounded-full bg-[#203242] text-sm font-black text-white">Order again</button>
        </section>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <section className="relative bg-[#aab3b8] px-4 pb-7 pt-5 text-white">
        <div className="flex items-center justify-between">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-xl backdrop-blur">≡</button>
          <div className="flex gap-2">
            <button onClick={() => openScreen("cart")} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
              🛒
              {itemCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#203242] text-[10px] font-black">{itemCount}</span>}
            </button>
            <button onClick={() => openScreen("allergens")} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">ⓘ</button>
          </div>
        </div>

        <div className="relative mt-7 h-32">
          <div className="absolute left-4 right-4 top-0 rotate-[-3deg] rounded-[1.3rem] bg-white/60 p-4 shadow-xl" />
          <div className="absolute left-2 right-2 top-4 rotate-[2deg] rounded-[1.3rem] bg-white/80 p-4 shadow-xl" />
          <div className="absolute inset-x-0 top-8 rounded-[1.3rem] bg-white p-4 text-[#203242] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#89939a]">Current table</p>
                <h1 className="mt-1 text-lg font-black">Indoor, table {selectedTable}</h1>
                <p className="mt-1 text-xs font-bold text-[#7a858c]">{itemCount} items selected</p>
              </div>
              <button onClick={() => openScreen("tables")} className="rounded-full bg-[#eef2f3] px-3 py-2 text-xs font-black">Change</button>
            </div>
            <button
              onClick={() => {
                setWaiterCalled(true);
                setTimeout(() => setWaiterCalled(false), 2500);
              }}
              className="mt-3 min-h-11 w-full rounded-full bg-[#203242] text-sm font-black text-white"
            >
              {waiterCalled ? "Waiter called" : "Call Waiter"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-t-[2rem] bg-[#f7f8f8] px-4 pb-32 pt-5">
        <h2 className="text-lg font-black text-white/0">.</h2>
        <h1 className="text-xl font-black text-[#203242]">Make your order</h1>

        <label className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-[#dfe4e7]">
          <span className="text-[#89939a]">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#203242] outline-none placeholder:text-[#9aa3a8]"
          />
        </label>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => setSelectedCategory(category.label)}
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-black ${
                selectedCategory === category.label
                  ? "bg-[#203242] text-white"
                  : "bg-white text-[#5a6268] ring-1 ring-[#dfe4e7]"
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const quantity = basket[item.id] || 0;
            return (
              <article key={item.id} className="overflow-hidden rounded-[1.35rem] bg-white shadow-sm ring-1 ring-[#dfe4e7]">
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="p-3">
                  <h2 className="min-h-10 text-sm font-black leading-5 text-[#203242]">{item.name}</h2>
                  <p className="mt-2 text-base font-black text-[#203242]">£{item.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <button onClick={() => openScreen("allergens")} className="text-[11px] font-black text-[#7a858c] underline">Allergens</button>
                    {quantity === 0 ? (
                      <button onClick={() => addItem(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-[#203242] text-lg font-black text-white">+</button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-[#eef2f3] p-1">
                        <button onClick={() => removeItem(item.id)} className="grid h-6 w-6 place-items-center rounded-full bg-[#203242] text-xs font-black text-white">−</button>
                        <span className="min-w-4 text-center text-xs font-black text-[#203242]">{quantity}</span>
                        <button onClick={() => addItem(item.id)} className="grid h-6 w-6 place-items-center rounded-full bg-[#203242] text-xs font-black text-white">+</button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
        <button
          onClick={() => openScreen(itemCount > 0 ? "cart" : "tables")}
          className="min-h-14 w-full rounded-full bg-[#203242] text-sm font-black text-white shadow-xl shadow-slate-900/20"
        >
          {itemCount > 0 ? `View cart · ${itemCount} items · £${total.toFixed(2)}` : `Select table ${selectedTable}`}
        </button>
      </section>
    </PhoneShell>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#dfe4e7] text-[#203242]">
      <div className="mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#f7f8f8] shadow-2xl shadow-slate-950/15 sm:my-6 sm:min-h-[820px] sm:rounded-[2.25rem]">
        {children}
      </div>
    </main>
  );
}

function TopBar({
  title,
  onBack,
  onMore,
}: {
  title: string;
  onBack: () => void;
  onMore: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#dfe4e7] bg-[#f7f8f8]/95 px-4 backdrop-blur">
      <button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-white text-lg font-black ring-1 ring-[#dfe4e7]">‹</button>
      <h1 className="text-base font-black text-[#203242]">{title}</h1>
      <button onClick={onMore} className="grid h-10 w-10 place-items-center rounded-full bg-white text-lg font-black ring-1 ring-[#dfe4e7]">⋯</button>
    </header>
  );
}
