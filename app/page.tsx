"use client";

import { useMemo, useState } from "react";

type Screen = "menu" | "detail" | "cart" | "allergens" | "tables" | "confirmed";
type Category = "All" | "Breakfast" | "Lunch" | "Bakery" | "Coffee" | "Cold";
type OrderType = "Dine in" | "Takeaway" | "Delivery";

type Item = {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  tag: string;
  description: string;
  price: number;
  image: string;
  allergens: string[];
  prep: string;
  popular?: boolean;
};

const categories: Category[] = ["All", "Breakfast", "Lunch", "Bakery", "Coffee", "Cold"];
const orderTypes: OrderType[] = ["Dine in", "Takeaway", "Delivery"];

const items: Item[] = [
  { id: 1, name: "Smashed Avocado Toast", category: "Breakfast", tag: "Sourdough, chilli, lemon", description: "Toasted sourdough with avocado, lemon, herbs and cracked pepper.", price: 6.9, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80", allergens: ["Gluten"], prep: "7 min", popular: true },
  { id: 2, name: "Turkish Eggs", category: "Breakfast", tag: "Garlic yoghurt, paprika butter", description: "Poached eggs over whipped yoghurt with paprika butter and warm flatbread.", price: 8.4, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80", allergens: ["Egg", "Milk", "Gluten"], prep: "10 min" },
  { id: 3, name: "Roast Chicken Ciabatta", category: "Lunch", tag: "Leaves, tomato, house aioli", description: "Warm ciabatta with roast chicken, salad leaves, tomato and house aioli.", price: 7.8, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80", allergens: ["Gluten", "Egg", "Mustard"], prep: "8 min", popular: true },
  { id: 4, name: "Tomato Basil Spaghetti", category: "Lunch", tag: "Parmesan, garlic, basil", description: "Spaghetti in tomato and garlic sauce with basil and shaved parmesan.", price: 9.5, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80", allergens: ["Gluten", "Milk"], prep: "12 min", popular: true },
  { id: 5, name: "Dark Chocolate Gateau", category: "Bakery", tag: "Ganache, cocoa, cream", description: "Layered chocolate sponge with glossy ganache and a cocoa finish.", price: 5.2, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", allergens: ["Gluten", "Milk", "Egg"], prep: "4 min", popular: true },
  { id: 6, name: "Almond Croissant", category: "Bakery", tag: "Baked daily, almond cream", description: "Flaky croissant filled with almond cream and toasted almonds.", price: 3.9, image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80", allergens: ["Gluten", "Milk", "Egg", "Nuts"], prep: "5 min" },
  { id: 7, name: "Flat White", category: "Coffee", tag: "Double espresso, steamed milk", description: "Double espresso with silky steamed milk and a smooth microfoam finish.", price: 3.4, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80", allergens: ["Milk"], prep: "3 min", popular: true },
  { id: 8, name: "Iced Latte", category: "Cold", tag: "Espresso, milk, ice", description: "Chilled espresso poured over milk and ice.", price: 4.1, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80", allergens: ["Milk"], prep: "3 min", popular: true },
  { id: 9, name: "Fresh Lemonade", category: "Cold", tag: "Sparkling, mint, lemon", description: "Sparkling lemonade with fresh lemon slices, mint and crushed ice.", price: 3.6, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80", allergens: ["None listed"], prep: "3 min" },
];

const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [table, setTable] = useState(3);
  const [selected, setSelected] = useState(items[0]);
  const [orderType, setOrderType] = useState<OrderType>("Dine in");
  const [note, setNote] = useState("");
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const [confirmed, setConfirmed] = useState<{ id: number; total: number } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const byCategory = category === "All" || item.category === category;
      const bySearch = !q || item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
      return byCategory && bySearch;
    });
  }, [category, query]);

  const cartItems = items.map((item) => ({ ...item, qty: cart[item.id] || 0 })).filter((item) => item.qty > 0);
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const service = orderType === "Dine in" ? subtotal * 0.05 : 0;
  const total = subtotal + service;

  function go(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function add(id: number) {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  }

  function remove(id: number) {
    setCart((current) => {
      const next = { ...current };
      const qty = (next[id] || 0) - 1;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  function openItem(item: Item) {
    setSelected(item);
    go("detail");
  }

  function callWaiter() {
    setWaiterCalled(true);
    window.setTimeout(() => setWaiterCalled(false), 3000);
  }

  function placeOrder() {
    if (!count) return;
    setConfirmed({ id: Math.floor(4200 + Math.random() * 700), total });
    setCart({});
    setNote("");
    go("confirmed");
  }

  if (screen === "detail") {
    const qty = cart[selected.id] || 0;
    const fav = favs[selected.id];
    return (
      <Shell>
        <Top title={selected.name} back={() => go("menu")} right="Allergens" onRight={() => go("allergens")} />
        <main className="px-4 pb-28 pt-4">
          <div className="h-72 rounded-[30px] bg-cover bg-center shadow-sm ring-1 ring-slate-200" style={{ backgroundImage: `url(${selected.image})` }} />
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">{selected.category}</p>
              <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950">{selected.name}</h1>
              <p className="mt-2 text-sm font-bold text-slate-500">{selected.tag} - {selected.prep}</p>
            </div>
            <button onClick={() => setFavs((current) => ({ ...current, [selected.id]: !current[selected.id] }))} className={fav ? "heart-on" : "heart"}>{fav ? "Liked" : "Like"}</button>
          </div>
          <Panel><h2 className="font-black">About this item</h2><p className="mt-2 text-sm leading-6 text-slate-600">{selected.description}</p></Panel>
          <button onClick={() => go("allergens")} className="secondary mt-4">View allergen information</button>
        </main>
        <Footer>{qty ? <div className="flex items-center gap-3 rounded-2xl bg-slate-900 p-2 text-white"><button onClick={() => remove(selected.id)} className="qty">-</button><button onClick={() => go("cart")} className="flex-1 text-sm font-black">{qty} in basket - {money(total)}</button><button onClick={() => add(selected.id)} className="qty-accent">+</button></div> : <button onClick={() => add(selected.id)} className="primary">Add to basket - {money(selected.price)}</button>}</Footer>
      </Shell>
    );
  }

  if (screen === "cart") {
    return (
      <Shell>
        <Top title="Basket" back={() => go("menu")} right="Allergens" onRight={() => go("allergens")} />
        <main className="space-y-4 px-4 pb-40 pt-4">
          <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-1 shadow-sm ring-1 ring-slate-200">{orderTypes.map((type) => <button key={type} onClick={() => setOrderType(type)} className={orderType === type ? "toggle-on" : "toggle"}>{type}</button>)}</div>
          <button onClick={() => go("tables")} className="secondary flex items-center justify-between"><span>{orderType} - Table {table}</span><span className="text-orange-600">Change</span></button>
          {cartItems.length ? cartItems.map((item) => <article key={item.id} className="flex gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200"><button onClick={() => openItem(item)} className="h-24 w-24 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><h2 className="font-black text-slate-950">{item.name}</h2><p className="mt-1 text-xs font-bold text-slate-500">{item.tag}</p><div className="mt-3 flex items-center justify-between"><span className="font-black">{money(item.price)}</span><Stepper qty={item.qty} minus={() => remove(item.id)} plus={() => add(item.id)} /></div></div></article>) : <Empty onClick={() => go("menu")} />}
          <label className="block rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Order note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-orange-500" placeholder="No tomato, oat milk, bring with cutlery..." /></label>
          <Panel><Line label="Subtotal" value={money(subtotal)} /><Line label="Table service" value={money(service)} /><Line label="Total" value={money(total)} /></Panel>
        </main>
        <Footer><button onClick={placeOrder} disabled={!count} className="primary disabled:bg-slate-300 disabled:text-slate-500">Place order - {money(total)}</button></Footer>
      </Shell>
    );
  }

  if (screen === "tables") {
    return (
      <Shell>
        <Top title="Change table" back={() => go("cart")} right="Menu" onRight={() => go("menu")} />
        <main className="px-4 pb-28 pt-4"><Panel><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Backup option</p><h1 className="mt-1 text-2xl font-black">Only change this if you scanned the wrong QR code.</h1><div className="mt-5 grid grid-cols-4 gap-3">{tables.map((id) => <button key={id} onClick={() => setTable(id)} className={table === id ? "table-on" : "table"}>{id}</button>)}</div><button onClick={() => go("cart")} className="primary mt-5">Use table {table}</button></Panel></main>
      </Shell>
    );
  }

  if (screen === "allergens") {
    return <Shell><Top title="Allergens" back={() => go("menu")} right={count ? "Basket" : "Menu"} onRight={() => go(count ? "cart" : "menu")} /><main className="px-4 pb-28 pt-4"><div className="rounded-[28px] bg-slate-900 p-5 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Food safety</p><h1 className="mt-2 text-2xl font-black">Allergen information</h1><p className="mt-3 text-sm leading-6 text-white/75">Our kitchen handles common allergens. Speak to staff before ordering if you have a serious allergy.</p></div><div className="mt-4 space-y-3">{items.map((item) => <article key={item.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><button onClick={() => openItem(item)} className="text-left"><p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">{item.category}</p><h2 className="mt-1 font-black text-slate-950">{item.name}</h2></button><div className="mt-3 flex flex-wrap gap-2">{item.allergens.map((allergen) => <span key={allergen} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{allergen}</span>)}</div></article>)}</div></main></Shell>;
  }

  if (screen === "confirmed") {
    return <Shell><main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-4xl font-black text-white">OK</div><p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-600">Sent to kitchen</p><h1 className="mt-2 text-3xl font-black text-slate-950">Order confirmed</h1><p className="mt-3 text-sm leading-6 text-slate-600">Order #{confirmed?.id} is being prepared for table {table}.</p><Panel><Line label="Total" value={money(confirmed?.total || 0)} /><Line label="Order type" value={orderType} /></Panel><button onClick={() => go("menu")} className="primary mt-4">Order more items</button><button onClick={callWaiter} className={waiterCalled ? "secondary mt-3 bg-slate-900 text-white" : "secondary mt-3"}>{waiterCalled ? "Waiter called" : "Call waiter"}</button></main></Shell>;
  }

  return (
    <Shell>
      <header className="bg-slate-900 px-4 pb-5 pt-4 text-white">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">The Corner Cafe</p><p className="mt-2 text-sm font-bold text-white/80">Table {table} confirmed from QR</p></div><div className="flex gap-2"><button onClick={callWaiter} className={waiterCalled ? "small-on" : "small"}>{waiterCalled ? "Called" : "Waiter"}</button><button onClick={() => go("allergens")} className="small">Info</button><button onClick={() => go("cart")} className="small bg-orange-500 text-white">Cart {count || ""}</button></div></div>
        <label className="mt-5 flex min-h-13 items-center rounded-2xl bg-white px-4 text-slate-900"><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Search food, coffee, cake" /></label>
      </header>
      <main className="px-4 pb-32 pt-4"><div className="flex gap-3 overflow-x-auto pb-3">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "cat-on" : "cat"}>{item}</button>)}</div><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Order at your pace</p><h1 className="mt-1 text-2xl font-black text-slate-950">Menu</h1></div><button onClick={() => go("allergens")} className="text-sm font-black text-orange-600">Allergens</button></div>{!query && category === "All" && <div className="mb-5 flex gap-3 overflow-x-auto pb-2">{items.filter((item) => item.popular).map((item) => <button key={item.id} onClick={() => openItem(item)} className="relative h-36 w-64 shrink-0 overflow-hidden rounded-3xl bg-cover bg-center text-left" style={{ backgroundImage: `url(${item.image})` }}><span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" /><span className="absolute bottom-3 left-3 right-3 font-black text-white">{item.name}</span></button>)}</div>}<div className="grid grid-cols-2 gap-3">{filtered.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"><button onClick={() => openItem(item)} className="h-36 w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><div className="p-3"><button onClick={() => openItem(item)} className="text-left"><p className="text-[11px] font-black uppercase tracking-[0.12em] text-orange-600">{item.category}</p><h2 className="mt-1 min-h-10 text-sm font-black leading-5 text-slate-950">{item.name}</h2><p className="mt-1 min-h-9 text-xs font-semibold leading-[18px] text-slate-500">{item.tag}</p></button><div className="mt-3 flex items-center justify-between"><span className="font-black">{money(item.price)}</span>{cart[item.id] ? <Stepper qty={cart[item.id]} minus={() => remove(item.id)} plus={() => add(item.id)} /> : <button onClick={() => add(item.id)} className="add">+</button>}</div></div></article>)}</div>{!filtered.length && <Empty onClick={() => setQuery("")} />}</main>
      <Footer><button onClick={() => go("cart")} className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-slate-900 px-4 text-left text-white"><span><span className="block text-sm font-black">{count ? `${count} items in basket` : `Table ${table}`}</span><span className="block text-xs font-semibold text-white/65">{count ? "Ready for checkout" : "Add items from the menu"}</span></span><span className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black">{count ? money(total) : "Basket"}</span></button></Footer>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="mx-auto min-h-screen max-w-md bg-[#f3f5f6] text-slate-900 shadow-2xl shadow-slate-950/10">{children}</div>; }
function Top({ title, back, right, onRight }: { title: string; back?: () => void; right: string; onRight: () => void }) { return <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f8fafb]/95 px-4 py-3 backdrop-blur"><div className="flex items-center justify-between gap-3"><button onClick={back || (() => undefined)} disabled={!back} className="h-11 w-11 rounded-full bg-white text-xs font-black shadow-sm ring-1 ring-slate-200 disabled:opacity-0">Back</button><h1 className="truncate text-base font-black">{title}</h1><button onClick={onRight} className="min-h-11 rounded-full bg-white px-4 text-xs font-black shadow-sm ring-1 ring-slate-200">{right}</button></div></header>; }
function Panel({ children }: { children: React.ReactNode }) { return <div className="mt-5 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200">{children}</div>; }
function Footer({ children }: { children: React.ReactNode }) { return <section className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md bg-[#f8fafb]/95 p-4 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur">{children}</section>; }
function Stepper({ qty, minus, plus }: { qty: number; minus: () => void; plus: () => void }) { return <div className="flex items-center rounded-full bg-slate-100 p-1"><button onClick={minus} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black">-</button><span className="min-w-7 text-center text-xs font-black">{qty}</span><button onClick={plus} className="grid h-7 w-7 place-items-center rounded-full bg-orange-500 font-black text-white">+</button></div>; }
function Line({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 py-1 text-sm font-bold"><span>{label}</span><span className="font-black">{value}</span></div>; }
function Empty({ onClick }: { onClick: () => void }) { return <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-black">Nothing here yet</h2><p className="mt-2 text-sm font-semibold text-slate-500">Try another search or category.</p><button onClick={onClick} className="primary mt-5">Browse menu</button></div>; }
function money(value: number) { return `GBP ${value.toFixed(2)}`; }
