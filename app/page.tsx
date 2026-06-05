"use client";

import { useMemo, useState } from "react";

type Category = "Recommended" | "Drinks" | "Food" | "Bakery";
type Screen = "menu" | "checkout" | "confirmed" | "allergens";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  allergens: string[];
  recommended?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Flat White",
    description: "Double espresso, steamed milk, smooth microfoam.",
    price: 3.2,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80",
    allergens: ["Milk"],
    recommended: true,
  },
  {
    id: 2,
    name: "Iced Latte",
    description: "Chilled espresso over milk and ice.",
    price: 3.8,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80",
    allergens: ["Milk"],
    recommended: true,
  },
  {
    id: 3,
    name: "Chicken Sandwich",
    description: "Fresh bread, roast chicken, leaves, house dressing.",
    price: 5.5,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80",
    allergens: ["Gluten", "Egg", "Mustard"],
  },
  {
    id: 4,
    name: "Butter Croissant",
    description: "Flaky pastry baked fresh every morning.",
    price: 2.9,
    category: "Bakery",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    recommended: true,
  },
  {
    id: 5,
    name: "Breakfast Bowl",
    description: "Granola, yoghurt, berries, honey, seeds.",
    price: 6.4,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=500&q=80",
    allergens: ["Milk", "Nuts"],
  },
  {
    id: 6,
    name: "Victoria Sponge",
    description: "Soft sponge cake, jam, cream, icing sugar.",
    price: 3.6,
    category: "Bakery",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80",
    allergens: ["Gluten", "Milk", "Egg"],
    recommended: true,
  },
  {
    id: 7,
    name: "Avocado Toast",
    description: "Sourdough toast, avocado, chilli, lemon.",
    price: 5.9,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=500&q=80",
    allergens: ["Gluten"],
  },
  {
    id: 8,
    name: "Hot Chocolate",
    description: "Rich cocoa, steamed milk, chocolate dusting.",
    price: 3.4,
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?auto=format&fit=crop&w=500&q=80",
    allergens: ["Milk"],
  },
];

const categories: { label: Category; short: string }[] = [
  { label: "Recommended", short: "Top" },
  { label: "Drinks", short: "Drink" },
  { label: "Food", short: "Food" },
  { label: "Bakery", short: "Bake" },
];

