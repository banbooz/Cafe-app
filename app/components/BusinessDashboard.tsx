"use client";

import { useEffect, useMemo, useState } from "react";
import AvailabilityControls from "./AvailabilityControls";
import { cafeConfig } from "../lib/cafeConfig";
import { allMenuItems, menuExperiences, money, staffRoute, type MenuExperienceId } from "../lib/menu";
import { useMenuCatalogue } from "../lib/menuCatalog";
import { useMenuSettings } from "../lib/menuSettings";
import { orderTypeText, readKitchenOrders, subscribeToKitchenOrders, type KitchenOrder, type KitchenOrderItem } from "../lib/orders";

type Tab = "top" | "daily";
type MenuLookup = { id: number; name: string; category: string; price: number };
type SoldItem = KitchenOrderItem & { category?: string; unitPrice?: number; price?: number };
type ProductSale = { key: string; name: string; category: string; quantity: number; revenue: number };
type Props = { experienceMode?: MenuExperienceId };

const pageThemes: Record<MenuExperienceId, { shell: string; header: string; accent: string; dark: string }> = {
  restaurant: { shell: "bg-[#ebe6dd]", header: "bg-[#2f2420]", accent: "text-[#8f4f35]", dark: "bg-[#2f2420]" },
  cafe: { shell: "bg-[#f6ead8]", header: "bg-[#c9843b]", accent: "text-[#c9843b]", dark: "bg-[#6d4a2e]" },
  drinks: { shell: "bg-[#171312]", header: "bg-[#0f0b0a]", accent: "text-[#d7a048]", dark: "bg-[#0f0b0a]" },
};

function waiterRoute(experienceMode: MenuExperienceId) {
  return experienceMode === "restaurant" ? "/waiter" : `/waiter/${experienceMode}`;
}

function findMenuItem(item: SoldItem, menu: MenuLookup[]) {
  return menu.find((product) => product.id === item.id || product.name === item.name) || allMenuItems.find((product) => product.id === item.id || product.name === item.name);
}

function itemCategory(item: SoldItem, menu: MenuLookup[]) {
  return item.category || findMenuItem(item, menu)?.category || "Other";
}

function itemPrice(item: SoldItem, menu: MenuLookup[]) {
  const price = item.unitPrice ?? item.price ?? findMenuItem(item, menu)?.price ?? 0;
  return Number.isFinite(price) ? Number(price) : 0;
}

function isToday(order: KitchenOrder) {
  const timestamp = Number(order.id) > 946684800000 ? Number(order.id) : Number(order.payment?.paidAt);
  if (!Number.isFinite(timestamp) || timestamp <= 946684800000) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function orderMatchesModel(order: KitchenOrder, experienceMode: MenuExperienceId) {
  return (order.orderType || "restaurant") === experienceMode;
}

function productSales(orders: KitchenOrder[], menu: MenuLookup[]) {
  const totals = new Map<string, ProductSale>();

  orders.forEach((order) => order.items.forEach((rawItem) => {
    const item = rawItem as SoldItem;
    const key = typeof item.id === "number" ? String(item.id) : item.name.toLowerCase();
    const category = itemCategory(item, menu);
    const quantity = item.quantity || 0;
    const revenue = itemPrice(item, menu) * quantity;
    const existing = totals.get(key);

    totals.set(key, existing
      ? { ...existing, category: existing.category === "Other" ? category : existing.category, quantity: existing.quantity + quantity, revenue: existing.revenue + revenue }
      : { key, name: item.name || "Unknown product", category, quantity, revenue });
  }));

  return Array.from(totals.values()).sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue || a.name.localeCompare(b.name));
}

