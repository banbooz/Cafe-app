"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatus = "new" | "preparing" | "ready" | "served";

type KitchenOrder = {
  id: number;
  table: number;
  time: string;
  status: OrderStatus;
  notes?: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    allergens?: string[];
  }[];
};

const statusText: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
};

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-red-50 text-red-700 ring-red-200",
  preparing: "bg-amber-50 text-amber-800 ring-amber-200",
  ready: "bg-green-50 text-green-800 ring-green-200",
  served: "bg-stone-100 text-stone-500 ring-stone-200",
};

function nextStatus(status: OrderStatus): OrderStatus {
  if (status === "new") return "preparing";
  if (status === "preparing") return "ready";
  if (status === "ready") return "served";
  return "served";
}

function actionText(status: OrderStatus) {
  if (status === "new") return "Start preparing";
  if (status === "preparing") return "Mark ready";
  if (status === "ready") return "Mark served";
  return "Completed";
}

function loadOrders(): KitchenOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("cafeKitchenOrders") || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders: KitchenOrder[]) {
  window.localStorage.setItem("cafeKitchenOrders", JSON.stringify(orders));
}

export default function KitchenScreen() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "active">("active");

  useEffect(() => {
    setOrders(loadOrders());
    const timer = window.setInterval(() => setOrders(loadOrders()), 3000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleOrders = useMemo(() => {
    if (filter === "active") return orders.filter((order) => order.status !== "served");
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const counts = {
    active: orders.filter((order) => order.status !== "served").length,
    new: orders.filter((order) => order.status === "new").length,
    preparing: orders.filter((order) => order.status === "preparing").length,
    ready: orders.filter((order) => order.status === "ready").length,
  };

  function updateOrder(id: number) {
    setOrders((current) => {
      const next = current.map((order) => order.id === id ? { ...order, status: nextStatus(order.status) } : order);
      saveOrders(next);
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#20160f]">
      <div className="mx-auto min-h-screen w-full max-w-5xl bg-[#fbfaf7] shadow-2xl shadow-stone-950/10">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#fbfaf7]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Cafe App</p>
              <h1 className="text-2xl font-black sm:text-3xl">Kitchen orders</h1>
            </div>
            <a href="/" className="rounded-2xl bg-[#20160f] px-5 py-4 text-center text-sm font-black text-white shadow-lg shadow-stone-950/20">Customer view</a>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4 sm:px-6">
          {[
            ["active", "Active", counts.active],
            ["new", "New", counts.new],
            ["preparing", "Preparing", counts.preparing],
            ["ready", "Ready", counts.ready],
          ].map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key as OrderStatus | "active")} className={`rounded-3xl p-4 text-left shadow-sm ring-1 transition active:scale-[0.98] ${filter === key ? "bg-[#20160f] text-white ring-[#20160f]" : "bg-white text-[#20160f] ring-stone-200"}`}>
              <p className="text-3xl font-black">{count}</p>
              <p className="mt-1 text-sm font-black">{label}</p>
            </button>
          ))}
        </section>

        <section className="grid gap-4 px-4 pb-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {visibleOrders.map((order) => (
            <article key={order.id} className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">Order #{order.id}</p>
                  <h2 className="mt-1 text-3xl font-black">Table {order.table}</h2>
                  <p className="mt-1 text-sm font-bold text-stone-500">{order.time}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-2 text-xs font-black ring-1 ${statusStyles[order.status]}`}>{statusText[order.status]}</span>
              </div>

              {order.notes && <p className="mt-4 rounded-xl bg-yellow-50 px-3 py-2 text-sm font-bold text-yellow-900 ring-1 ring-yellow-100">Chef notes: {order.notes}</p>}

              <div className="space-y-3 py-4">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.name}`} className="rounded-2xl bg-stone-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-black">{item.name}</p>
                      <p className="rounded-full bg-white px-3 py-1 text-sm font-black shadow-sm">×{item.quantity}</p>
                    </div>
                    {item.allergens?.length ? <p className="mt-2 text-xs font-bold text-stone-500">Allergens: {item.allergens.join(", ")}</p> : null}
                  </div>
                ))}
              </div>

              <button onClick={() => updateOrder(order.id)} disabled={order.status === "served"} className="w-full rounded-2xl bg-[#20160f] px-4 py-4 text-sm font-black text-white shadow-lg shadow-stone-950/20 disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none">
                {actionText(order.status)}
              </button>
            </article>
          ))}

          {visibleOrders.length === 0 && (
            <div className="col-span-full rounded-[1.5rem] bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
              <h2 className="text-2xl font-black">No orders</h2>
              <p className="mt-2 text-sm font-semibold text-stone-500">Orders will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
