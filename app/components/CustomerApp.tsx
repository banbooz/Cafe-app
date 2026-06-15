"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
const CUSTOMER_ORDER_STORAGE_KEY = getCafeStorageKey("cafeCurrentCustomerOrderId");
const stripeCheckoutEnabled = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED === "true";
const upsellGroups = [["Drinks"], ["Pudding"], ["Main", "Starter"]];

type OrderApiResponse = { ok: true; order: KitchenOrder } | { ok: false; error?: string };
type CheckoutApiResponse = { ok: true; checkoutUrl: string; orderId: number } | { ok: false; error?: string };
type PaymentNotice = { type: "success" | "error" | "info"; title: string; text: string };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeTableNumber(value: unknown) {
  const next = Number(value);
  return Number.isInteger(next) && next >= 1 && next <= 999 ? next : cafeConfig.tableNumber;
}

function cleanOrderId(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : null;
}

function rememberCustomerOrderId(orderId: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_ORDER_STORAGE_KEY, String(orderId));
}

function cleanUrlTableNumber(value: string | null) {
  const next = Number(value);
  return value && Number.isInteger(next) && next >= 1 && next <= 999 ? next : null;
}

function readTableFromCurrentUrl() {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return cleanUrlTableNumber(url.searchParams.get("table"));
}

function readSavedTableNumber() {
  if (typeof window === "undefined") return cafeConfig.tableNumber;
  const saved = window.localStorage.getItem(CUSTOMER_TABLE_STORAGE_KEY);
  return saved ? safeTableNumber(saved) : cafeConfig.tableNumber;
}

function readInitialTableNumber() {
  return readTableFromCurrentUrl() || readSavedTableNumber();
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

function PaymentBanner({ notice, close }: { notice: PaymentNotice | null; close?: () => void }) {
  if (!notice) return null;
  const style = notice.type === "error" ? "bg-rose-50 text-rose-900 ring-rose-200" : notice.type === "success" ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-sky-50 text-sky-900 ring-sky-200";
  return (
    <div className={`mx-4 mb-4 rounded-3xl p-4 text-left ring-1 ${style}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">{notice.type === "error" ? "Payment issue" : "Payment update"}</p>
          <h2 className="mt-1 text-lg font-black">{notice.title}</h2>
          <p className="mt-1 text-sm font-bold leading-5 opacity-80">{notice.text}</p>
        </div>
        {close ? <button onClick={close} className="rounded-full bg-white/70 px-3 py-1 text-xs font-black">Close</button> : null}
      </div>
    </div>
  );
}

function CustomerOrderStatus({ order, confirming }: { order: KitchenOrder | null; confirming: boolean }) {
  if (!order) {
    return (
      <div className="mt-5 w-full rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Payment confirmed</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">{confirming ? "Sending to kitchen" : "Waiting for kitchen sync"}</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">The server is checking Stripe and sending the paid order to the kitchen. Refreshing will not create a duplicate.</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {orderSteps.map((step, index) => <div key={step} className={index === 0 ? "h-2 rounded-full bg-slate-900" : "h-2 rounded-full bg-slate-200"} />)}
        </div>
      </div>
    );
  }

  const status = order.status || "new";
  const activeStep = orderSteps.indexOf(status);

  return (
    <div className="mt-5 w-full rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Live order status</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{customerStatusText[status]}</h2>
      <p className="mt-2 text-sm font-bold text-slate-500">This updates live when the kitchen changes your order to Preparing, Ready, or Served.</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {orderSteps.map((step, index) => <div key={step} className={index <= activeStep ? "h-2 rounded-full bg-slate-900" : "h-2 rounded-full bg-slate-200"} />)}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
        <span>Received</span><span>Preparing</span><span>Ready</span><span>Served</span>
      </div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Table {order.table} - Order #{order.id}</p>
      {order.payment?.status === "paid" ? <p className="mt-2 text-xs font-black text-emerald-700">Paid by Stripe</p> : null}
      {order.tipAmount ? <p className="mt-2 text-xs font-black text-[#617174]">Tip added: {money(order.tipAmount)}</p> : null}
    </div>
  );
}

function OrderReceipt({ order }: { order: KitchenOrder | null }) {
  if (!order) return null;
  return (
    <div className="mt-5 w-full rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Receipt</p>
      <div className="mt-3 space-y-2">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.name}`} className="flex items-start justify-between gap-3 text-sm font-bold text-slate-600">
            <span>{item.quantity}x {item.name}</span>
            {item.unitPrice ? <span>{money(item.unitPrice * item.quantity)}</span> : null}
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm font-black">
        {typeof order.subtotal === "number" ? <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(order.subtotal)}</span></div> : null}
        {order.tipAmount ? <div className="flex justify-between text-orange-600"><span>Tip {order.tipPercentage || 0}%</span><span>{money(order.tipAmount)}</span></div> : null}
        <div className="flex justify-between text-lg text-slate-950"><span>Total paid</span><span>{money(order.total)}</span></div>
      </div>
    </div>
  );
}

