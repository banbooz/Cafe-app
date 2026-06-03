"use client";

import { useMemo, useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "Recommended" | "Drinks" | "Food" | "Bakery";
  graphic: string;
  tone: string;
  recommended?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Flat White",
    description: "Double espresso with smooth steamed milk.",
    price: 3.2,
    category: "Drinks",
    graphic: "☕",
    tone: "bg-[#efe1cf]",
    recommended: true,
  },
  {
    id: 2,
    name: "Iced Latte",
    description: "Cold milk, espresso, and ice.",
    price: 3.8,
    category: "Drinks",
    graphic: "🥤",
    tone: "bg-[#dbeafe]",
    recommended: true,
  },
  {
    id: 3,
    name: "Chicken Sandwich",
    description: "Fresh bread, chicken, salad, and house sauce.",
    price: 5.5,
    category: "Food",
    graphic: "🥪",
    tone: "bg-[#dcfce7]",
  },
  {
    id: 4,
    name: "Butter Croissant",
    description: "Flaky pastry baked fresh this morning.",
    price: 2.9,
    category: "Bakery",
    graphic: "🥐",
    tone: "bg-[#fef3c7]",
    recommended: true,
  },
  {
    id: 5,
    name: "Breakfast Bowl",
    description: "Granola, yoghurt, berries, and honey.",
    price: 6.4,
    category: "Food",
    graphic: "🥣",
    tone: "bg-[#f3e8ff]",
  },
  {
    id: 6,
    name: "Victoria Sponge",
    description: "Soft sponge cake with jam and cream.",
    price: 3.6,
    category: "Bakery",
    graphic: "🍰",
    tone: "bg-[#ffe4e6]",
    recommended: true,
  },
  {
    id: 7,
    name: "Avocado Toast",
    description: "Sourdough toast with avocado and chilli flakes.",
    price: 5.9,
    category: "Food",
    graphic: "🥑",
    tone: "bg-[#ecfccb]",
  },
  {
    id: 8,
    name: "Hot Chocolate",
    description: "Rich cocoa with steamed milk.",
    price: 3.4,
    category: "Drinks",
    graphic: "🍫",
    tone: "bg-[#e7d8c9]",
  },
];

const categories = [
  { label: "Recommended", short: "Top" },
  { label: "Drinks", short: "Drink" },
  { label: "Food", short: "Food" },
  { label: "Bakery", short: "Bake" },
] as const;

