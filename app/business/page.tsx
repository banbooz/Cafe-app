"use client";

import { useEffect, useMemo, useState } from "react";
import AvailabilityControls from "../components/AvailabilityControls";
import { cafeConfig } from "../lib/cafeConfig";
import { menuItems, money } from "../lib/menu";
import { readKitchenOrders, subscribeToKitchenOrders, type KitchenOrder } from "../lib/orders";

function getItemCategory(itemId: number | undefined, itemName: string) {
  return menuItems.find((item) => item.id === itemId || item.name === itemName)?.category || "Other";
}

function getAnalytics(orders: KitchenOrder[]) {
  const itemTotals: Record<string, number> = {};
  const categoryTotals: Record<string, number> = {};
  let itemCount = 0;
  let revenue = 0;

  orders.forEach((order) => {
    revenue += order.total;
    order.items.forEach((item) => {
      const category = getItemCategory(item.id, item.name);
      itemTotals[item.name] = (itemTotals[item.name] || 0) + item.quantity;
      categoryTotals[category] = (categoryTotals[category] || 0) + item.quantity;
      itemCount += item.quantity;
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
    topItem: itemsRanked[0] || { name: "No orders", qty: 0 },
    topCategory: categoriesRanked[0] || { name: "No data", qty: 0 },
    itemsRanked,
    categoriesRanked,
  };
}

export default function BusinessDashboard() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    function refreshOrders() {
      setOrders(readKitchenOrders());
    }

    refreshOrders();
    return subscribeToKitchenOrders(refreshOrders);
  }, []);

  const analytics = useMemo(() => getAnalytics(orders), [orders]);

  return (
    <main className="min-h-screen bg-[#eef1f3] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] bg-[#111827] p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Business dashboard · {cafeConfig.id}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{cafeConfig.name}</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                Track live orders, sales, menu performance and item availability for this café only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/kitchen" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white/10 px-5 text-sm font-black text-white">
                Open kitchen view
              </a>
              <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-950">
                Open customer view
              </a>
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Orders today" value={String(analytics.orderCount)} detail={`${analytics.itemCount} items sold`} />
          <Metric label="App revenue" value={money(analytics.revenue)} detail={`${money(analytics.averageOrder)} average order`} />
          <Metric label="Most ordered item" value={analytics.topItem.name} detail={`${analytics.topItem.qty} sold today`} />
          <Metric label="Best category" value={analytics.topCategory.name} detail={`${analytics.topCategory.qty} items ordered`} />
        </div>

        <div className="mt-5">
          <AvailabilityControls section="Business" />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Menu performance</p>
                <h2 className="mt-1 text-xl font-black">Most ordered items</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Live</span>
            </div>

            {analytics.itemsRanked.length ? (
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
            ) : (
              <EmptyState title="No item data" text={`Most ordered items for ${cafeConfig.name} will appear here.`} />
            )}
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Order split</p>
            <h2 className="mt-1 text-xl font-black">Categories</h2>
            {analytics.categoriesRanked.length ? (
              <div className="mt-5 space-y-3">
                {analytics.categoriesRanked.map((category) => (
                  <div key={category.name} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <span className="font-black">{category.name}</span>
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{category.qty} items</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No category data" text={`Category performance for ${cafeConfig.name} will appear here.`} />
            )}
          </section>
        </div>

        <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Orders</p>
              <h2 className="mt-1 text-xl font-black">Recent orders</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{orders.length ? "Live orders" : "No orders"}</span>
          </div>

          {orders.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-slate-400">Order #{order.id}</p>
                      <h3 className="mt-1 font-black">Table {order.table}</h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{order.status}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
                    {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400">{order.time}</span>
                    <span className="font-black">{money(order.total)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders" text={`Orders for ${cafeConfig.name} will appear here when they are placed.`} />
          )}
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

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <h3 className="font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{text}</p>
    </div>
  );
}
