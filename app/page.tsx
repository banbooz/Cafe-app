const menuItems = [
  {
    name: "Placeholder Coffee",
    description: "Demo hot drink item.",
    price: "£3.20",
    category: "Drinks",
  },
  {
    name: "Placeholder Iced Drink",
    description: "Demo cold drink item.",
    price: "£3.80",
    category: "Drinks",
  },
  {
    name: "Placeholder Sandwich",
    description: "Demo lunch item.",
    price: "£5.50",
    category: "Food",
  },
  {
    name: "Placeholder Pastry",
    description: "Demo bakery item.",
    price: "£2.90",
    category: "Bakery",
  },
  {
    name: "Placeholder Breakfast Bowl",
    description: "Demo breakfast item.",
    price: "£6.40",
    category: "Food",
  },
  {
    name: "Placeholder Cake Slice",
    description: "Demo dessert item.",
    price: "£3.60",
    category: "Bakery",
  },
];

const categories = ["All", "Drinks", "Food", "Bakery"];

export default function Home() {
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
              Basket · £0.00
            </a>
          </div>
        </header>

        <section className="px-4 pb-4 pt-5">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-orange-600 to-amber-500 p-5 text-white shadow-xl shadow-orange-700/20">
            <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              QR table ordering demo
            </p>
            <h2 className="text-3xl font-black leading-tight">
              Order from your table in seconds.
            </h2>
            <p className="mt-3 text-sm leading-6 text-orange-50">
              Mobile-first menu layout made for customers scanning a QR code in
              a cafe. No app download needed.
            </p>
            <a
              href="#menu"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-orange-700"
            >
              Start order
            </a>
          </div>
        </section>

        <section className="px-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-stone-700">
            <div className="rounded-2xl bg-stone-100 p-3">
              <span className="block text-lg">1</span>
              Scan
            </div>
            <div className="rounded-2xl bg-stone-100 p-3">
              <span className="block text-lg">2</span>
              Pick
            </div>
            <div className="rounded-2xl bg-stone-100 p-3">
              <span className="block text-lg">3</span>
              Pay
            </div>
          </div>
        </section>

        <section id="menu" className="px-4 py-6">
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

          <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map((category) => (
              <button
                key={category}
                className={`shrink-0 rounded-full px-4 py-3 text-sm font-black ${
                  category === "All"
                    ? "bg-[#21140d] text-white"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-3 pb-28">
            {menuItems.map((item) => (
              <article
                key={item.name}
                className="flex gap-3 rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"
              >
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-orange-100 text-center text-xs font-black text-orange-700">
                  ITEM
                  <br />
                  IMAGE
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
                    <p className="shrink-0 text-base font-black">{item.price}</p>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-stone-600">
                    {item.description}
                  </p>
                  <button className="mt-3 w-full rounded-2xl bg-[#21140d] px-4 py-3 text-sm font-black text-white active:scale-[0.98]">
                    Add to basket
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="basket"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-stone-200 bg-white/95 p-4 backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-500">Basket demo</p>
              <p className="text-lg font-black">0 items · £0.00</p>
            </div>
            <button className="rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20">
              Checkout
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
