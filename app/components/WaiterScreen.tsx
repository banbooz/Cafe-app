"use client";

import { useEffect, useMemo, useState } from "react";
import DietaryBadges from "./DietaryBadges";
import { cafeConfig } from "../lib/cafeConfig";
import { menuExperiences, staffRoute, type MenuExperienceId } from "../lib/menu";
import { orderTypeText, readKitchenOrders, subscribeToKitchenOrders, writeKitchenOrders, type KitchenOrder, type OrderStatus } from "../lib/orders";

type Props = { experienceMode?: MenuExperienceId };
type WaiterSection = "ready" | "progress" | "calls";

type WaiterTheme = {
  shell: string;
  panel: string;
  header: string;
  button: string;
  mutedButton: string;
  text: string;
  accentText: string;
  card: string;
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
  ready: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  served: "bg-stone-100 text-stone-500 ring-stone-200",
};

const waiterThemes: Record<MenuExperienceId, WaiterTheme> = {
  restaurant: {
    shell: "bg-[#ebe6dd]",
    panel: "bg-[#fbfaf7]",
    header: "bg-[#2f2420] text-white",
    button: "bg-[#8f4f35] text-white",
    mutedButton: "bg-[#fbfaf7] text-[#241c18] ring-1 ring-[#d8ccc0]",
    text: "text-[#241c18]",
    accentText: "text-[#c3915b]",
    card: "bg-[#fbfaf7] text-[#241c18] ring-[#d8ccc0]",
  },
  cafe: {
    shell: "bg-[#f6ead8]",
    panel: "bg-[#fffaf3]",
    header: "bg-[#c9843b] text-white",
    button: "bg-[#c9843b] text-white",
    mutedButton: "bg-[#fffaf3] text-[#2f2a24] ring-1 ring-[#eadcc4]",
    text: "text-[#2f2a24]",
    accentText: "text-[#fff1d8]",
    card: "bg-[#fffaf3] text-[#2f2a24] ring-[#eadcc4]",
  },
  drinks: {
    shell: "bg-[#171312]",
    panel: "bg-[#241c1a]",
    header: "bg-[#0f0b0a] text-[#fff8f0]",
    button: "bg-[#d7a048] text-[#111]",
    mutedButton: "bg-[#241c1a] text-[#fff8f0] ring-1 ring-white/10",
    text: "text-[#fff8f0]",
    accentText: "text-[#d7a048]",
    card: "bg-[#241c1a] text-[#fff8f0] ring-white/10",
  },
};

function waiterRoute(experienceMode: MenuExperienceId) {
  return experienceMode === "restaurant" ? "/waiter" : `/waiter/${experienceMode}`;
}

function orderMatchesModel(order: KitchenOrder, experienceMode: MenuExperienceId) {
  return (order.orderType || "restaurant") === experienceMode;
}

function orderTimeValue(order: KitchenOrder) {
  const callAt = Number(order.waiterCall?.createdAt);
  const direct = Number(order.id);
  const paidAt = Number(order.payment?.paidAt);
  if (Number.isFinite(callAt) && callAt > 0) return callAt;
  if (Number.isFinite(direct) && direct > 946684800000) return direct;
  if (Number.isFinite(paidAt) && paidAt > 946684800000) return paidAt;
  return 0;
}

function tableLabel(table: number) {
  return `Table ${table}`;
}

function emptyText(section: WaiterSection) {
  if (section === "calls") return { title: "No waiter calls", text: "Kitchen help and collection calls will appear here." };
  if (section === "ready") return { title: "No ready orders", text: "Kitchen-ready orders will appear here for waiters to serve." };
  return { title: "No orders in progress", text: "Orders being prepared will appear here." };
}

