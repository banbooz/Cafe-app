"use client";

import { useMemo, useState, type ReactNode } from "react";

type Category = "Popular" | "Mains" | "Cake" | "Coffee" | "Cold";
type Screen = "menu" | "tables" | "detail" | "cart" | "allergens" | "confirmed";
type Area = "Indoor" | "Outdoor" | "Window" | "Quiet";
type OrderType = "Dine in" | "Take away" | "Delivery";

type MenuItem = {
  id: number;
  name: string;
  sub: string;
  description: string;
  price: number;
  category: Exclude<Category, "Popular">;
  image: string;
  allergens: string[];
  popular?: boolean;
  rating: number;
  prep: string;
};

type TableItem = {
  id: number;
  area: Area;
  seats: number;
  col: number;
  row: number;
  w: number;
  h: number;
  busy?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Dark Chocolate Cake",
    sub: "Dessert",
    description:
      "Rich chocolate sponge, smooth ganache and a light cocoa finish. Served with cream on request.",
    price: 4.8,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    popular: true,
    rating: 4.8,
    prep: "5 min",
  },
  {
    id: 2,
    name: "Oreo Cheesecake",
    sub: "Dessert",
    description:
      "Creamy vanilla cheesecake with biscuit crumb and a dark cookie base.",
    price: 5.2,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    popular: true,
    rating: 4.7,
    prep: "4 min",
  },
  {
    id: 3,
    name: "Victoria Sponge",
    sub: "Cake",
    description: "Soft sponge cake with jam, cream and icing sugar.",
    price: 3.9,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    rating: 4.6,
    prep: "4 min",
  },
  {
    id: 4,
    name: "Italian Spaghetti",
    sub: "Main Course",
    description:
      "Tomato, basil, garlic and parmesan over spaghetti. Simple, fresh and filling.",
    price: 8.5,
    category: "Mains",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    allergens: ["Gluten", "Milk"],
    popular: true,
    rating: 4.5,
    prep: "12 min",
  },
  {
    id: 5,
    name: "Chicken Sandwich",
    sub: "Lunch",
    description: "Roast chicken, leaves, tomato and house dressing in toasted bread.",
    price: 5.5,
    category: "Mains",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
    allergens: ["Gluten", "Egg", "Mustard"],
    rating: 4.4,
    prep: "8 min",
  },
  {
    id: 6,
    name: "Avocado Toast",
    sub: "Breakfast",
    description: "Sourdough toast, avocado, chilli flakes, lemon and cracked pepper.",
    price: 5.9,
    category: "Mains",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80",
    allergens: ["Gluten"],
    rating: 4.6,
    prep: "7 min",
  },
  {
    id: 7,
    name: "Flat White",
    sub: "Coffee",
    description: "Double espresso with silky steamed milk and a smooth finish.",
    price: 3.2,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    allergens: ["Milk"],
    popular: true,
    rating: 4.9,
    prep: "3 min",
  },
  {
    id: 8,
    name: "Iced Latte",
    sub: "Cold Coffee",
    description: "Chilled espresso over milk and ice. Add syrup at the counter.",
    price: 3.8,
    category: "Cold",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    allergens: ["Milk"],
    popular: true,
    rating: 4.7,
    prep: "3 min",
  },
  {
    id: 9,
    name: "Hot Chocolate",
    sub: "Hot Drink",
    description: "Rich cocoa with steamed milk and chocolate dusting.",
    price: 3.4,
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?auto=format&fit=crop&w=900&q=80",
    allergens: ["Milk"],
    rating: 4.5,
    prep: "4 min",
  },
  {
    id: 10,
    name: "Fresh Lemonade",
    sub: "Cold Drink",
    description: "Sparkling lemonade with lemon slices and mint.",
    price: 3.6,
    category: "Cold",
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
    allergens: ["None listed"],
    rating: 4.4,
    prep: "3 min",
  },
];

const categories: { label: Category; icon: string }[] = [
  { label: "Popular", icon: "★" },
  { label: "Mains", icon: "🍝" },
  { label: "Cake", icon: "🍰" },
  { label: "Coffee", icon: "☕" },
  { label: "Cold", icon: "🥤" },
];