type Screen = "menu" | "checkout" | "confirmed";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<MenuItem["category"]>(
    "Recommended",
  );
  const [basket, setBasket] = useState<Record<number, number>>({});
  const [screen, setScreen] = useState<Screen>("menu");

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Recommended") {
      return menuItems.filter((item) => item.recommended);
    }
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const basketItems = menuItems
    .map((item) => ({ ...item, quantity: basket[item.id] || 0 }))
    .filter((item) => item.quantity > 0);

  const itemCount = basketItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = basketItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const serviceFee = itemCount > 0 ? 0.3 : 0;
  const total = subtotal + serviceFee;

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

  function goToCheckout() {
    if (itemCount === 0) return;
    setScreen("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function payOrder() {
    if (itemCount === 0) return;
    setBasket({});
    setScreen("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (screen === "confirmed") {
    return (
      <main className="min-h-screen bg-[#f6f1ea] text-[#20160f]">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fbfaf7] px-5 py-6 shadow-2xl shadow-stone-950/10 sm:my-6 sm:min-h-[820px] sm:rounded-[2rem]">
          <header className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Table 12
              </p>
              <h1 className="text-xl font-black">Cafe App</h1>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-2 text-xs font-black text-green-800">
              Paid
            </span>
          </header>

          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-green-100 text-5xl">
              ✓
            </div>
            <h2 className="mt-6 text-3xl font-black">Order confirmed</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-600">
              Your order has been paid for and sent to the cafe team. Stay at
              your table and staff will bring it over.
            </p>
            <button
              onClick={() => setScreen("menu")}
              className="mt-8 w-full rounded-2xl bg-[#20160f] px-5 py-4 text-sm font-black text-white"
            >
              Start another order
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (screen === "checkout") {
    return (
      <main className="min-h-screen bg-[#f6f1ea] text-[#20160f]">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#fbfaf7] shadow-2xl shadow-stone-950/10 sm:my-6 sm:rounded-[2rem]">
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#fbfaf7]/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setScreen("menu")}
                className="rounded-full bg-white px-4 py-3 text-sm font-black shadow-sm ring-1 ring-stone-200"
              >
                Back
              </button>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Table 12
                </p>
                <h1 className="text-xl font-black">Checkout</h1>
              </div>
            </div>
          </header>

          <section className="space-y-4 px-5 py-5 pb-32">
            <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <h2 className="text-lg font-black">Your order</h2>
              <div className="mt-4 space-y-3">
                {basketItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl ${item.tone} text-2xl`}
                    >
                      {item.graphic}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{item.name}</p>
                      <p className="text-xs font-semibold text-stone-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-black">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <h2 className="text-lg font-black">Pay by card</h2>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                    Name on card
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm font-bold outline-none focus:border-[#20160f]"
                    placeholder="Alex Smith"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                    Card number
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm font-bold outline-none focus:border-[#20160f]"
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                      Expiry
                    </span>
                    <input
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm font-bold outline-none focus:border-[#20160f]"
                      placeholder="12/28"
                      inputMode="numeric"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                      CVC
                    </span>
                    <input
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm font-bold outline-none focus:border-[#20160f]"
                      placeholder="123"
                      inputMode="numeric"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-stone-200 bg-[#fbfaf7]/95 p-4 shadow-2xl backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">
            <div className="mb-3 space-y-1 text-sm font-bold text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>£{serviceFee.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={payOrder}
              className="w-full rounded-2xl bg-[#20160f] px-5 py-4 text-sm font-black text-white shadow-lg shadow-stone-950/20"
            >
              Pay £{total.toFixed(2)}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#20160f]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#fbfaf7] shadow-2xl shadow-stone-950/10 sm:my-6 sm:rounded-[2rem]">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Table 12
              </p>
              <h1 className="text-xl font-black">Cafe App</h1>
            </div>
            <button
              onClick={goToCheckout}
              disabled={itemCount === 0}
              className="rounded-full bg-[#20160f] px-4 py-3 text-sm font-black text-white disabled:bg-stone-300 disabled:text-stone-500"
            >
              £{total.toFixed(2)}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-[76px_1fr] gap-0">
          <aside className="sticky top-[65px] h-[calc(100vh-65px)] border-r border-stone-200 bg-[#fbfaf7] px-2 py-4">
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category.label}
                  onClick={() => setSelectedCategory(category.label)}
                  className={`rounded-2xl px-2 py-3 text-xs font-black transition active:scale-95 ${
                    selectedCategory === category.label
                      ? "bg-[#20160f] text-white shadow-lg shadow-stone-950/15"
                      : "bg-white text-stone-600 ring-1 ring-stone-200"
                  }`}
                >
                  {category.short}
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 px-3 py-4 pb-44">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                Menu
              </p>
              <h2 className="text-2xl font-black">{selectedCategory}</h2>
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => {
                const quantity = basket[item.id] || 0;

                return (
                  <article
                    key={item.id}
                    className="rounded-[1.4rem] bg-white p-3 shadow-sm ring-1 ring-stone-200"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`grid h-24 w-24 shrink-0 place-items-center rounded-[1.2rem] ${item.tone} text-5xl`}
                        aria-hidden="true"
                      >
                        {item.graphic}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-black">
                              {item.name}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-600">
                              {item.description}
                            </p>
                          </div>
                          <p className="shrink-0 text-base font-black">
                            £{item.price.toFixed(2)}
                          </p>
                        </div>

                        {quantity === 0 ? (
                          <button
                            onClick={() => addItem(item.id)}
                            className="mt-3 w-full rounded-2xl bg-[#20160f] px-4 py-3 text-sm font-black text-white active:scale-[0.98]"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-100 p-1">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl font-black shadow-sm active:scale-95"
                              aria-label={`Remove ${item.name}`}
                            >
                              −
                            </button>
                            <span className="text-sm font-black">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addItem(item.id)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-[#20160f] text-xl font-black text-white active:scale-95"
                              aria-label={`Add ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <section className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-stone-200 bg-[#fbfaf7]/95 p-4 shadow-2xl backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">
          <div className="mb-3 max-h-28 space-y-2 overflow-y-auto">
            {basketItems.length === 0 ? (
              <p className="rounded-2xl bg-white p-3 text-sm font-bold text-stone-500 ring-1 ring-stone-200">
                Basket is empty
              </p>
            ) : (
              basketItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <p className="truncate font-bold">
                    {item.quantity}× {item.name}
                  </p>
                  <p className="font-black">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={goToCheckout}
            disabled={itemCount === 0}
            className="w-full rounded-2xl bg-[#20160f] px-5 py-4 text-sm font-black text-white shadow-lg shadow-stone-950/20 disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
          >
            Checkout · {itemCount} items · £{total.toFixed(2)}
          </button>
        </section>
      </div>
    </main>
  );
}
