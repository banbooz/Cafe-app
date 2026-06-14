"use client";

import { useEffect, useMemo, useState } from "react";
import AvailabilityControls from "../components/AvailabilityControls";
import { cafeConfig } from "../lib/cafeConfig";
import { menuItems, money } from "../lib/menu";
import { useMenuCatalogue } from "../lib/menuCatalog";
import { useMenuSettings } from "../lib/menuSettings";
import { readKitchenOrders, subscribeToKitchenOrders, type KitchenOrder, type KitchenOrderItem } from "../lib/orders";

type SalesTab = "top" | "daily";
type LookupItem = { id: number; name: string; category: string; price: number };
type SalesItem = KitchenOrderItem & { category?: string; unitPrice?: number; price?: number };
type ProductSale = { key: string; name: string; category: string; quantity: number; revenue: number };

const emptyProduct: ProductSale = { key: "empty", name: "No orders", category: "Other", quantity: 0, revenue: 0 };

function lookup(item: SalesItem, currentMenu: LookupItem[]) {
  return currentMenu.find((menuItem) => (typeof item.id === "number" && menuItem.id === item.id) || menuItem.name === item.name) || menuItems.find((menuItem) => (typeof item.id === "number" && menuItem.id === item.id) || menuItem.name === item.name);
}

function categoryFor(item: SalesItem, currentMenu: LookupItem[]) {
  return item.category || lookup(item, currentMenu)?.category || "Other";
}

function unitPriceFor(item: SalesItem, currentMenu: LookupItem[]) {
  const price = item.unitPrice ?? item.price ?? lookup(item, currentMenu)?.price ?? 0;
  return Number.isFinite(price) ? Number(price) : 0;
}

function isToday(order: KitchenOrder) {
  const timestamp = Number(order.id) > 946684800000 ? Number(order.id) : Number(order.payment?.paidAt);
  if (!Number.isFinite(timestamp) || timestamp <= 946684800000) return false;
  const orderDate = new Date(timestamp);
  const today = new Date();
  return orderDate.getFullYear() === today.getFullYear() && orderDate.getMonth() === today.getMonth() && orderDate.getDate() === today.getDate();
}

function productSalesFrom(orders: KitchenOrder[], currentMenu: LookupItem[]) {
  const totals = new Map<string, ProductSale>();

  orders.forEach((order) => {
    order.items.forEach((rawItem) => {
      const item = rawItem as SalesItem;
      const key = typeof item.id === "number" ? String(item.id) : item.name.trim().toLowerCase();
      const category = categoryFor(item, currentMenu);
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
      const revenue = unitPriceFor(item, currentMenu) * quantity;
      const existing = totals.get(key);

      totals.set(key, existing ? {
        ...existing,
        category: existing.category === "Other" ? category : existing.category,
        quantity: existing.quantity + quantity,
        revenue: existing.revenue + revenue,
      } : {
        key,
        name: item.name || "Unknown product",
        category,
        quantity,
        revenue,
      });
    });
  });

  return Array.from(totals.values()).sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue || a.name.localeCompare(b.name));
}

function getAnalytics(orders: KitchenOrder[], currentMenu: LookupItem[]) {
  const categoryTotals: Record<string, number> = {};
  let itemCount = 0;
  let revenue = 0;

  orders.forEach((order) => {
    revenue += order.total;
    order.items.forEach((rawItem) => {
      const item = rawItem as SalesItem;
      const category = categoryFor(item, currentMenu);
      categoryTotals[category] = (categoryTotals[category] || 0) + item.quantity;
      itemCount += item.quantity;
    });
  });

  const productSales = productSalesFrom(orders, currentMenu);
  const dailyProductSales = productSalesFrom(orders.filter(isToday), currentMenu);
  const categoriesRanked = Object.entries(categoryTotals).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);

  return {
    orderCount: orders.length,
    itemCount,
    revenue,
    averageOrder: orders.length ? revenue / orders.length : 0,
    topProduct: productSales[0] || emptyProduct,
    topCategory: categoriesRanked[0] || { name: "No data", qty: 0 },
    productSales,
    dailyProductSales,
    categoriesRanked,
  };
}