function analyticsFor(orders: KitchenOrder[], menu: MenuLookup[]) {
  const categories: Record<string, number> = {};
  let itemCount = 0, revenue = 0, subtotalRevenue = 0, tipRevenue = 0;

  orders.forEach((order) => {
    const tipAmount = Number(order.tipAmount || 0);
    revenue += order.total;
    tipRevenue += tipAmount;
    subtotalRevenue += typeof order.subtotal === "number" ? order.subtotal : order.total - tipAmount;

    order.items.forEach((rawItem) => {
      const item = rawItem as SoldItem;
      const category = itemCategory(item, menu);
      categories[category] = (categories[category] || 0) + item.quantity;
      itemCount += item.quantity;
    });
  });

  const soldProducts = productSales(orders, menu);
  const categoriesRanked = Object.entries(categories).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);

  return {
    orderCount: orders.length,
    itemCount,
    revenue,
    subtotalRevenue,
    tipRevenue,
    averageOrder: orders.length ? revenue / orders.length : 0,
    topProduct: soldProducts[0] || { key: "none", name: "No orders", category: "Other", quantity: 0, revenue: 0 },
    topCategory: categoriesRanked[0] || { name: "No data", qty: 0 },
    soldProducts,
    dailyProducts: productSales(orders.filter(isToday), menu),
    categoriesRanked,
  };
}

