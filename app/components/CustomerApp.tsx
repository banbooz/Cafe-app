"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import HomeView from "./HomeView";
import DetailView from "./DetailView";
import CartSheet from "./CartSheet";
import UpsellSheet from "./UpsellSheet";
import { Center, Phone } from "./AppShell";
import { cafeConfig, getCafeStorageKey } from "../lib/cafeConfig";
import { menuItems, money, type MenuItem } from "../lib/menu";
import { isItemAvailable, useMenuAvailability } from "../lib/availability";
import { useMenuCatalogue } from "../lib/menuCatalog";
import { useMenuSettings } from "../lib/menuSettings";
import { customerStatusText, findKitchenOrder, prependKitchenOrder, readCurrentCustomerOrderId, subscribeToKitchenOrders, type KitchenOrder, type OrderStatus } from "../lib/orders";

const orderSteps: OrderStatus[] = ["new", "preparing", "ready", "served"];
const MIN_SERVER_CHECK_MS = 900;
const CUSTOMER_TABLE_STORAGE_KEY = getCafeStorageKey("cafeCustomerSelectedTable");
const stripeCheckoutEnabled = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED === "true";
const upsellGroups = [["Drinks"], ["Pudding"], ["Main", "Starter"]];

type OrderApiResponse = { ok: true; order: KitchenOrder } | { ok: false; error?: string };
type CheckoutApiResponse = { ok: true; checkoutUrl: string; orderId: number } | { ok: false; error?: string };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeTableNumber(value: unknown) {
  const next = Number(value);
  return Number.isInteger(next) && next >= 1 && next <= 999 ? next : cafeConfig.tableNumber;
}

function cleanUrlTableNumber(value: string | null) {
  const next = Number(value);
  return value && Number.isInteger(next) && next >= 1 && next <= 999 ? next : null;
}

function readSavedTableNumber() {
  if (typeof window === "undefined") return cafeConfig.tableNumber;
  const saved = window.localStorage.getItem(CUSTOMER_TABLE_STORAGE_KEY);
  return saved ? safeTableNumber(saved) : cafeConfig.tableNumber;
}

function moneyValue(value: number) {
  return Number(value.toFixed(2));
}

function readWindowScrollY() {
  if (typeof window === "undefined") return 0;
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function pickUpsells(items: MenuItem[], cart: Record<number, number>) {
  const inCart = new Set(Object.entries(cart).filter(([, qty]) => qty > 0).map(([id]) => Number(id)));
  const used = new Set<number>();
  const options = items.filter((item) => item.available !== false && !inCart.has(item.id));
  return upsellGroups
    .map((group) => {
      const item = options.find((option) => group.includes(option.category) && !used.has(option.id));
      if (item) used.add(item.id);
      return item;
    })
    .filter((item): item is MenuItem => Boolean(item));
}

function snapshot(item: MenuItem) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    price: item.price,
    image: item.image,
    prep: item.prep,
    allergens: item.allergens,
    popular: Boolean(item.popular),
    vegetarian: Boolean(item.vegetarian),
    vegan: Boolean(item.vegan),
  };
}

