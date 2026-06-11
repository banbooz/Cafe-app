const orders = [
  {
    id: 5128,
    table: 4,
    type: "Dine in",
    total: 18.3,
    time: "09:18",
    items: [
      { name: "Flat White", qty: 2, category: "Coffee" },
      { name: "Smashed Avocado Toast", qty: 1, category: "Breakfast" },
      { name: "Almond Croissant", qty: 1, category: "Desserts" },
    ],
  },
  {
    id: 5190,
    table: 2,
    type: "Takeaway",
    total: 10.4,
    time: "10:02",
    items: [
      { name: "Iced Latte", qty: 1, category: "Cold" },
      { name: "Biscoff Cheesecake", qty: 1, category: "Desserts" },
    ],
  },
  {
    id: 5234,
    table: 7,
    type: "Dine in",
    total: 26.94,
    time: "12:41",
    items: [
      { name: "Roast Chicken Ciabatta", qty: 2, category: "Lunch" },
      { name: "Garlic Dough Bites", qty: 1, category: "Starters" },
      { name: "Flat White", qty: 1, category: "Coffee" },
    ],
  },
  {
    id: 5269,
    table: 9,
    type: "Dine in",
    total: 21.64,
    time: "13:08",
    items: [
      { name: "Tomato Basil Spaghetti", qty: 1, category: "Lunch" },
      { name: "Halloumi Fries", qty: 1, category: "Starters" },
      { name: "Fresh Lemonade", qty: 2, category: "Cold" },
    ],
  },
];

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

function getAnalytics() {
  const itemTotals: Record<string, number> = {};
  const categoryTotals: Record<string, number> = {};
  let itemCount = 0;
  let revenue = 0;

  orders.forEach((order) => {
    revenue += order.total;
    order.items.forEach((item) => {
      itemTotals[item.name] = (itemTotals[item.name] || 0) + item.qty;
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.qty;
      itemCount += item.qty;
    });
  });

  const itemsRanked = Object.entries(itemTotals)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);

  const categoriesRanked = Object.entries(categoryTotals)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);

  return {
    orderCount: orders.length,
    itemCount,
    revenue,
    averageOrder: orders.length ? revenue / orders.length : 0,
    topItem: itemsRanked[0] || { name: "No orders yet", qty: 0 },
    topCategory: categoriesRanked[0] || { name: "No data", qty: 0 },
    itemsRanked,
    categoriesRanked,
  };
}

export default function BusinessDashboard() {
  const analytics = getAnalytics();

  return (
    <main className="min-h-screen bg-[#eef1f3] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] bg-[#111827] p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Business dashboard</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">The Corner Cafe</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                Simple analytics for orders made through the app. This page is open for now, ready for a passcode lock later.
              </p>
            </div>
            <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-950">
              Open customer view
            </a>
          </div>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Orders today" value={String(analytics.orderCount)} detail={`${analytics.itemCount} items sold`} />
          <Metric label="App revenue" value={money(analytics.revenue)} detail={`${money(analytics.averageOrder)} average order`} />
          <Metric label="Most ordered item" value={analytics.topItem.name} detail={`${analytics.topItem.qty} sold today`} />
          <Metric label="Best category" value={analytics.topCategory.name} detail={`${analytics.topCategory.qty} items ordered`} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Menu performance</p>
                <h2 className="mt-1 text-xl font-black">Most ordered items</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Today</span>
            </div>

            <div className="mt-5 space-y-3">
              {analytics.itemsRanked.slice(0, 6).map((item, index) => (
                <div key={item.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-400">#{index + 1}</p>
                      <h3 className="truncate font-black">{item.name}</h3>
                    </div>
                    <p className="shrink-0 text-sm font-black">{item.qty} sold</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${Math.max(12, (item.qty / Math.max(1, analytics.topItem.qty)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Order split</p>
            <h2 className="mt-1 text-xl font-black">Categories</h2>
            <div className="mt-5 space-y-3">
              {analytics.categoriesRanked.map((category) => (
                <div key={category.name} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <span className="font-black">{category.name}</span>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{category.qty} items</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Live orders</p>
              <h2 className="mt-1 text-xl font-black">Recent app orders</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Active</span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-400">Order #{order.id}</p>
                    <h3 className="mt-1 font-black">Table {order.table}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{order.type}</span>
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
                  {order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">{order.time}</span>
                  <span className="font-black">{money(order.total)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <h2 className="mt-3 truncate text-2xl font-black text-slate-950">{value}</h2>
      <p className="mt-2 text-sm font-bold text-slate-500">{detail}</p>
    </article>
  );
}