export default function BusinessDashboard({ experienceMode = "restaurant" }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [tab, setTab] = useState<Tab>("top");
  const { settings } = useMenuSettings();
  const { visibleItems } = useMenuCatalogue(settings, experienceMode);
  const experience = menuExperiences[experienceMode];
  const pageTheme = pageThemes[experienceMode];

  useEffect(() => {
    function refreshOrders() { setOrders(readKitchenOrders()); }
    refreshOrders();
    return subscribeToKitchenOrders(refreshOrders);
  }, []);

  const scopedOrders = useMemo(() => orders.filter((order) => orderMatchesModel(order, experienceMode)), [experienceMode, orders]);
  const analytics = useMemo(() => analyticsFor(scopedOrders, visibleItems), [scopedOrders, visibleItems]);
  const topFive = analytics.soldProducts.slice(0, 5);
  const shownProducts = tab === "top" ? topFive : analytics.dailyProducts;
  const maxQuantity = shownProducts[0]?.quantity || 1;

  return <main className={`min-h-screen ${pageTheme.shell} px-4 py-5 text-slate-900 sm:px-6 lg:px-8`}>
    <section className="mx-auto max-w-6xl">
      <header className={`rounded-[2rem] ${pageTheme.header} p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7`}>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-100">Business dashboard - {cafeConfig.id}</p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{experience.label} business</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/75">Track live {orderTypeText[experienceMode].toLowerCase()} orders, sales, menu performance and item availability for this model only.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["restaurant", "cafe", "drinks"] as MenuExperienceId[]).map((mode) => <a key={mode} href={staffRoute("business", mode)} className={mode === experienceMode ? "inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-4 text-xs font-black text-slate-950" : "inline-flex min-h-12 items-center justify-center rounded-2xl bg-white/10 px-4 text-xs font-black text-white"}>{menuExperiences[mode].label}</a>)}
            <a href={staffRoute("kitchen", experienceMode)} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white/10 px-5 text-sm font-black text-white">Open kitchen view</a>
            <a href={waiterRoute(experienceMode)} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-950">Open waiter view</a>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Orders tracked" value={String(analytics.orderCount)} detail={`${analytics.itemCount} items sold`} />
        <Metric label="Revenue incl. tips" value={money(analytics.revenue)} detail={`${money(analytics.subtotalRevenue)} before tips`} />
        <Metric label="Tips received" value={money(analytics.tipRevenue)} detail="Optional customer tips" />
        <Metric label="Top sold product" value={analytics.topProduct.name} detail={`${analytics.topProduct.quantity} sold - ${money(analytics.topProduct.revenue)}`} />
      </div>

      <div className="mt-5"><AvailabilityControls section="Business" experienceMode={experienceMode} /></div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${pageTheme.accent}`}>Menu performance</p>
              <h2 className="mt-1 text-xl font-black">{tab === "top" ? "Most Sold Products" : "Daily Sales by Item"}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">Uses {experience.label} order item snapshots, including custom and removed products when they exist in orders.</p>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Live</span>
          </div>
          <div className="mt-5 grid gap-2 rounded-3xl bg-slate-100 p-2 sm:grid-cols-2">
            <button type="button" onClick={() => setTab("top")} className={tab === "top" ? `min-h-11 rounded-2xl ${pageTheme.dark} px-4 text-sm font-black text-white` : "min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600"}>Most Sold Products</button>
            <button type="button" onClick={() => setTab("daily")} className={tab === "daily" ? `min-h-11 rounded-2xl ${pageTheme.dark} px-4 text-sm font-black text-white` : "min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600"}>Daily Sales by Item</button>
          </div>
          {shownProducts.length ? <div className="mt-5 space-y-3">{shownProducts.map((product, index) => <ProductCard key={product.key} product={product} rank={tab === "top" ? index + 1 : undefined} maxQuantity={maxQuantity} />)}</div> : <EmptyState title={tab === "top" ? "No sold products" : "No items sold today"} text={tab === "top" ? `Most sold products for ${experience.label} will appear here after orders are placed.` : `Daily item sales for ${experience.label} will appear here when products sell today.`} />}
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className={`text-xs font-black uppercase tracking-[0.18em] ${pageTheme.accent}`}>Order split</p>
          <h2 className="mt-1 text-xl font-black">Categories</h2>
          {analytics.categoriesRanked.length ? <div className="mt-5 space-y-3">{analytics.categoriesRanked.map((category) => <div key={category.name} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-black">{category.name}</span><span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{category.qty} items</span></div>)}</div> : <EmptyState title="No category data" text={`Category performance for ${experience.label} will appear here.`} />}
        </section>
      </div>

      <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${pageTheme.accent}`}>Orders</p>
            <h2 className="mt-1 text-xl font-black">Recent orders</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{scopedOrders.length ? "Live orders" : "No orders"}</span>
        </div>
        {scopedOrders.length ? <div className="mt-5 grid gap-3 lg:grid-cols-4">{scopedOrders.map((order) => <article key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-slate-400">Order #{order.id}</p><h3 className="mt-1 font-black">Table {order.table}</h3></div><span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{order.status}</span></div><p className="mt-3 text-sm font-bold leading-6 text-slate-500">{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p><div className="mt-4 space-y-2"><div className="flex items-center justify-between text-xs font-black text-slate-400"><span>{order.time}</span><span>Subtotal {money(order.subtotal ?? order.total - Number(order.tipAmount || 0))}</span></div>{order.tipAmount ? <div className="flex items-center justify-between text-xs font-black text-orange-600"><span>Tip {order.tipPercentage || 0}%</span><span>{money(order.tipAmount)}</span></div> : null}<div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400">Total</span><span className="font-black">{money(order.total)}</span></div></div></article>)}</div> : <EmptyState title="No orders" text={`Orders for ${experience.label} will appear here when they are placed.`} />}
      </section>
    </section>
  </main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><h2 className="mt-3 truncate text-2xl font-black text-slate-950">{value}</h2><p className="mt-2 text-sm font-bold text-slate-500">{detail}</p></article>;
}

function ProductCard({ product, rank, maxQuantity }: { product: ProductSale; rank?: number; maxQuantity: number }) {
  const width = `${Math.max(10, (product.quantity / Math.max(1, maxQuantity)) * 100)}%`;
  return <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3">{rank && <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-black text-white">{rank}</div>}<div className="min-w-0"><h3 className="truncate font-black">{product.name}</h3><p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{product.category}</p></div></div><div className="grid gap-2 sm:min-w-36 sm:text-right"><p className="text-sm font-black text-slate-950">{product.quantity} sold</p><p className="text-sm font-black text-orange-600">{money(product.revenue)}</p></div></div><div className="mt-4 h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-slate-900" style={{ width }} /></div></article>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-2 text-sm font-bold leading-6 text-slate-500">{text}</p></div>;
}
