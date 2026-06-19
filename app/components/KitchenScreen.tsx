"use client";

import { useEffect, useMemo, useState } from "react";
import DietaryBadges from "./DietaryBadges";
import { cafeConfig } from "../lib/cafeConfig";
import { menuExperiences, staffRoute, type MenuExperienceId } from "../lib/menu";
import { readKitchenOrders, subscribeToKitchenOrders, writeKitchenOrders, type KitchenOrder, type OrderStatus, type WaiterCallType } from "../lib/orders";

const statusText: Record<OrderStatus, string> = { new: "New", preparing: "Preparing", ready: "Ready", served: "Served" };
const statusStyles: Record<OrderStatus, string> = {
  new: "bg-red-50 text-red-700 ring-red-200",
  preparing: "bg-amber-50 text-amber-800 ring-amber-200",
  ready: "bg-green-50 text-green-800 ring-green-200",
  served: "bg-stone-100 text-stone-500 ring-stone-200",
};
const pageThemes: Record<MenuExperienceId, { shell: string; panel: string; header: string; text: string }> = {
  restaurant: { shell: "bg-[#ebe6dd]", panel: "bg-[#fbfaf7]", header: "bg-[#fbfaf7]/95", text: "text-[#241c18]" },
  cafe: { shell: "bg-[#f6ead8]", panel: "bg-[#fffaf3]", header: "bg-[#fffaf3]/95", text: "text-[#2f2a24]" },
  drinks: { shell: "bg-[#171312]", panel: "bg-[#241c1a]", header: "bg-[#241c1a]/95", text: "text-[#fff8f0]" },
};

const staffPrimaryButton = "bg-slate-950 text-white";
const staffGhostButton = "bg-white/80 text-slate-800 ring-1 ring-slate-200";
const staffDisabledButton = "bg-stone-200 text-stone-500";

type Props = { experienceMode?: MenuExperienceId };
type KitchenFilter = OrderStatus | "active";

function nextKitchenStatus(status: OrderStatus): OrderStatus {
  if (status === "new") return "preparing";
  if (status === "preparing") return "ready";
  return status;
}

function actionText(status: OrderStatus) {
  if (status === "new") return "Start preparing";
  if (status === "preparing") return "Mark ready";
  if (status === "ready") return "Ready for waiter";
  return "Completed";
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
  const [filter, setFilter] = useState<KitchenFilter>("active");
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
  const filterTabs: [KitchenFilter, string, number][] = [["active", "Active", counts.active], ["new", "New", counts.new], ["preparing", "Preparing", counts.preparing], ["ready", "Ready", counts.ready]];

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
    <div className={`mx-auto min-h-screen w-full max-w-4xl ${pageTheme.panel} shadow-xl shadow-stone-950/10`}>
      <header className={`sticky top-0 z-20 border-b border-stone-200/70 ${pageTheme.header} px-4 py-3 backdrop-blur sm:px-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-55">{cafeConfig.name} · Kitchen</p>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">{experience.label} orders</h1>
            <p className="mt-1 text-xs font-bold opacity-65">Move orders from New to Ready. Menu controls stay in Business.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {(["restaurant", "cafe", "drinks"] as MenuExperienceId[]).map((mode) => <a key={mode} href={staffRoute("kitchen", mode)} className={`rounded-xl px-3 py-2 text-center text-[11px] font-black ${mode === experienceMode ? staffPrimaryButton : staffGhostButton}`}>{menuExperiences[mode].label}</a>)}
            <a href={staffRoute("business", experienceMode)} className={`rounded-xl px-3 py-2 text-center text-[11px] font-black ${staffGhostButton}`}>Business</a>
            <a href={waiterRoute(experienceMode)} className={`rounded-xl px-3 py-2 text-center text-[11px] font-black ${staffGhostButton}`}>Waiter</a>
          </nav>
        </div>
      </header>

      <section className="flex gap-5 overflow-x-auto border-b border-stone-200/70 px-4 py-3 sm:px-6">
        {filterTabs.map(([key, label, count]) => <button key={key} onClick={() => setFilter(key)} className={`shrink-0 border-b-2 pb-2 text-left text-xs font-black transition active:scale-[0.98] ${filter === key ? "border-slate-950 text-slate-950" : "border-transparent text-current opacity-55"}`}>
          <span>{label}</span>
          <span className="ml-2 rounded-full bg-white/80 px-2 py-1 text-[10px] ring-1 ring-stone-200">{count}</span>
        </button>)}
      </section>

      <section className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {visibleOrders.map((order) => <article key={order.id} className="border border-stone-200 bg-white p-3 text-slate-950 shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-400">Order #{order.id}</p>
              <h2 className="mt-1 text-2xl font-black">Table {order.table}</h2>
              <p className="text-xs font-bold text-stone-500">{order.time}</p>
              {order.payment?.status === "paid" ? <p className="mt-1 text-[11px] font-black text-emerald-700">Paid by Stripe</p> : null}
            </div>
            <span className={`shrink-0 px-2 py-1 text-[10px] font-black uppercase ring-1 ${statusStyles[order.status]}`}>{statusText[order.status]}</span>
          </div>

          {order.notes ? <p className="mt-3 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Notes: {order.notes}</p> : null}
          {order.waiterCall?.active ? <p className="mt-3 border-l-4 border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900">Waiter called: {order.waiterCall.message}</p> : null}

          <div className="my-3 divide-y divide-stone-100 border-y border-stone-100">
            {order.items.map((item) => <div key={`${order.id}-${item.name}`} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-black">{item.name}</p>
                  <DietaryBadges item={item} />
                </div>
                {item.allergens?.length ? <p className="mt-1 text-[11px] font-bold text-stone-500">Allergens: {item.allergens.join(", ")}</p> : null}
              </div>
              <p className="shrink-0 text-sm font-black">×{item.quantity}</p>
            </div>)}
          </div>

          {order.status === "ready" ? <div className="space-y-2">
            <p className="bg-stone-50 px-3 py-2 text-center text-xs font-black text-stone-600 ring-1 ring-stone-200">Ready — waiter marks served</p>
            <button onClick={() => callWaiter(order.id, "ready")} className={`w-full px-4 py-3 text-sm font-black ${staffPrimaryButton}`}>Call waiter to collect</button>
            <button onClick={() => callWaiter(order.id, "help")} className={`w-full px-4 py-3 text-sm font-black ${staffPrimaryButton}`}>Call waiter for help</button>
          </div> : <div className="space-y-2">
            <button onClick={() => updateOrder(order.id)} disabled={order.status === "served"} className={`w-full px-4 py-3 text-sm font-black ${order.status === "served" ? staffDisabledButton : staffPrimaryButton}`}>{actionText(order.status)}</button>
            {order.status !== "served" ? <button onClick={() => callWaiter(order.id, "help")} className={`w-full px-4 py-3 text-sm font-black ${staffPrimaryButton}`}>Call waiter for help</button> : null}
          </div>}
        </article>)}
        {visibleOrders.length === 0 && <div className="col-span-full border border-dashed border-stone-300 bg-white p-8 text-center text-slate-950"><h2 className="text-xl font-black">No {experience.label.toLowerCase()} orders</h2><p className="mt-2 text-sm font-semibold text-stone-500">Orders for this model will appear here.</p></div>}
      </section>
    </div>
  </main>;
}