const tables: TableItem[] = [
  { id: 1, area: "Indoor", seats: 2, col: 1, row: 1, w: 1, h: 2 },
  { id: 2, area: "Indoor", seats: 2, col: 1, row: 4, w: 1, h: 2 },
  { id: 3, area: "Indoor", seats: 2, col: 1, row: 7, w: 1, h: 2 },
  { id: 4, area: "Indoor", seats: 2, col: 1, row: 10, w: 1, h: 2 },
  { id: 5, area: "Indoor", seats: 6, col: 4, row: 1, w: 2, h: 4, busy: true },
  { id: 6, area: "Indoor", seats: 6, col: 4, row: 6, w: 2, h: 3 },
  { id: 7, area: "Indoor", seats: 6, col: 4, row: 10, w: 2, h: 3 },
  { id: 8, area: "Indoor", seats: 2, col: 8, row: 1, w: 1, h: 2 },
  { id: 9, area: "Indoor", seats: 2, col: 8, row: 4, w: 1, h: 2 },
  { id: 10, area: "Indoor", seats: 2, col: 8, row: 7, w: 1, h: 2 },
  { id: 11, area: "Indoor", seats: 2, col: 8, row: 10, w: 1, h: 2 },
  { id: 12, area: "Outdoor", seats: 4, col: 2, row: 2, w: 2, h: 2 },
  { id: 13, area: "Outdoor", seats: 4, col: 6, row: 2, w: 2, h: 2 },
  { id: 14, area: "Window", seats: 2, col: 2, row: 5, w: 1, h: 2 },
  { id: 15, area: "Window", seats: 2, col: 7, row: 5, w: 1, h: 2 },
  { id: 16, area: "Quiet", seats: 4, col: 4, row: 5, w: 2, h: 2 },
];

