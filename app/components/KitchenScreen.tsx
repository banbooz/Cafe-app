"use client";

import { useEffect, useMemo, useState } from "react";
import AvailabilityControls from "./AvailabilityControls";
import DietaryBadges from "./DietaryBadges";
import { cafeConfig } from "../lib/cafeConfig";
import { menuExperiences, staffRoute, type MenuExperienceId } from "../lib/menu";
import { orderTypeText, readKitchenOrders, subscribeToKitchenOrders, writeKitchenOrders, type KitchenOrder, type OrderStatus, type WaiterCallType } from "../lib/orders";

const statusText: Record<OrderStatus, string> = { new: "New", preparing: "Preparing", ready: "Ready", served: "Served" };
const statusStyles: Record<OrderStatus, string> = {
  new: "bg-red-50 text-red-700 ring-red-200",
  preparing: "bg-amber-50 text-amber-800 ring-amber-200",
  ready: "bg-green-50 text-green-800 ring-green-200",
  served: "bg-stone-100 text-stone-500 ring-stone-200",
};
const pageThemes: Record<MenuExperienceId, { shell: string; panel: string; header: string; button: string; text: string }> = {
  restaurant: { shell: "bg-[#ebe6dd]", panel: "bg-[#fbfaf7]", header: "bg-[#fbfaf7]/95", button: "bg-[#2f2420] text-white", text: "text-[#241c18]" },
  cafe: { shell: "bg-[#f6ead8]", panel: "bg-[#fffaf3]", header: "bg-[#fffaf3]/95", button: "bg-[#c9843b] text-white", text: "text-[#2f2a24]" },
  drinks: { shell: "bg-[#171312]", panel: "bg-[#241c1a]", header: "bg-[#241c1a]/95", button: "bg-[#d7a048] text-[#111]", text: "text-[#fff8f0]" },
};

type Props = { experienceMode?: MenuExperienceId };

function nextKitchenStatus(status: OrderStatus): OrderStatus {
  if (status === "new") return "preparing";
  if (status === "preparing") return "ready";
  return status;
}

function actionText(status: OrderStatus) {
  if (status === "new") return "Start preparing";
  if (status === "preparing") return "Mark ready + call waiter";
  if (status === "ready") return "Ready for waiter";
  return "Completed by waiter";
}

function waiterCallMessage(type: WaiterCallType) {
  return type === "help" ? "Kitchen needs waiter help" : "Order ready for waiter collection";
}

function orderMatchesModel(order: KitchenOrder, experienceMode: MenuExperienceId) {
  return (order.orderType || "restaurant") === experienceMode;
}

function waiterRoute(experienceMode: MenuExperienceId) {
  return experienceMode === "restaurant" ? "/waiter" : `/waiter/${experienceMode}`;
}

