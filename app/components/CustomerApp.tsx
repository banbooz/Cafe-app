"use client";

import { useEffect, useMemo, useState } from "react";
import HomeView from "./HomeView";
import DetailView from "./DetailView";
import CartSheet from "./CartSheet";
import UpsellSheet from "./UpsellSheet";
import { Center, Phone } from "./AppShell";
import { cafeConfig } from "../lib/cafeConfig";
import { menuItems, type MenuItem } from "../lib/menu";
import { isItemAvailable, useMenuAvailability } from "../lib/availability";
import { applyMenuSettings, useMenuSettings } from "../lib/menuSettings";
import { customerStatusText, findKitchenOrder, prependKitchenOrder, readCurrentCustomerOrderId, subscribeToKitchenOrders, type KitchenOrder, type OrderStatus } from "../lib/orders";

const orderSteps: OrderStatus[] = ["new", "preparing", "ready", "served"];
const MIN_SERVER_CHECK_MS = 900;
const stripeCheckoutEnabled = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED === "true";

const upsellGroups = [
  { name: "drink", categories: ["Drinks"] },
  { name: "dessert", categories: ["Pudding"] },
  { name: "mainOrStarter", categories: ["Main", "Starter"] },
] as const;

type OrderApiResponse =
  | { ok: true; order: KitchenOrder }
  | { ok: false; error?: string };

type CheckoutApiResponse =
  | { ok: true; checkoutUrl: string; orderId: number }
  | { ok: false; error?: string };