const areaTabs: Area[] = ["Indoor", "Outdoor", "Window", "Quiet"];
const orderTypes: OrderType[] = ["Dine in", "Take away", "Delivery"];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Popular");
  const [selectedArea, setSelectedArea] = useState<Area>("Indoor");
  const [selectedTable, setSelectedTable] = useState(6);
  const [selectedItemId, setSelectedItemId] = useState(1);
  const [basket, setBasket] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Dine in");
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [favourites, setFavourites] = useState<Record<number, boolean>>({});

  const selectedItem = menuItems.find((item) => item.id === selectedItemId) ?? menuItems[0];

  const basketItems = menuItems
    .map((item) => ({ ...item, quantity: basket[item.id] || 0 }))
    .filter((item) => item.quantity > 0);

  const itemCount = basketItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = basketItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "Popular" ? item.popular : item.category === selectedCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.sub.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  const visibleTables = tables.filter((table) => table.area === selectedArea);

  function openScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

  function openItem(id: number) {
    setSelectedItemId(id);
    openScreen("detail");
  }

  function callWaiter() {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 2200);
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
        <TopBar title="Tables" onBack={() => openScreen("menu")} onRight={() => openScreen("cart")} rightLabel="Cart" />
        <section className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {areaTabs.map((area) => (
              <Pill key={area} active={selectedArea === area} onClick={() => setSelectedArea(area)}>
                {area}
              </Pill>
            ))}
          </div>
        </section>
        <section className="px-5 pb-28 pt-1">
          <div className="relative min-h-[560px] rounded-[2rem] bg-[#f3f5f6] p-4 shadow-inner ring-1 ring-[#dde3e6]">
            <div className="absolute left-1/2 top-4 h-5 w-24 -translate-x-1/2 rounded-full bg-[#e1e6e9]" />
            <div className="grid h-[520px] grid-cols-8 grid-rows-12 gap-2 pt-8">
              {visibleTables.map((table) => (
                <button
                  key={table.id}
                  disabled={table.busy}
                  onClick={() => setSelectedTable(table.id)}
                  style={{ gridColumn: `${table.col} / span ${table.w}`, gridRow: `${table.row} / span ${table.h}` }}
                  className={`relative grid place-items-center rounded-2xl transition active:scale-95 ${
                    selectedTable === table.id
                      ? "bg-[#223546] text-white shadow-xl shadow-slate-950/20"
                      : table.busy
                        ? "bg-[#d7dde1] text-[#8a949a]"
                        : "bg-[#e8edf0] text-[#223546]"
                  }`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-xs font-black text-[#223546]">
                    {table.id}
                  </span>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-[#7a858c]">
                    {table.busy ? "Busy" : `${table.seats} seats`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        <FooterButton onClick={() => openScreen("menu")}>Select table {selectedTable}</FooterButton>
      </PhoneShell>
    );
  }

  if (screen === "detail") {
    const quantity = basket[selectedItem.id] || 0;
    return (
      <PhoneShell>
        <TopBar title="Details Menu" onBack={() => openScreen("menu")} onRight={() => openScreen("allergens")} rightLabel="Info" />
        <section className="px-5 pb-28 pt-4">
          <div
            className="h-64 rounded-[2rem] bg-cover bg-center shadow-inner"
            style={{ backgroundImage: `url(${selectedItem.image})` }}
          />
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7b858b]">{selectedItem.sub}</p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-[#223546]">{selectedItem.name}</h1>
              <div className="mt-2 flex gap-3 text-xs font-black text-[#6f7b82]">
                <span>★ {selectedItem.rating}</span>
                <span>{selectedItem.prep}</span>
              </div>
            </div>
            <button
              onClick={() => setFavourites((current) => ({ ...current, [selectedItem.id]: !current[selectedItem.id] }))}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg shadow-sm ring-1 ring-[#dde3e6]"
            >
              {favourites[selectedItem.id] ? "♥" : "♡"}
            </button>
          </div>
          <p className="mt-5 text-2xl font-black text-[#223546]">£{selectedItem.price.toFixed(2)}</p>
          <div className="mt-5 rounded-[1.5rem] bg-white p-4 ring-1 ring-[#dde3e6]">
            <h2 className="font-black text-[#223546]">Description</h2>
            <p className="mt-2 text-sm leading-6 text-[#64717a]">{selectedItem.description}</p>
          </div>
          <button
            onClick={() => openScreen("allergens")}
            className="mt-4 min-h-12 w-full rounded-[1.25rem] bg-white text-sm font-black text-[#223546] ring-1 ring-[#dde3e6]"
          >
            View allergen information
          </button>
        </section>
        <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
          {quantity === 0 ? (
            <button onClick={() => addItem(selectedItem.id)} className="min-h-14 w-full rounded-full bg-[#ff8f2f] text-sm font-black text-white shadow-xl shadow-orange-900/20">
              Add to cart · £{selectedItem.price.toFixed(2)}
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-full bg-[#223546] p-2 text-white shadow-xl shadow-slate-950/20">
              <button onClick={() => removeItem(selectedItem.id)} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl font-black">−</button>
              <button onClick={() => openScreen("cart")} className="min-h-10 flex-1 text-sm font-black">
                {itemCount} items selected · £{total.toFixed(2)}
              </button>
              <button onClick={() => addItem(selectedItem.id)} className="grid h-10 w-10 place-items-center rounded-full bg-[#ff8f2f] text-xl font-black">+</button>
            </div>
          )}
        </section>
      </PhoneShell>
    );
  }

  if (screen === "cart") {
    return (
      <PhoneShell>
        <TopBar title="Payout" onBack={() => openScreen("menu")} onRight={() => openScreen("allergens")} rightLabel="Info" />
        <section className="px-4 pb-40 pt-3">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1 ring-1 ring-[#dde3e6]">
            {orderTypes.map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`min-h-10 rounded-xl text-xs font-black ${orderType === type ? "bg-[#ff8f2f] text-white" : "text-[#66747d]"}`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            onClick={() => openScreen("tables")}
            className="mb-4 flex min-h-14 w-full items-center justify-between rounded-[1.35rem] bg-white px-4 text-left ring-1 ring-[#dde3e6]"
          >
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#7b858b]">{orderType}</span>
              <span className="text-sm font-black text-[#223546]">Table {selectedTable}</span>
            </span>
            <span className="text-xs font-black text-[#ff8f2f]">Change table</span>
          </button>
          <div className="space-y-3">
            {basketItems.length === 0 ? (
              <EmptyCard title="Cart is empty" text="Choose something from the menu first." />
            ) : (
              basketItems.map((item) => (
                <article key={item.id} className="flex gap-3 rounded-[1.35rem] bg-white p-3 ring-1 ring-[#dde3e6]">
                  <button
                    onClick={() => openItem(item.id)}
                    className="h-20 w-20 shrink-0 rounded-[1rem] bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                    aria-label={`Open ${item.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-black text-[#223546]">{item.name}</h2>
                        <p className="text-xs font-semibold text-[#7b858b]">{item.sub}</p>
                        <p className="mt-1 text-base font-black text-[#223546]">£{item.price.toFixed(2)}</p>
                      </div>
                      <Stepper quantity={item.quantity} onMinus={() => removeItem(item.id)} onPlus={() => addItem(item.id)} small />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#7b858b]">Note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-20 w-full resize-none rounded-[1.25rem] border border-[#dde3e6] bg-white px-4 py-3 text-sm font-semibold text-[#223546] outline-none focus:border-[#223546]"
              placeholder="e.g. no tomato, bring with forks"
            />
          </label>
        </section>
        <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
          <div className="mb-3 rounded-[1.35rem] bg-white p-4 text-sm font-bold text-[#58666e] ring-1 ring-[#dde3e6]">
            <Line label="Sub Total" value={`£${subtotal.toFixed(2)}`} />
            <Line label="Tax (20%)" value={`£${tax.toFixed(2)}`} />
            <div className="mt-3 border-t border-dashed border-[#dde3e6] pt-3 text-base font-black text-[#223546]">
              <Line label="Total" value={`£${total.toFixed(2)}`} />
            </div>
          </div>
          <button
            onClick={placeOrder}
            disabled={itemCount === 0}
            className="min-h-14 w-full rounded-full bg-[#ff8f2f] text-sm font-black text-white shadow-xl shadow-orange-900/20 disabled:bg-[#c7ced2]"
          >
            Process Order
          </button>
        </section>
      </PhoneShell>
    );
  }

  if (screen === "allergens") {
    return (
      <PhoneShell>
        <TopBar title="Allergens" onBack={() => openScreen("menu")} onRight={() => openScreen("cart")} rightLabel="Cart" />
        <section className="space-y-3 px-4 py-4 pb-24">
          <div className="rounded-[1.6rem] bg-[#223546] p-5 text-white">
            <h1 className="text-xl font-black">Check before ordering</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">Speak to staff if you have a serious allergy. Kitchen cross-contact can happen.</p>
          </div>
          {menuItems.map((item) => (
            <article key={item.id} className="rounded-[1.35rem] bg-white p-4 ring-1 ring-[#dde3e6]">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7b858b]">{item.category}</p>
                  <h2 className="mt-1 text-base font-black text-[#223546]">{item.name}</h2>
                </div>
                <p className="text-sm font-black text-[#223546]">£{item.price.toFixed(2)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.allergens.map((allergen) => (
                  <span key={allergen} className="rounded-full bg-[#eef2f3] px-3 py-2 text-xs font-black text-[#58666e]">{allergen}</span>
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
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#223546] text-5xl text-white">✓</div>
          <h1 className="mt-6 text-3xl font-black text-[#223546]">Order sent</h1>
          <p className="mt-3 text-sm leading-6 text-[#66747d]">Your {orderType.toLowerCase()} order has gone to the kitchen for table {selectedTable}.</p>
          <button onClick={() => openScreen("menu")} className="mt-8 min-h-14 w-full rounded-full bg-[#ff8f2f] text-sm font-black text-white">Order again</button>
        </section>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <section className="bg-[#ff9b38] px-4 pb-7 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white/80">Welcome</p>
            <h1 className="text-xl font-black">Cafe App</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openScreen("cart")} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
              🛒
              {itemCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#223546] text-[10px] font-black">{itemCount}</span>}
            </button>
            <button onClick={() => openScreen("allergens")} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-sm font-black backdrop-blur">i</button>
          </div>
        </div>
        <button onClick={() => openScreen("tables")} className="mt-4 text-sm font-black text-white/95">⌁ Foodie Cafe · Table {selectedTable}</button>
        <label className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-white/40">
          <span className="text-[#8b969c]">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search menu"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#223546] outline-none placeholder:text-[#9aa3a8]"
          />
        </label>
      </section>

      <section className="rounded-t-[2rem] bg-[#f7f8f8] px-4 pb-32 pt-5">
        <div className="flex gap-3 overflow-x-auto pb-3">
          {categories.map((category) => (
            <button key={category.label} onClick={() => setSelectedCategory(category.label)} className="shrink-0 text-center">
              <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-xl shadow-sm ring-1 ${selectedCategory === category.label ? "bg-[#223546] text-white ring-[#223546]" : "bg-white ring-[#dde3e6]"}`}>{category.icon}</div>
              <p className={`mt-2 text-xs font-black ${selectedCategory === category.label ? "text-[#223546]" : "text-[#7b858b]"}`}>{category.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#223546]">{selectedCategory}</h2>
          <button onClick={callWaiter} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#223546] ring-1 ring-[#dde3e6]">
            {waiterCalled ? "Called" : "Call waiter"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const quantity = basket[item.id] || 0;
            return (
              <article key={item.id} className="overflow-hidden rounded-[1.35rem] bg-white shadow-sm ring-1 ring-[#dde3e6]">
                <button onClick={() => openItem(item.id)} className="block h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.name}`} />
                <div className="p-3">
                  <button onClick={() => openItem(item.id)} className="text-left">
                    <h3 className="min-h-10 text-sm font-black leading-5 text-[#223546]">{item.name}</h3>
                    <p className="text-xs font-semibold text-[#7b858b]">{item.sub}</p>
                  </button>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-base font-black text-[#223546]">£{item.price.toFixed(2)}</p>
                    {quantity === 0 ? (
                      <button onClick={() => addItem(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-[#ff8f2f] text-lg font-black text-white">+</button>
                    ) : (
                      <Stepper quantity={quantity} onMinus={() => removeItem(item.id)} onPlus={() => addItem(item.id)} small />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 && <EmptyCard title="No items found" text="Try another search or category." />}
      </section>

      <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
        <button
          onClick={() => openScreen(itemCount > 0 ? "cart" : "tables")}
          className="flex min-h-14 w-full items-center justify-between rounded-[1.1rem] bg-[#2d2f31] px-4 text-left text-white shadow-xl shadow-slate-950/20"
        >
          <span>
            <span className="block text-sm font-black">{itemCount > 0 ? `${itemCount} items selected` : `Table ${selectedTable}`}</span>
            <span className="block text-xs font-semibold text-white/70">{basketItems.slice(0, 2).map((item) => item.name).join(", ") || "Select table or add items"}</span>
          </span>
          <span className="rounded-xl bg-[#ff8f2f] px-4 py-3 text-sm font-black">{itemCount > 0 ? `£${total.toFixed(2)} →` : "Start"}</span>
        </button>
      </section>
    </PhoneShell>
  );
}

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#dfe4e7] text-[#223546]">
      <div className="mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#f7f8f8] shadow-2xl shadow-slate-950/15 sm:my-6 sm:min-h-[820px] sm:rounded-[2.25rem]">
        {children}
      </div>
    </main>
  );
}

function TopBar({
  title,
  onBack,
  onRight,
  rightLabel,
}: {
  title: string;
  onBack: () => void;
  onRight: () => void;
  rightLabel: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#dde3e6] bg-[#f7f8f8]/95 px-4 backdrop-blur">
      <button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-white text-lg font-black ring-1 ring-[#dde3e6]">‹</button>
      <h1 className="text-base font-black text-[#223546]">{title}</h1>
      <button onClick={onRight} className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#223546] ring-1 ring-[#dde3e6]">{rightLabel}</button>
    </header>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-black ${active ? "bg-[#223546] text-white" : "bg-white text-[#5a6268] ring-1 ring-[#dde3e6]"}`}>
      {children}
    </button>
  );
}

function Stepper({ quantity, onMinus, onPlus, small = false }: { quantity: number; onMinus: () => void; onPlus: () => void; small?: boolean }) {
  return (
    <div className={`flex items-center gap-1 rounded-full bg-[#eef2f3] p-1 ${small ? "" : "w-full justify-between"}`}>
      <button onClick={onMinus} className={`${small ? "h-7 w-7" : "h-10 w-10"} grid place-items-center rounded-full bg-[#223546] text-sm font-black text-white`}>−</button>
      <span className={`${small ? "min-w-4 text-xs" : "flex-1 text-sm"} text-center font-black text-[#223546]`}>{quantity}</span>
      <button onClick={onPlus} className={`${small ? "h-7 w-7" : "h-10 w-10"} grid place-items-center rounded-full bg-[#ff8f2f] text-sm font-black text-white`}>+</button>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.6rem] bg-white p-8 text-center ring-1 ring-[#dde3e6]">
      <h2 className="text-xl font-black text-[#223546]">{title}</h2>
      <p className="mt-2 text-sm font-semibold text-[#7a858c]">{text}</p>
    </div>
  );
}

function FooterButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#f7f8f8]/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2.25rem]">
      <button onClick={onClick} className="min-h-14 w-full rounded-full bg-[#223546] text-sm font-black text-white shadow-xl shadow-slate-900/20">
        {children}
      </button>
    </section>
  );
}
