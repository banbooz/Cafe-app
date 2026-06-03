const menuItems = [
  {
    name: "Placeholder Coffee",
    description: "A warm drink placeholder for the demo menu.",
    price: "£3.20",
    category: "Drinks",
  },
  {
    name: "Placeholder Iced Drink",
    description: "A cold drink placeholder with space for flavours.",
    price: "£3.80",
    category: "Drinks",
  },
  {
    name: "Placeholder Sandwich",
    description: "A simple lunch item placeholder for testing orders.",
    price: "£5.50",
    category: "Food",
  },
  {
    name: "Placeholder Pastry",
    description: "A bakery item placeholder for cakes, pastries, or snacks.",
    price: "£2.90",
    category: "Bakery",
  },
  {
    name: "Placeholder Breakfast Bowl",
    description: "A breakfast placeholder for future real menu items.",
    price: "£6.40",
    category: "Food",
  },
  {
    name: "Placeholder Cake Slice",
    description: "A dessert placeholder for the menu demo.",
    price: "£3.60",
    category: "Bakery",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff8ef] text-[#24160f]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 sm:px-10 lg:px-12">
        <nav className="flex items-center justify-between rounded-full bg-white/80 px-5 py-4 shadow-sm ring-1 ring-black/5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">
              Table QR Ordering
            </p>
            <h1 className="text-xl font-black">Cafe App</h1>
          </div>
          <a
            href="#menu"
            className="rounded-full bg-[#24160f] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:scale-105"
          >
            View menu
          </a>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-orange-900/10 ring-1 ring-black/5 sm:p-12">
            <p className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800">
              Scan. Order. Pay. Done.
            </p>
            <h2 className="max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">
              Simple phone ordering for small cafes.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
              Customers scan a QR code at their table, choose placeholder menu
              items, and send an order demo to the cafe dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#menu"
                className="rounded-full bg-orange-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                Start order demo
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-stone-300 bg-white px-6 py-4 text-center font-bold transition hover:bg-stone-50"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#24160f] p-6 text-white shadow-xl shadow-orange-900/20">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-200">
                Demo table
              </p>
              <div className="mt-5 rounded-3xl bg-white p-6 text-[#24160f]">
                <div className="mx-auto grid h-40 w-40 place-items-center rounded-2xl border-8 border-[#24160f] bg-white text-center text-sm font-black">
                  QR
                  <br />
                  TABLE 12
                </div>
                <p className="mt-5 text-center text-sm font-semibold text-stone-600">
                  Example link: /table/12
                </p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm font-bold">
                <div className="rounded-2xl bg-white/10 p-4">Menu</div>
                <div className="rounded-2xl bg-white/10 p-4">Basket</div>
                <div className="rounded-2xl bg-white/10 p-4">Order</div>
              </div>
            </div>
          </div>
        </div>

        <section id="how-it-works" className="grid gap-4 md:grid-cols-3">
          {[
            ["1", "Scan QR", "Customer scans the table QR code with their phone."],
            ["2", "Choose items", "They pick placeholder food and drink items from the menu."],
            ["3", "Send order", "The order would later go to a staff dashboard."],
          ].map(([number, title, text]) => (
            <div key={title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-xl font-black text-orange-700">
                {number}
              </div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-2 leading-7 text-stone-600">{text}</p>
            </div>
          ))}
        </section>

        <section id="menu" className="rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-900/10 ring-1 ring-black/5 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-700">
                Demo menu
              </p>
              <h2 className="mt-2 text-3xl font-black">Placeholder items</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-600">
              These are not real cafe products yet. They are just here to show
              how the ordering page will look.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item.name}
                className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-[#fffaf3] p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <p className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                    {item.category}
                  </p>
                  <h3 className="text-xl font-black">{item.name}</h3>
                  <p className="mt-2 min-h-14 leading-6 text-stone-600">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-2xl font-black">{item.price}</span>
                  <button className="rounded-full bg-[#24160f] px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700">
                    Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