export default function KitchenScreen({ experienceMode = "restaurant" }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "active">("active");
  const experience = menuExperiences[experienceMode];
  const pageTheme = pageThemes[experienceMode];

  useEffect(() => {
    function refreshOrders() { setOrders(readKitchenOrders()); }
    refreshOrders();
    return subscribeToKitchenOrders(refreshOrders);
  }, []);

  const scopedOrders = useMemo(() => orders.filter((order) => orderMatchesModel(order, experienceMode)), [experienceMode, orders]);
  const visibleOrders = useMemo(() => filter === "active" ? scopedOrders.filter((order) => order.status !== "served") : scopedOrders.filter((order) => order.status === filter), [filter, scopedOrders]);
  const counts = {
    active: scopedOrders.filter((order) => order.status !== "served").length,
    new: scopedOrders.filter((order) => order.status === "new").length,
    preparing: scopedOrders.filter((order) => order.status === "preparing").length,
    ready: scopedOrders.filter((order) => order.status === "ready").length,
  };

  function updateOrder(id: number) {
    setOrders((current) => {
      const next = current.map((order) => {
        if (order.id !== id) return order;
        const nextStatus = nextKitchenStatus(order.status);
        if (order.status === "ready" || order.status === "served") return order;

        return {
          ...order,
          cafeId: cafeConfig.id,
          status: nextStatus,
          waiterCall: nextStatus === "ready" ? { type: "ready", active: true, message: waiterCallMessage("ready"), createdAt: Date.now() } : order.waiterCall,
        };
      });
      writeKitchenOrders(next);
      return next;
    });
  }

  function callWaiter(id: number, type: WaiterCallType) {
    setOrders((current) => {
      const next = current.map((order) => order.id === id ? { ...order, cafeId: cafeConfig.id, waiterCall: { type, active: true, message: waiterCallMessage(type), createdAt: Date.now() } } : order);
      writeKitchenOrders(next);
      return next;
    });
  }

  return <main className={`min-h-screen ${pageTheme.shell} ${pageTheme.text}`}>
    <div className={`mx-auto min-h-screen w-full max-w-5xl ${pageTheme.panel} shadow-2xl shadow-stone-950/10`}>
      <header className={`sticky top-0 z-20 border-b border-stone-200/60 ${pageTheme.header} px-4 py-4 backdrop-blur sm:px-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">{cafeConfig.name} · {cafeConfig.id}</p><h1 className="text-2xl font-black sm:text-3xl">{experience.label} kitchen</h1><p className="mt-2 text-sm font-bold opacity-70">Kitchen sets orders to Ready. Waiter marks Served.</p></div>
          <div className="flex flex-wrap gap-2">
            {(["restaurant", "cafe", "drinks"] as MenuExperienceId[]).map((mode) => <a key={mode} href={staffRoute("kitchen", mode)} className={mode === experienceMode ? `rounded-2xl px-4 py-3 text-center text-xs font-black ${pageTheme.button}` : "rounded-2xl bg-white/70 px-4 py-3 text-center text-xs font-black text-stone-800 ring-1 ring-black/5"}>{menuExperiences[mode].label}</a>)}
            <a href={staffRoute("business", experienceMode)} className="rounded-2xl bg-white/70 px-4 py-3 text-center text-xs font-black text-stone-800 ring-1 ring-black/5">Business view</a>
            <a href={waiterRoute(experienceMode)} className={`rounded-2xl px-4 py-3 text-center text-xs font-black shadow-lg shadow-stone-950/20 ${pageTheme.button}`}>Waiter view</a>
          </div>
        </div>
      </header>
      <section className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4 sm:px-6">{[["active", "Active", counts.active], ["new", "New", counts.new], ["preparing", "Preparing", counts.preparing], ["ready", "Ready", counts.ready]].map(([key, label, count]) => <button key={key} onClick={() => setFilter(key as OrderStatus | "active")} className={`rounded-3xl p-4 text-left shadow-sm ring-1 transition active:scale-[0.98] ${filter === key ? `${pageTheme.button} ring-current` : "bg-white text-[#20160f] ring-stone-200"}`}><p className="text-3xl font-black">{count}</p><p className="mt-1 text-sm font-black">{label}</p></button>)}</section>
      <section className="px-4 pb-5 sm:px-6"><AvailabilityControls section="Kitchen" experienceMode={experienceMode} /></section>
      <section className="grid gap-4 px-4 pb-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {visibleOrders.map((order) => <article key={order.id} className="rounded-[1.5rem] bg-white p-4 text-[#20160f] shadow-sm ring-1 ring-stone-200"><div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">Order #{order.id}</p><h2 className="mt-1 text-3xl font-black">Table {order.table}</h2><p className="mt-1 text-sm font-bold text-stone-500">{order.time}</p>{order.payment?.status === "paid" ? <p className="mt-2 text-xs font-black text-emerald-700">Paid by Stripe</p> : null}</div><span className={`inline-flex rounded-full px-3 py-2 text-xs font-black ring-1 ${statusStyles[order.status]}`}>{statusText[order.status]}</span></div>{order.notes && <p className="mt-4 rounded-xl bg-yellow-50 px-3 py-2 text-sm font-bold text-yellow-900 ring-1 ring-yellow-100">Chef notes: {order.notes}</p>}{order.waiterCall?.active ? <p className="mt-4 rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900 ring-1 ring-sky-100">Waiter called: {order.waiterCall.message}</p> : null}<div className="space-y-3 py-4">{order.items.map((item) => <div key={`${order.id}-${item.name}`} className="rounded-2xl bg-stone-50 p-3 text-left ring-1 ring-stone-100"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-base font-black">{item.name}</p><DietaryBadges item={item} /></div>{item.description && <p className="mt-1 line-clamp-2 text-xs font-bold text-stone-500">{item.description}</p>}</div><p className="rounded-full bg-white px-3 py-1 text-sm font-black shadow-sm">×{item.quantity}</p></div>{item.allergens?.length ? <p className="mt-2 text-xs font-bold text-stone-500">Allergens: {item.allergens.join(", ")}</p> : null}</div>)}</div>{order.status === "ready" ? <div className="space-y-2"><div className="rounded-2xl bg-green-50 px-4 py-4 text-center text-sm font-black text-green-900 ring-1 ring-green-100">Ready — waiter will mark served</div><button onClick={() => callWaiter(order.id, "ready")} className="w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-black text-white shadow-sm">Call waiter to collect</button><button onClick={() => callWaiter(order.id, "help")} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">Call waiter for help</button></div> : <div className="space-y-2"><button onClick={() => updateOrder(order.id)} disabled={order.status === "served"} className="w-full rounded-2xl bg-[#20160f] px-4 py-4 text-sm font-black text-white shadow-lg shadow-stone-950/20 disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none">{actionText(order.status)}</button>{order.status !== "served" ? <button onClick={() => callWaiter(order.id, "help")} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">Call waiter for help</button> : null}</div>}</article>)}
        {visibleOrders.length === 0 && <div className="col-span-full rounded-[1.5rem] bg-white p-8 text-center text-[#20160f] shadow-sm ring-1 ring-stone-200"><h2 className="text-2xl font-black">No {experience.label.toLowerCase()} orders</h2><p className="mt-2 text-sm font-semibold text-stone-500">Orders for this model will appear here.</p></div>}
      </section>
    </div>
  </main>;
}