export default function BusinessDashboard() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [salesTab, setSalesTab] = useState<SalesTab>("top");
  const { settings } = useMenuSettings();
  const { visibleItems } = useMenuCatalogue(settings);

  useEffect(() => {
    function refreshOrders() {
      setOrders(readKitchenOrders());
    }
    refreshOrders();
    return subscribeToKitchenOrders(refreshOrders);
  }, []);

  const analytics = useMemo(() => getAnalytics(orders, visibleItems), [orders, visibleItems]);
  const topSoldProducts = analytics.productSales.slice(0, 5);
  const visibleSales = salesTab === "top" ? topSoldProducts : analytics.dailyProductSales;
  const maxQuantity = visibleSales[0]?.quantity || 1;

  return (
    <main className="min-h-screen bg-[#eef1f3] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] bg-[#111827] p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Business dashboard - {cafeConfig.id}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{cafeConfig.name}</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">Track live orders, sales, menu performance and item availability for this cafe only.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/kitchen" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white/10 px-5 text-sm font-black text-white">Open kitchen view</a>
              <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-950">Open customer view</a>
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Orders tracked" value={String(analytics.orderCount)} detail={`${analytics.itemCount} items sold`} />
          <Metric label="App revenue" value={money(analytics.revenue)} detail={`${money(analytics.averageOrder)} average order`} />
          <Metric label="Top sold product" value={analytics.topProduct.name} detail={`${analytics.topProduct.quantity} sold - ${money(analytics.topProduct.revenue)}`} />
          <Metric label="Best category" value={analytics.topCategory.name} detail={`${analytics.topCategory.qty} items ordered`} />
        </div>

        <div className="mt-5"><AvailabilityControls section="Business" /></div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Menu performance</p>
                <h2 className="mt-1 text-xl font-black">{salesTab === "top" ? "Most Sold Products" : "Daily Sales by Item"}</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-500">Uses real order item snapshots, so custom and removed products can still appear in sales history.</p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Live</span>
            </div>

            <div className="mt-5 grid gap-2 rounded-3xl bg-slate-100 p-2 sm:grid-cols-2">
              <button type="button" onClick={() => setSalesTab("top")} className={salesTab === "top" ? "min-h-11 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white" : "min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600"}>Most Sold Products</button>
              <button type="button" onClick={() => setSalesTab("daily")} className={salesTab === "daily" ? "min-h-11 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white" : "min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600"}>Daily Sales by Item</button>
            </div>

            {visibleSales.length ? (
              <div className="mt-5 space-y-3">
                {visibleSales.map((product, index) => <ProductCard key={product.key} product={product} rank={salesTab === "top" ? index + 1 : undefined} maxQuantity={maxQuantity} />)}
              </div>
            ) : <EmptyState title={salesTab === "top" ? "No sold products" : "No items sold today"} text={salesTab === "top" ? `Most sold products for ${cafeConfig.name} will appear here after orders are placed.` : `Daily item sales for ${cafeConfig.name} will appear here when products sell today.`} />}
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Order split</p>
            <h2 className="mt-1 text-xl font-black">Categories</h2>
            {analytics.categoriesRanked.length ? <div className="mt-5 space-y-3">{analytics.categoriesRanked.map((category) => <div key={category.name} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><span className="font-black">{category.name}</span><span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{category.qty} items</span></div>)}</div> : <EmptyState title="No category data" text={`Category performance for ${cafeConfig.name} will appear here.`} />}
          </section>
        </div>

        <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Orders</p><h2 className="mt-1 text-xl font-black">Recent orders</h2></div><span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{orders.length ? "Live orders" : "No orders"}</span></div>
          {orders.length ? <div className="mt-5 grid gap-3 lg:grid-cols-4">{orders.map((order) => <article key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-slate-400">Order #{order.id}</p><h3 className="mt-1 font-black">Table {order.table}</h3></div><span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">{order.status}</span></div><p className="mt-3 text-sm font-bold leading-6 text-slate-500">{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs font-black text-slate-400">{order.time}</span><span className="font-black">{money(order.total)}</span></div></article>)}</div> : <EmptyState title="No orders" text={`Orders for ${cafeConfig.name} will appear here when they are placed.`} />}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-[1.7rem] bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><h2 className="mt-3 truncate text-2xl font-black text-slate-950">{value}</h2><p className="mt-2 text-sm font-bold text-slate-500">{detail}</p></article>;
}

function ProductCard({ product, rank, maxQuantity }: { product: ProductSale; rank?: number; maxQuantity: number }) {
  const progress = Math.max(10, (product.quantity / Math.max(1, maxQuantity)) * 100);
  return <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3">{rank && <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-black text-white">{rank}</div>}<div className="min-w-0"><h3 className="truncate font-black">{product.name}</h3><p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{product.category}</p></div></div><div className="grid gap-2 sm:min-w-36 sm:text-right"><p className="text-sm font-black text-slate-950">{product.quantity} sold</p><p className="text-sm font-black text-orange-600">{money(product.revenue)}</p></div></div><div className="mt-4 h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} /></div></article>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-2 text-sm font-bold leading-6 text-slate-500">{text}</p></div>;
}