export default function WaiterScreen({ experienceMode = "restaurant" }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [section, setSection] = useState<WaiterSection>("ready");
  const experience = menuExperiences[experienceMode];
  const theme = waiterThemes[experienceMode];

  useEffect(() => {
    function refreshOrders() {
      setOrders(readKitchenOrders());
    }

    refreshOrders();
    return subscribeToKitchenOrders(refreshOrders);
  }, []);

  const scopedOrders = useMemo(() => orders.filter((order) => orderMatchesModel(order, experienceMode)), [experienceMode, orders]);
  const readyOrders = useMemo(() => scopedOrders.filter((order) => order.status === "ready").sort((a, b) => a.table - b.table || orderTimeValue(a) - orderTimeValue(b)), [scopedOrders]);
  const inProgressOrders = useMemo(() => scopedOrders.filter((order) => order.status === "new" || order.status === "preparing").sort((a, b) => orderTimeValue(b) - orderTimeValue(a)), [scopedOrders]);
  const waiterCalls = useMemo(() => scopedOrders.filter((order) => order.status !== "served" && order.waiterCall?.active).sort((a, b) => orderTimeValue(b) - orderTimeValue(a)), [scopedOrders]);
  const visibleOrders = section === "ready" ? readyOrders : section === "progress" ? inProgressOrders : waiterCalls;
  const readyItems = readyOrders.reduce((total, order) => total + order.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const empty = emptyText(section);

  function markServed(orderId: number) {
    setOrders((current) => {
      const next = current.map((order) => order.id === orderId ? { ...order, cafeId: cafeConfig.id, status: "served" as OrderStatus, waiterCall: order.waiterCall ? { ...order.waiterCall, active: false, clearedAt: Date.now() } : undefined } : order);
      writeKitchenOrders(next);
      return next;
    });
  }

  function clearWaiterCall(orderId: number) {
    setOrders((current) => {
      const next = current.map((order) => order.id === orderId && order.waiterCall ? { ...order, cafeId: cafeConfig.id, waiterCall: { ...order.waiterCall, active: false, clearedAt: Date.now() } } : order);
      writeKitchenOrders(next);
      return next;
    });
  }

  return <main className={`min-h-screen ${theme.shell} ${theme.text}`}>
    <div className={`mx-auto min-h-screen w-full max-w-6xl ${theme.panel} shadow-2xl shadow-stone-950/10`}>
      <header className={`sticky top-0 z-20 border-b border-black/10 ${theme.header} px-4 py-4 shadow-sm backdrop-blur sm:px-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.22em] ${theme.accentText}`}>{cafeConfig.name} · waiter</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{experience.label} waiter</h1>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 opacity-75">Ready orders and kitchen calls appear here. Only the waiter marks orders served.</p>
          </div>
          <nav className="grid gap-2 sm:grid-cols-2 lg:min-w-[380px]">
            {(["restaurant", "cafe", "drinks"] as MenuExperienceId[]).map((mode) => <a key={mode} href={waiterRoute(mode)} className={mode === experienceMode ? `rounded-2xl px-4 py-3 text-center text-xs font-black ${theme.button}` : "rounded-2xl bg-white/10 px-4 py-3 text-center text-xs font-black text-white ring-1 ring-white/15"}>{menuExperiences[mode].label} Waiter</a>)}
            <a href={staffRoute("kitchen", experienceMode)} className="rounded-2xl bg-white/10 px-4 py-3 text-center text-xs font-black text-white ring-1 ring-white/15">Open matching Kitchen</a>
          </nav>
        </div>
      </header>

      <section className="grid gap-2 px-4 py-4 sm:grid-cols-3 sm:px-6">
        <FilterButton active={section === "ready"} label="Ready to Serve" count={readyOrders.length} detail={`${readyItems} items ready`} theme={theme} onClick={() => setSection("ready")} />
        <FilterButton active={section === "calls"} label="Waiter Calls" count={waiterCalls.length} detail="Kitchen needs waiter" theme={theme} onClick={() => setSection("calls")} />
        <FilterButton active={section === "progress"} label="In Progress" count={inProgressOrders.length} detail="Kitchen is working" theme={theme} onClick={() => setSection("progress")} />
      </section>

      <section className="grid gap-4 px-4 pb-8 sm:px-6 lg:grid-cols-3">
        {visibleOrders.map((order) => <OrderCard key={order.id} order={order} theme={theme} canServe={order.status === "ready"} markServed={() => markServed(order.id)} clearCall={() => clearWaiterCall(order.id)} />)}
        {visibleOrders.length === 0 ? <div className={`col-span-full rounded-[1.5rem] p-8 text-center shadow-sm ring-1 ${theme.card}`}><h2 className="text-2xl font-black">{empty.title}</h2><p className="mt-2 text-sm font-semibold opacity-65">{empty.text}</p></div> : null}
      </section>
    </div>
  </main>;
}

function FilterButton({ active, label, count, detail, theme, onClick }: { active: boolean; label: string; count: number; detail: string; theme: WaiterTheme; onClick: () => void }) {
  return <button onClick={onClick} className={active ? `rounded-[1.35rem] px-4 py-4 text-left shadow-lg ${theme.button}` : `rounded-[1.35rem] px-4 py-4 text-left shadow-sm ${theme.mutedButton}`}>
    <span className="block text-2xl font-black">{count}</span>
    <span className="mt-1 block text-sm font-black">{label}</span>
    <span className="mt-1 block text-xs font-bold opacity-65">{detail}</span>
  </button>;
}

function OrderCard({ order, theme, canServe, markServed, clearCall }: { order: KitchenOrder; theme: WaiterTheme; canServe: boolean; markServed: () => void; clearCall: () => void }) {
  const paymentText = order.payment?.status === "paid" ? "Paid by Stripe" : order.payment?.status === "pending" ? "Payment pending" : "Demo payment";

  return <article className={`rounded-[1.6rem] p-4 shadow-sm ring-1 ${theme.card}`}>
    <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-50">Order #{order.id}</p>
        <h2 className="mt-1 text-3xl font-black">{tableLabel(order.table)}</h2>
        <p className="mt-1 text-sm font-bold opacity-60">{order.time}</p>
        <p className="mt-2 text-xs font-black text-emerald-700">{paymentText}</p>
      </div>
      <span className={`inline-flex rounded-full px-3 py-2 text-xs font-black ring-1 ${statusStyles[order.status]}`}>{statusText[order.status]}</span>
    </div>

    {order.waiterCall?.active ? <div className="mt-4 rounded-xl bg-sky-50 px-3 py-3 text-sm font-bold text-sky-900 ring-1 ring-sky-100"><p>{order.waiterCall.message}</p><button onClick={clearCall} className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-sky-800 ring-1 ring-sky-100">Clear call</button></div> : null}
    {order.notes ? <p className="mt-4 rounded-xl bg-yellow-50 px-3 py-2 text-sm font-bold text-yellow-900 ring-1 ring-yellow-100">Notes: {order.notes}</p> : null}

    <div className="space-y-3 py-4">
      {order.items.map((item) => <div key={`${order.id}-${item.name}`} className="rounded-2xl bg-white/60 p-3 text-left ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-black">{item.name}</p>
              <DietaryBadges item={item} />
            </div>
            {item.description ? <p className="mt-1 line-clamp-2 text-xs font-bold opacity-55">{item.description}</p> : null}
          </div>
          <p className="rounded-full bg-white px-3 py-1 text-sm font-black shadow-sm">×{item.quantity}</p>
        </div>
        {item.allergens?.length ? <p className="mt-2 text-xs font-bold opacity-60">Allergens: {item.allergens.join(", ")}</p> : null}
      </div>)}
    </div>

    {canServe ? <button onClick={markServed} className={`w-full rounded-2xl px-4 py-4 text-sm font-black shadow-lg ${theme.button}`}>Mark Served</button> : <div className="rounded-2xl bg-black/5 px-4 py-4 text-center text-sm font-black opacity-60">Waiting for kitchen ready</div>}
  </article>;
}
