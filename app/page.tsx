"use client";

import { useMemo, useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  accent: string;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Placeholder Coffee",
    description: "Demo hot drink item.",
    price: 3.2,
    category: "Drinks",
    image: "☕",
    accent: "from-amber-100 to-orange-200",
  },
  {
    id: 2,
    name: "Placeholder Iced Drink",
    description: "Demo cold drink item.",
    price: 3.8,
    category: "Drinks",
    image: "🥤",
    accent: "from-cyan-100 to-blue-200",
  },
  {
    id: 3,
    name: "Placeholder Sandwich",
    description: "Demo lunch item.",
    price: 5.5,
    category: "Food",
    image: "🥪",
    accent: "from-lime-100 to-green-200",
  },
  {
    id: 4,
    name: "Placeholder Pastry",
    description: "Demo bakery item.",
    price: 2.9,
    category: "Bakery",
    image: "🥐",
    accent: "from-yellow-100 to-amber-200",
  },
  {
    id: 5,
    name: "Placeholder Breakfast Bowl",
    description: "Demo breakfast item.",
    price: 6.4,
    category: "Food",
    image: "🥣",
    accent: "from-purple-100 to-pink-200",
  },
  {
    id: 6,
    name: "Placeholder Cake Slice",
    description: "Demo dessert item.",
    price: 3.6,
    category: "Bakery",
    image: "🍰",
    accent: "from-pink-100 to-rose-200",
  },
];

const categories = ["All", "Drinks", "Food", "Bakery"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [basket, setBasket] = useState<Record<number, number>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const basketItems = menuItems
    .map((item) => ({ ...item, quantity: basket[item.id] || 0 }))
    .filter((item) => item.quantity > 0);

  const itemCount = basketItems.reduce((total, item) => total + item.quantity, 0);
  const total = basketItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function addItem(id: number) {
    setOrderPlaced(false);
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

  function placeOrder() {
    if (itemCount === 0) return;
    setOrderPlaced(true);
    setBasket({});
  }

  return (
    <main className="min-h-screen bg-[#fff7ed] text-[#21140d]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-2xl shadow-orange-950/10 sm:my-6 sm:rounded-[2rem]">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">
                Table 12
              </p>
              <h1 className="text-xl font-black">Cafe App</h1>
            </div>
            <a
              href="#basket"
              className="rounded-full bg-[#21140d] px-4 py-3 text-sm font-black text-white"
            >
              Basket · £{total.toFixed(2)}
            </a>
          </div>
        </header>

        {orderPlaced && (
          <section className="px-4 pt-4">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-green-900">
              <p className="font-black">Order sent</p>
              <p className="mt-1 text-sm font-semibold">
                Demo order sent to the cafe staff screen.
              </p>
            </div>
          </section>
        )}

        <section className="px-4 py-5">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-orange-600 to-amber-500 p-5 text-white shadow-xl shadow-orange-700/20">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/25 text-5xl shadow-inner">
                🍰
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">
                  QR menu
                </p>
                <h2 className="text-2xl font-black leading-tight">
                  Browse the cafe menu.
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-orange-50">
              Choose food and drinks, add them to your basket, then send a demo
              order from your phone.
            </p>
          </div>
        </section>

        <section id="menu" className="px-4 pb-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">
                Menu
              </p>
              <h2 className="text-2xl font-black">Placeholder items</h2>
            </div>
            <p className="text-right text-xs font-semibold text-stone-500">
              Demo only
            </p>
          </div>

          <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-3 text-sm font-black transition active:scale-95 ${
                  selectedCategory === category
                    ? "bg-[#21140d] text-white"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-3 pb-72">
            {filteredItems.map((item) => {
              const quantity = basket[item.id] || 0;

              return (
                <article
                  key={item.id}
                  className="flex gap-3 rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"
                >
                  <div
                    className={`grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${item.accent} text-5xl`}
                    aria-hidden="true"
                  >
                    {item.image}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-orange-700">
                          {item.category}
                        </p>
                        <h3 className="text-base font-black leading-tight">
                          {item.name}
                        </h3>
                      </div>
                      <p className="shrink-0 text-base font-black">
                        £{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-stone-600">
                      {item.description}
                    </p>

                    {quantity === 0 ? (
                      <button
                        onClick={() => addItem(item.id)}
                        className="mt-3 w-full rounded-2xl bg-[#21140d] px-4 py-3 text-sm font-black text-white active:scale-[0.98]"
                      >
                        Add to basket
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
                          {quantity} added
                        </span>
                        <button
                          onClick={() => addItem(item.id)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-[#21140d] text-xl font-black text-white active:scale-95"
                          aria-label={`Add ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="basket"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-stone-200 bg-white/95 p-4 shadow-2xl backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]"
        >
          <div className="mb-3 max-h-32 space-y-2 overflow-y-auto">
            {basketItems.length === 0 ? (
              <p className="rounded-2xl bg-stone-100 p-3 text-sm font-bold text-stone-500">
                Your basket is empty.
              </p>
            ) : (
              basketItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <p className="font-bold">
                    {item.quantity}× {item.name}
                  </p>
                  <p className="font-black">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-500">Basket</p>
              <p className="text-lg font-black">
                {itemCount} items · £{total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={placeOrder}
              disabled={itemCount === 0}
              className="rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
            >
              Checkout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