function orderStepIndex(status: OrderStatus) {
  return orderSteps.indexOf(status);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCartItemIds(cart: Record<number, number>) {
  return new Set(Object.entries(cart).filter(([, qty]) => qty > 0).map(([id]) => Number(id)));
}

function chooseUpsellRecommendations(items: MenuItem[], cart: Record<number, number>) {
  const cartIds = getCartItemIds(cart);
  const usedRecommendationIds = new Set<number>();
  const availableOptions = items.filter((item) => item.available !== false && !cartIds.has(item.id));

  return upsellGroups
    .map((group) => {
      const recommendation = availableOptions.find((item) => group.categories.includes(item.category as never) && !usedRecommendationIds.has(item.id));
      if (recommendation) usedRecommendationIds.add(recommendation.id);
      return recommendation;
    })
    .filter((item): item is MenuItem => Boolean(item));
}

function CustomerOrderStatus({ order }: { order: KitchenOrder | null }) {
  const status = order?.status || "new";
  const activeStep = orderStepIndex(status);

  return (
    <div className="mt-5 w-full rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Live order status</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{customerStatusText[status]}</h2>
      <p className="mt-2 text-sm font-bold text-slate-500">Kitchen updates this when your order moves forward.</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {orderSteps.map((step, index) => (
          <div key={step} className={index <= activeStep ? "h-2 rounded-full bg-slate-900" : "h-2 rounded-full bg-slate-200"} />
        ))}
      </div>
      {order && <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Order #{order.id}</p>}
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
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const { availability } = useMenuAvailability();
  const { settings } = useMenuSettings();

  useEffect(() => {
    function refreshCurrentOrder() {
      const orderId = currentOrder?.id || readCurrentCustomerOrderId();
      if (!orderId) return;
      setCurrentOrder(findKitchenOrder(orderId));
    }

    refreshCurrentOrder();
    return subscribeToKitchenOrders(refreshCurrentOrder);
  }, [currentOrder?.id]);

  const itemsWithAvailability = useMemo(
    () => menuItems.map((item) => {
      const edited = applyMenuSettings(item, settings);
      return { ...edited, available: isItemAvailable(item.id, availability) };
    }),
    [availability, settings]
  );

  const selectedWithAvailability = useMemo(
    () => itemsWithAvailability.find((item) => item.id === selected.id) || selected,
    [itemsWithAvailability, selected]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return itemsWithAvailability.filter((item) => {
      const byPopular = !popularOnly || item.popular;
      const byCategory = popularOnly || category === "All" || item.category === category;
      const bySearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return byPopular && byCategory && bySearch;
    });
  }, [category, query, popularOnly, itemsWithAvailability]);

  const cartItems = itemsWithAvailability.map((item) => ({ ...item, qty: cart[item.id] || 0 })).filter((item) => item.qty > 0);
  const unavailableCartItems = cartItems.filter((item) => item.available === false);
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const upsellRecommendations = useMemo(() => chooseUpsellRecommendations(itemsWithAvailability, cart), [cart, itemsWithAvailability]);

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

  function openItem(item: MenuItem) {
    setSelected(item);
    setScreen("detail");
  }

  function closeCart() {
    setUpsellOpen(false);
    setCartOpen(false);
  }

  function orderRequestBody() {
    return {
      items: cartItems.map((item) => ({ id: item.id, quantity: item.qty })),
      notes: chefNotes,
    };
  }

  async function validateOrderOnServer() {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderRequestBody()),
    });

    const result = (await response.json()) as OrderApiResponse;
    if (!response.ok || !result.ok) {
      throw new Error(!result.ok && result.error ? result.error : "The order could not be checked.");
    }

    return result.order;
  }

  async function startStripeCheckout() {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderRequestBody()),
    });

    const result = (await response.json()) as CheckoutApiResponse;
    if (!response.ok || !result.ok) {
      throw new Error(!result.ok && result.error ? result.error : "Stripe checkout could not start.");
    }

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

    if (upsellRecommendations.length) {
      setUpsellOpen(true);
      return;
    }

    void sendOrder();
  }

  function continueAfterUpsell() {
    setUpsellOpen(false);
    void sendOrder();
  }

  const cartSheet = cartOpen && (
    <CartSheet
      items={cartItems}
      total={total}
      chefNotes={chefNotes}
      setChefNotes={setChefNotes}
      close={closeCart}
      add={add}
      remove={remove}
      send={requestCheckout}
      isSubmitting={isSubmittingOrder}
      orderError={orderError}
    />
  );

  const upsellSheet = upsellOpen && (
    <UpsellSheet
      recommendations={upsellRecommendations}
      add={add}
      close={() => setUpsellOpen(false)}
      continueToCheckout={continueAfterUpsell}
      isSubmitting={isSubmittingOrder}
    />
  );

  if (screen === "done") {
    return (
      <Phone>
        <Center>
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-3xl font-black text-white">OK</div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-600">Server validated and sent to kitchen</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Order placed</h1>
          <p className="mt-3 text-sm font-bold text-slate-500">Track your {cafeConfig.name} table {cafeConfig.tableNumber} order below.</p>
          <CustomerOrderStatus order={currentOrder} />
          <button onClick={() => { setCart({}); setChefNotes(""); setCurrentOrder(null); setScreen("home"); }} className="primary mt-6">Order more</button>
        </Center>
      </Phone>
    );
  }

  if (screen === "detail") {
    return (
      <Phone>
        <DetailView item={selectedWithAvailability} qty={cart[selected.id] || 0} add={add} remove={remove} back={() => setScreen("home")} openCart={() => setCartOpen(true)} />
        {cartSheet}
        {upsellSheet}
      </Phone>
    );
  }

  return (
    <Phone>
      <HomeView
        category={category}
        setCategory={setCategory}
        query={query}
        setQuery={setQuery}
        filtered={filtered}
        cart={cart}
        count={count}
        total={total}
        popularOnly={popularOnly}
        showPopular={() => { setPopularOnly(true); setCategory("All"); }}
        showAll={() => setPopularOnly(false)}
        add={add}
        remove={remove}
        openItem={openItem}
        openCart={() => setCartOpen(true)}
      />
      {cartSheet}
      {upsellSheet}
    </Phone>
  );
}