function CustomerOrderStatus({ order }: { order: KitchenOrder | null }) {
  const status = order?.status || "new";
  const activeStep = orderSteps.indexOf(status);

  return (
    <div className="mt-5 w-full rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Live order status</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{customerStatusText[status]}</h2>
      <p className="mt-2 text-sm font-bold text-slate-500">Kitchen updates this when your order moves forward.</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {orderSteps.map((step, index) => <div key={step} className={index <= activeStep ? "h-2 rounded-full bg-slate-900" : "h-2 rounded-full bg-slate-200"} />)}
      </div>
      {order && <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Table {order.table} - Order #{order.id}</p>}
      {order?.tipAmount ? <p className="mt-2 text-xs font-black text-[#617174]">Tip added: {money(order.tipAmount)}</p> : null}
    </div>
  );
}

export default function CustomerApp() {
  const searchParams = useSearchParams();
  const tableFromUrl = cleanUrlTableNumber(searchParams.get("table"));
  const [screen, setScreen] = useState<"home" | "detail" | "done">("home");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [selected, setSelected] = useState<MenuItem>(menuItems[0]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [chefNotes, setChefNotes] = useState("");
  const [currentOrder, setCurrentOrder] = useState<KitchenOrder | null>(null);
  const [selectedTable, setSelectedTable] = useState(() => tableFromUrl || cafeConfig.tableNumber);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const homeScrollYRef = useRef(0);
  const shouldRestoreHomeScrollRef = useRef(false);
  const { availability } = useMenuAvailability();
  const { settings } = useMenuSettings();
  const { visibleItems } = useMenuCatalogue(settings);

  useEffect(() => {
    const nextTable = tableFromUrl || readSavedTableNumber();
    setSelectedTable(nextTable);
    setTableLoaded(true);
    if (typeof window !== "undefined") window.localStorage.setItem(CUSTOMER_TABLE_STORAGE_KEY, String(nextTable));
  }, [tableFromUrl]);

  useEffect(() => {
    if (tableLoaded && typeof window !== "undefined") window.localStorage.setItem(CUSTOMER_TABLE_STORAGE_KEY, String(selectedTable));
  }, [selectedTable, tableLoaded]);

  useEffect(() => {
    function refreshCurrentOrder() {
      const orderId = currentOrder?.id || readCurrentCustomerOrderId();
      if (orderId) setCurrentOrder(findKitchenOrder(orderId));
    }
    refreshCurrentOrder();
    return subscribeToKitchenOrders(refreshCurrentOrder);
  }, [currentOrder?.id]);

  const itemsWithAvailability = useMemo(() => visibleItems.map((item) => ({ ...item, available: isItemAvailable(item.id, availability) })), [availability, visibleItems]);
  const selectedWithAvailability = useMemo(() => itemsWithAvailability.find((item) => item.id === selected.id) || itemsWithAvailability[0] || selected, [itemsWithAvailability, selected]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return itemsWithAvailability.filter((item) => {
      const byPopular = !popularOnly || item.popular;
      const byCategory = popularOnly || category === "All" || item.category === category;
      const bySearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return byPopular && byCategory && bySearch;
    });
  }, [category, query, popularOnly, itemsWithAvailability]);

  useEffect(() => {
    if (screen !== "home" || !shouldRestoreHomeScrollRef.current || typeof window === "undefined") return;
    shouldRestoreHomeScrollRef.current = false;
    const savedScrollY = homeScrollYRef.current;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY, behavior: "auto" });
      window.requestAnimationFrame(() => window.scrollTo({ top: savedScrollY, behavior: "auto" }));
    });
  }, [screen, filtered.length, category, query, popularOnly]);

  const cartItems = itemsWithAvailability.map((item) => ({ ...item, qty: cart[item.id] || 0 })).filter((item) => item.qty > 0);
  const unavailableCartItems = cartItems.filter((item) => item.available === false);
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = moneyValue(cartItems.reduce((sum, item) => sum + item.qty * item.price, 0));
  const tipAmount = moneyValue(tipPercentage ? (subtotal * tipPercentage) / 100 : 0);
  const total = moneyValue(subtotal + tipAmount);
  const upsellRecommendations = useMemo(() => pickUpsells(itemsWithAvailability, cart), [cart, itemsWithAvailability]);

  function updateSelectedTable(table: number) {
    setSelectedTable(safeTableNumber(table));
  }

  function add(id: number) {
    setOrderError("");
    if (!isItemAvailable(id, availability)) return;
    setCart((old) => ({ ...old, [id]: (old[id] || 0) + 1 }));
  }

  function remove(id: number) {
    setOrderError("");
    setCart((old) => {
      const next = { ...old };
      const qty = (next[id] || 0) - 1;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  function openMenuItem(item: MenuItem) {
    homeScrollYRef.current = readWindowScrollY();
    setSelected(item);
    setScreen("detail");
  }

  function backToMenu() {
    shouldRestoreHomeScrollRef.current = true;
    setScreen("home");
  }

  function orderRequestBody() {
    return { table: selectedTable, tipPercentage: tipPercentage || 0, items: cartItems.map((item) => ({ id: item.id, quantity: item.qty, item: snapshot(item) })), notes: chefNotes };
  }

  async function validateOrderOnServer() {
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderRequestBody()) });
    const result = (await response.json()) as OrderApiResponse;
    if (!response.ok || !result.ok) throw new Error(!result.ok && result.error ? result.error : "The order could not be checked.");
    return result.order;
  }

  async function startStripeCheckout() {
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderRequestBody()) });
    const result = (await response.json()) as CheckoutApiResponse;
    if (!response.ok || !result.ok) throw new Error(!result.ok && result.error ? result.error : "Stripe checkout could not start.");
    window.location.href = result.checkoutUrl;
  }

  async function sendOrder() {
    if (!cartItems.length || unavailableCartItems.length || isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      if (stripeCheckoutEnabled) {
        await Promise.all([startStripeCheckout(), wait(MIN_SERVER_CHECK_MS)]);
        return;
      }
      const [order] = await Promise.all([validateOrderOnServer(), wait(MIN_SERVER_CHECK_MS)]);
      prependKitchenOrder(order);
      setCurrentOrder(order);
      setCartOpen(false);
      setUpsellOpen(false);
      setScreen("done");
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "The order could not be checked.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function requestCheckout() {
    if (!cartItems.length || unavailableCartItems.length || isSubmittingOrder) return;
    setOrderError("");
    if (upsellRecommendations.length) setUpsellOpen(true);
    else void sendOrder();
  }

  const cartSheet = cartOpen && <CartSheet items={cartItems} subtotal={subtotal} tipPercentage={tipPercentage} tipAmount={tipAmount} total={total} chefNotes={chefNotes} setChefNotes={setChefNotes} setTipPercentage={setTipPercentage} close={() => { setUpsellOpen(false); setCartOpen(false); }} add={add} remove={remove} send={requestCheckout} isSubmitting={isSubmittingOrder} orderError={orderError} />;
  const upsellSheet = upsellOpen && <UpsellSheet recommendations={upsellRecommendations} add={add} close={() => setUpsellOpen(false)} continueToCheckout={() => { setUpsellOpen(false); void sendOrder(); }} isSubmitting={isSubmittingOrder} />;

  if (screen === "done") {
    return (
      <Phone>
        <Center>
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-3xl font-black text-white">OK</div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-600">Server validated and sent to kitchen</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Order placed</h1>
          <p className="mt-3 text-sm font-bold text-slate-500">Track your {cafeConfig.name} table {currentOrder?.table || selectedTable} order below.</p>
          <CustomerOrderStatus order={currentOrder} />
          <button onClick={() => { setCart({}); setChefNotes(""); setTipPercentage(null); setCurrentOrder(null); setScreen("home"); }} className="primary mt-6">Order more</button>
        </Center>
      </Phone>
    );
  }

  if (screen === "detail") {
    return <Phone><DetailView item={selectedWithAvailability} qty={cart[selected.id] || 0} add={add} remove={remove} back={backToMenu} openCart={() => setCartOpen(true)} />{cartSheet}{upsellSheet}</Phone>;
  }

  return <Phone><HomeView category={category} setCategory={setCategory} query={query} setQuery={setQuery} filtered={filtered} cart={cart} count={count} total={total} popularOnly={popularOnly} showPopular={() => { setPopularOnly(true); setCategory("All"); }} showAll={() => setPopularOnly(false)} add={add} remove={remove} openItem={openMenuItem} openCart={() => setCartOpen(true)} tableNumber={selectedTable} changeTable={updateSelectedTable} />{cartSheet}{upsellSheet}</Phone>;
}
