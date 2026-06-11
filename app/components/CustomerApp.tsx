"use client";

import { useMemo, useState } from "react";
import HomeView from "./HomeView";
import DetailView from "./DetailView";
import CartSheet from "./CartSheet";
import { Center, Phone } from "./AppShell";
import { menuItems, type MenuItem } from "../lib/menu";

export default function CustomerApp() {
  const [screen, setScreen] = useState<"home" | "detail" | "done">("home");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MenuItem>(menuItems[0]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => (category === "All" || item.category === category) && (!q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)));
  }, [category, query]);

  const cartItems = menuItems.map((item) => ({ ...item, qty: cart[item.id] || 0 })).filter((item) => item.qty > 0);
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  function add(id: number) {
    setCart((old) => ({ ...old, [id]: (old[id] || 0) + 1 }));
  }

  function remove(id: number) {
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

  function sendOrder() {
    if (!cartItems.length) return;
    setCartOpen(false);
    setScreen("done");
  }

  if (screen === "done") {
    return <Phone><Center><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-3xl font-black text-white">OK</div><p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-600">Sent to kitchen</p><h1 className="mt-2 text-3xl font-black text-slate-950">Order placed</h1><p className="mt-3 text-sm font-bold text-slate-500">Your order is being prepared for table 3.</p><button onClick={() => { setCart({}); setScreen("home"); }} className="primary mt-6">Order more</button></Center></Phone>;
  }

  if (screen === "detail") {
    return <Phone><DetailView item={selected} qty={cart[selected.id] || 0} add={add} remove={remove} back={() => setScreen("home")} openCart={() => setCartOpen(true)} />{cartOpen && <CartSheet items={cartItems} total={total} close={() => setCartOpen(false)} add={add} remove={remove} send={sendOrder} />}</Phone>;
  }

  return <Phone><HomeView category={category} setCategory={setCategory} query={query} setQuery={setQuery} filtered={filtered} cart={cart} count={count} total={total} add={add} remove={remove} openItem={openItem} openCart={() => setCartOpen(true)} />{cartOpen && <CartSheet items={cartItems} total={total} close={() => setCartOpen(false)} add={add} remove={remove} send={sendOrder} />}</Phone>;
}