const commonAllergens = [
  "Milk",
  "Gluten",
  "Egg",
  "Nuts",
  "Mustard",
  "Soya",
  "Sesame",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Recommended");
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

  function openScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToCheckout() {
    if (itemCount === 0) return;
    openScreen("checkout");
  }

  function payOrder() {
    if (itemCount === 0) return;
    setBasket({});
    openScreen("confirmed");
  }

  if (screen === "confirmed") {
    return (
      <main className="min-h-screen bg-[#efebe4] text-[#1d1712]">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#faf8f4] px-5 py-6 shadow-2xl shadow-stone-950/10 sm:my-6 sm:min-h-[820px] sm:rounded-[2rem]">
          <Header title="Order confirmed" table="12" onAllergens={() => openScreen("allergens")} />
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-[#133c2f] text-5xl text-white">
              ✓
            </div>
            <h1 className="mt-6 text-3xl font-black">Payment received</h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-600">
              Your order has been sent to the kitchen. Please stay at table 12.
            </p>
            <button
              onClick={() => openScreen("menu")}
              className="mt-8 min-h-12 w-full rounded-2xl bg-[#1d1712] px-5 py-4 text-sm font-black text-white"
            >
              Start another order
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (screen === "allergens") {
    return (
      <main className="min-h-screen bg-[#efebe4] text-[#1d1712]">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#faf8f4] shadow-2xl shadow-stone-950/10 sm:my-6 sm:rounded-[2rem]">
          <section className="sticky top-0 z-30 border-b border-stone-200 bg-[#faf8f4]/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => openScreen("menu")}
                className="min-h-12 rounded-2xl bg-white px-4 py-3 text-sm font-black shadow-sm ring-1 ring-stone-200"
              >
                Back
              </button>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                  Food safety
                </p>
                <h1 className="text-xl font-black">Allergens</h1>
              </div>
            </div>
          </section>

          <section className="space-y-4 px-5 py-5 pb-28">
            <div className="rounded-[1.5rem] bg-[#1d1712] p-5 text-white">
              <h2 className="text-xl font-black">Before ordering</h2>
              <p className="mt-2 text-sm leading-6 text-stone-200">
                Speak to staff if you have a serious allergy. Kitchen cross-contact can happen.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <h2 className="font-black">Common allergens</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {commonAllergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-700"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {menuItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-stone-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                        {item.category}
                      </p>
                      <h3 className="mt-1 text-lg font-black">{item.name}</h3>
                    </div>
                    <p className="text-sm font-black">£{item.price.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="rounded-full bg-[#f4eee6] px-3 py-2 text-xs font-black text-[#5c4633]"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <BottomBar
            itemCount={itemCount}
            total={total}
            onMenu={() => openScreen("menu")}
            onAllergens={() => openScreen("allergens")}
            onCheckout={goToCheckout}
          />
        </div>
      </main>
    );
  }

  if (screen === "checkout") {
    return (
      <main className="min-h-screen bg-[#efebe4] text-[#1d1712]">
        <div className="mx-auto min-h-screen w-full max-w-md bg-[#faf8f4] shadow-2xl shadow-stone-950/10 sm:my-6 sm:rounded-[2rem]">
          <section className="sticky top-0 z-30 border-b border-stone-200 bg-[#faf8f4]/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => openScreen("menu")}
                className="min-h-12 rounded-2xl bg-white px-4 py-3 text-sm font-black shadow-sm ring-1 ring-stone-200"
              >
                Back
              </button>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                  Table 12
                </p>
                <h1 className="text-xl font-black">Checkout</h1>
              </div>
            </div>
          </section>

          <section className="space-y-4 px-5 py-5 pb-40">
            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <h2 className="text-lg font-black">Order summary</h2>
              <div className="mt-4 space-y-3">
                {basketItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="h-14 w-14 rounded-2xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                      aria-label={item.name}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{item.name}</p>
                      <p className="text-xs font-semibold text-stone-500">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <h2 className="text-lg font-black">Payment</h2>
              <p className="mt-1 text-sm font-semibold text-stone-500">
                Secure card payment will connect to Stripe later.
              </p>
              <div className="mt-4 space-y-3">
                <input className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold outline-none focus:border-[#1d1712]" placeholder="Name on card" />
                <input className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold outline-none focus:border-[#1d1712]" placeholder="4242 4242 4242 4242" inputMode="numeric" />
                <div className="grid grid-cols-2 gap-3">
                  <input className="min-h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold outline-none focus:border-[#1d1712]" placeholder="MM/YY" inputMode="numeric" />
                  <input className="min-h-12 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold outline-none focus:border-[#1d1712]" placeholder="CVC" inputMode="numeric" />
                </div>
              </div>
            </div>
          </section>

          <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-stone-200 bg-[#faf8f4]/95 p-4 shadow-2xl backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">
            <div className="mb-3 space-y-1 text-sm font-bold text-stone-600">
              <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Service fee</span><span>£{serviceFee.toFixed(2)}</span></div>
            </div>
            <button onClick={payOrder} className="min-h-12 w-full rounded-2xl bg-[#1d1712] px-5 py-4 text-sm font-black text-white shadow-lg shadow-stone-950/20">
              Pay £{total.toFixed(2)}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#efebe4] text-[#1d1712]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#faf8f4] shadow-2xl shadow-stone-950/10 sm:my-6 sm:rounded-[2rem]">
        <Header title="Cafe App" table="12" onAllergens={() => openScreen("allergens")} />

        <section className="px-4 py-3">
          <div className="rounded-[1.25rem] bg-white px-4 py-3 shadow-sm ring-1 ring-stone-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">Today</p>
                <p className="text-sm font-black">Open · approx 8–12 min</p>
              </div>
              <button
                onClick={() => openScreen("allergens")}
                className="min-h-11 rounded-2xl bg-[#f4eee6] px-4 text-sm font-black text-[#5c4633]"
              >
                Allergens
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[78px_1fr] gap-0">
          <aside className="sticky top-[69px] h-[calc(100vh-69px)] border-r border-stone-200 bg-[#faf8f4] px-2 py-4">
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category.label}
                  onClick={() => setSelectedCategory(category.label)}
                  className={`min-h-12 rounded-2xl px-2 py-3 text-xs font-black transition active:scale-95 ${
                    selectedCategory === category.label
                      ? "bg-[#1d1712] text-white shadow-lg shadow-stone-950/15"
                      : "bg-white text-stone-600 ring-1 ring-stone-200"
                  }`}
                >
                  {category.short}
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 px-3 py-4 pb-44">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">Menu</p>
                <h1 className="text-2xl font-black">{selectedCategory}</h1>
              </div>
              <p className="text-xs font-black text-stone-500">{filteredItems.length} items</p>
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => {
                const quantity = basket[item.id] || 0;
                return (
                  <article key={item.id} className="overflow-hidden rounded-[1.35rem] bg-white shadow-sm ring-1 ring-stone-200">
                    <div
                      className="h-32 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                      aria-label={item.name}
                    />
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-base font-black leading-tight">{item.name}</h2>
                          <p className="mt-1 text-sm leading-5 text-stone-600">{item.description}</p>
                        </div>
                        <p className="shrink-0 text-base font-black">£{item.price.toFixed(2)}</p>
                      </div>

                      <button
                        onClick={() => openScreen("allergens")}
                        className="mt-3 rounded-full bg-[#f4eee6] px-3 py-2 text-xs font-black text-[#5c4633]"
                      >
                        Allergen info
                      </button>

                      {quantity === 0 ? (
                        <button
                          onClick={() => addItem(item.id)}
                          className="mt-3 min-h-12 w-full rounded-2xl bg-[#1d1712] px-4 py-3 text-sm font-black text-white active:scale-[0.98]"
                        >
                          Add to order
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-100 p-1">
                          <button onClick={() => removeItem(item.id)} className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl font-black shadow-sm active:scale-95" aria-label={`Remove ${item.name}`}>−</button>
                          <span className="text-sm font-black">{quantity}</span>
                          <button onClick={() => addItem(item.id)} className="grid h-11 w-11 place-items-center rounded-xl bg-[#1d1712] text-xl font-black text-white active:scale-95" aria-label={`Add ${item.name}`}>+</button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <BottomBar
          itemCount={itemCount}
          total={total}
          onMenu={() => openScreen("menu")}
          onAllergens={() => openScreen("allergens")}
          onCheckout={goToCheckout}
        />
      </div>
    </main>
  );
}

function Header({
  title,
  table,
  onAllergens,
}: {
  title: string;
  table: string;
  onAllergens: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#faf8f4]/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">Table {table}</p>
          <h1 className="text-xl font-black">{title}</h1>
        </div>
        <button
          onClick={onAllergens}
          className="min-h-11 rounded-2xl bg-white px-4 text-sm font-black text-[#1d1712] shadow-sm ring-1 ring-stone-200"
        >
          Allergens
        </button>
      </div>
    </header>
  );
}

function BottomBar({
  itemCount,
  total,
  onMenu,
  onAllergens,
  onCheckout,
}: {
  itemCount: number;
  total: number;
  onMenu: () => void;
  onAllergens: () => void;
  onCheckout: () => void;
}) {
  return (
    <section className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-stone-200 bg-[#faf8f4]/95 p-3 shadow-2xl backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">
      <div className="grid grid-cols-[1fr_1fr_2fr] gap-2">
        <button onClick={onMenu} className="min-h-12 rounded-2xl bg-white text-xs font-black text-stone-700 shadow-sm ring-1 ring-stone-200">Menu</button>
        <button onClick={onAllergens} className="min-h-12 rounded-2xl bg-white text-xs font-black text-stone-700 shadow-sm ring-1 ring-stone-200">Allergens</button>
        <button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className="min-h-12 rounded-2xl bg-[#1d1712] px-3 text-sm font-black text-white shadow-lg shadow-stone-950/20 disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
        >
          {itemCount === 0 ? "Basket empty" : `Checkout · £${total.toFixed(2)}`}
        </button>
      </div>
    </section>
  );
}