export default function CustomerApp() {
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
  const [selectedTable, setSelectedTable] = useState(() => readInitialTableNumber());
  const [tableLoaded, setTableLoaded] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState<PaymentNotice | null>(null);
  const homeScrollYRef = useRef(0);
  const shouldRestoreHomeScrollRef = useRef(false);
  const appHistoryDepthRef = useRef(0);
  const { availability } = useMenuAvailability();
  const { settings } = useMenuSettings();
  const { visibleItems } = useMenuCatalogue(settings);

  function pushAppHistoryStep(step: string) {
    if (typeof window === "undefined") return;
    appHistoryDepthRef.current += 1;
    window.history.pushState({ cafeAppStep: step, depth: appHistoryDepthRef.current }, "", window.location.href);
  }

  function goBackOr(fallback: () => void) {
    if (typeof window !== "undefined" && appHistoryDepthRef.current > 0) window.history.back();
    else fallback();
  }

  function returnToMenu() {
    shouldRestoreHomeScrollRef.current = true;
    setScreen("home");
  }

  function resetOrderAndReturnHome() {
    setCart({});
    setChefNotes("");
    setTipPercentage(null);
    setCurrentOrder(null);
    setPaymentNotice(null);
    setScreen("home");
  }

  useLayoutEffect(() => {
    const nextTable = readInitialTableNumber();
    setSelectedTable(nextTable);
    setTableLoaded(true);
    window.localStorage.setItem(CUSTOMER_TABLE_STORAGE_KEY, String(nextTable));
    window.history.replaceState({ ...(window.history.state || {}), cafeAppStep: "home", depth: 0 }, "", window.location.href);
  }, []);

  useEffect(() => {
    function handlePopState() {
      if (appHistoryDepthRef.current > 0) appHistoryDepthRef.current -= 1;
      if (upsellOpen) {
        setUpsellOpen(false);
        return;
      }
      if (cartOpen) {
        setCartOpen(false);
        return;
      }
      if (screen === "detail") {
        returnToMenu();
        return;
      }
      if (screen === "done") {
        resetOrderAndReturnHome();
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [cartOpen, upsellOpen, screen]);

  async function findOrderWithRetry(orderId: number) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const order = findKitchenOrder(orderId);
      if (order) return order;
      await wait(700);
    }
    return findKitchenOrder(orderId);
  }

  async function confirmPaidStripeReturn(orderId: number, sessionId: string) {
    setIsConfirmingPayment(true);
    try {
      if (sessionId.startsWith("cs_")) {
        const response = await fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Payment was taken, but the order could not be confirmed with the kitchen yet.");
      }

      const order = await findOrderWithRetry(orderId);
      if (order) {
        setCurrentOrder(order);
        setPaymentNotice({ type: "success", title: "Payment successful", text: "Your paid order has been sent to the kitchen." });
      } else {
        setPaymentNotice({ type: "info", title: "Payment confirmed", text: "Your payment is confirmed and the kitchen order is still syncing. It should appear shortly." });
      }
    } catch (error) {
      setPaymentNotice({ type: "error", title: "Payment confirmed, order not synced", text: error instanceof Error ? error.message : "Check the kitchen and Vercel logs before taking another payment." });
    } finally {
      setIsConfirmingPayment(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const paymentStatus = url.searchParams.get("payment");
    const paidOrderId = cleanOrderId(url.searchParams.get("order_id"));
    const sessionId = url.searchParams.get("session_id") || "";

    if (paymentStatus === "success" && paidOrderId) {
      rememberCustomerOrderId(paidOrderId);
      setCurrentOrder(findKitchenOrder(paidOrderId));
      setCart({});
      setChefNotes("");
      setTipPercentage(null);
      setCartOpen(false);
      setUpsellOpen(false);
      pushAppHistoryStep("done");
      setScreen("done");
      setPaymentNotice({ type: "info", title: "Checking payment", text: "We are confirming the Stripe payment and sending your order to the kitchen." });
      void confirmPaidStripeReturn(paidOrderId, sessionId);
      url.searchParams.delete("payment");
      url.searchParams.delete("order_id");
      url.searchParams.delete("session_id");
      window.history.replaceState({ ...(window.history.state || {}), cafeAppStep: "done" }, "", url.pathname + (url.search ? url.search : ""));
    }

    if (paymentStatus === "cancelled") {
      setPaymentNotice({ type: "error", title: "Payment cancelled", text: "Your payment was cancelled, so no order was sent to the kitchen." });
      setOrderError("Payment was cancelled. Your order has not been sent to the kitchen.");
      url.searchParams.delete("payment");
      url.searchParams.delete("order_id");
      window.history.replaceState({ ...(window.history.state || {}), cafeAppStep: "home" }, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);

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
    setPaymentNotice(null);
    if (!isItemAvailable(id, availability)) return;
    setCart((old) => ({ ...old, [id]: (old[id] || 0) + 1 }));
  }

  function remove(id: number) {
    setOrderError("");
    setPaymentNotice(null);
    setCart((old) => {
      const next = { ...old };
      const qty = (next[id] || 0) - 1;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  function openCartSheet() {
    if (!cartOpen) pushAppHistoryStep("cart");
    setCartOpen(true);
  }

  function closeCartSheet() {
    goBackOr(() => {
      setUpsellOpen(false);
      setCartOpen(false);
    });
  }

  function openUpsellSheet() {
    if (!upsellOpen) pushAppHistoryStep("upsell");
    setUpsellOpen(true);
  }

  function closeUpsellSheet() {
    goBackOr(() => setUpsellOpen(false));
  }

  function openMenuItem(item: MenuItem) {
    homeScrollYRef.current = readWindowScrollY();
    pushAppHistoryStep("detail");
    setSelected(item);
    setScreen("detail");
  }

  function backToMenu() {
    goBackOr(returnToMenu);
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
    rememberCustomerOrderId(result.orderId);
    window.location.href = result.checkoutUrl;
  }

  async function sendOrder() {
    if (!cartItems.length || unavailableCartItems.length || isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    setOrderError("");
    setPaymentNotice(null);
    try {
      if (stripeCheckoutEnabled) {
        await Promise.all([startStripeCheckout(), wait(MIN_SERVER_CHECK_MS)]);
        return;
      }
      const [order] = await Promise.all([validateOrderOnServer(), wait(MIN_SERVER_CHECK_MS)]);
      prependKitchenOrder(order);
      setCurrentOrder(order);
      setPaymentNotice({ type: "success", title: "Order sent", text: "Demo order sent to the kitchen." });
      setCartOpen(false);
      setUpsellOpen(false);
      pushAppHistoryStep("done");
      setScreen("done");
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "The order could not be checked.");
      setPaymentNotice({ type: "error", title: "Checkout failed", text: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function requestCheckout() {
    if (!cartItems.length || unavailableCartItems.length || isSubmittingOrder) return;
    setOrderError("");
    setPaymentNotice(null);
    if (upsellRecommendations.length) openUpsellSheet();
    else void sendOrder();
  }

  const cartSheet = cartOpen && <CartSheet items={cartItems} subtotal={subtotal} tipPercentage={tipPercentage} tipAmount={tipAmount} total={total} chefNotes={chefNotes} setChefNotes={setChefNotes} setTipPercentage={setTipPercentage} close={closeCartSheet} add={add} remove={remove} send={requestCheckout} isSubmitting={isSubmittingOrder} orderError={orderError} />;
  const upsellSheet = upsellOpen && <UpsellSheet recommendations={upsellRecommendations} add={add} close={closeUpsellSheet} continueToCheckout={() => { setUpsellOpen(false); void sendOrder(); }} isSubmitting={isSubmittingOrder} />;

  if (screen === "done") {
    return (
      <Phone>
        <Center>
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-3xl font-black text-white">OK</div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-600">{currentOrder ? "Paid and sent to kitchen" : isConfirmingPayment ? "Confirming payment" : "Payment update"}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{currentOrder ? "Order placed" : isConfirmingPayment ? "Sending order" : "Check kitchen"}</h1>
          <p className="mt-3 text-sm font-bold text-slate-500">Track your {cafeConfig.name} table {currentOrder?.table || selectedTable} order below.</p>
          <PaymentBanner notice={paymentNotice} />
          <CustomerOrderStatus order={currentOrder} confirming={isConfirmingPayment} />
          <OrderReceipt order={currentOrder} />
          <button onClick={resetOrderAndReturnHome} className="primary mt-6">Order more</button>
        </Center>
      </Phone>
    );
  }

  if (screen === "detail") {
    return <Phone><PaymentBanner notice={paymentNotice} close={() => setPaymentNotice(null)} /><DetailView item={selectedWithAvailability} qty={cart[selected.id] || 0} add={add} remove={remove} back={backToMenu} openCart={openCartSheet} />{cartSheet}{upsellSheet}</Phone>;
  }

  return <Phone><PaymentBanner notice={paymentNotice} close={() => setPaymentNotice(null)} /><HomeView category={category} setCategory={setCategory} query={query} setQuery={setQuery} filtered={filtered} cart={cart} count={count} total={total} popularOnly={popularOnly} showPopular={() => { setPopularOnly(true); setCategory("All"); }} showAll={() => setPopularOnly(false)} add={add} remove={remove} openItem={openMenuItem} openCart={openCartSheet} tableNumber={selectedTable} changeTable={updateSelectedTable} />{cartSheet}{upsellSheet}</Phone>;
}
