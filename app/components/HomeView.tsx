"use client";

import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { experienceOptions, menuExperiences, money, type MenuExperience, type MenuExperienceId, type MenuItem } from "../lib/menu";
import DietaryBadges from "./DietaryBadges";

type Props = {
  category: string;
  setCategory: (category: string) => void;
  query: string;
  setQuery: (query: string) => void;
  filtered: MenuItem[];
  cart: Record<number, number>;
  count: number;
  total: number;
  popularOnly: boolean;
  showPopular: () => void;
  showAll: () => void;
  add: (id: number) => void;
  remove: (id: number) => void;
  openItem: (item: MenuItem) => void;
  openCart: () => void;
  tableNumber: number;
  changeTable: (tableNumber: number) => void;
};

export default function HomeView(props: Props) {
  const [mode, setMode] = useState<MenuExperienceId>("restaurant");
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoCartOpen, setDemoCartOpen] = useState(false);
  const [demoCart, setDemoCart] = useState<Record<number, number>>({});
  const experience = menuExperiences[mode];
  const theme = experience.theme;
  const isRestaurant = mode === "restaurant";

  const visibleItems = useMemo(() => {
    if (isRestaurant) return props.filtered;
    const q = props.query.trim().toLowerCase();
    return experience.items.filter((item) => {
      const byCategory = props.category === "All" || item.category === props.category;
      const bySearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return byCategory && bySearch;
    });
  }, [experience, isRestaurant, props.category, props.filtered, props.query]);

  const demoLines = experience.items.map((item) => ({ ...item, qty: demoCart[item.id] || 0 })).filter((item) => item.qty > 0);
  const demoCount = demoLines.reduce((sum, item) => sum + item.qty, 0);
  const demoTotal = demoLines.reduce((sum, item) => sum + item.qty * item.price, 0);
  const basketCount = isRestaurant ? props.count : demoCount;
  const basketTotal = isRestaurant ? props.total : demoTotal;
  const feature = visibleItems.find((item) => item.popular) || visibleItems[0] || experience.items[0];

  function switchMode(nextMode: MenuExperienceId) {
    setMode(nextMode);
    props.setCategory("All");
    props.setQuery("");
    props.showAll();
    setMenuOpen(false);
    setDemoCartOpen(false);
  }

  function addOnly(event: MouseEvent, item: MenuItem) {
    event.stopPropagation();
    if (item.available === false) return;
    if (isRestaurant) props.add(item.id);
    else setDemoCart((old) => ({ ...old, [item.id]: (old[item.id] || 0) + 1 }));
  }

  function removeOnly(event: MouseEvent, id: number) {
    event.stopPropagation();
    if (isRestaurant) props.remove(id);
    else setDemoCart((old) => {
      const next = { ...old };
      const qty = (next[id] || 0) - 1;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  function openBasket() {
    if (isRestaurant) props.openCart();
    else setDemoCartOpen(true);
  }

  function goHomeFromMenu() {
    props.setQuery("");
    props.setCategory("All");
    props.showAll();
    setMenuOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  if (mode === "restaurant") {
    return <>
      <RestaurantDeliveryHome
        items={props.filtered}
        allItems={experience.items}
        feature={feature}
        category={props.category}
        setCategory={props.setCategory}
        query={props.query}
        setQuery={props.setQuery}
        showAll={props.showAll}
        tableNumber={props.tableNumber}
        cart={props.cart}
        count={props.count}
        total={props.total}
        openMenu={() => setMenuOpen(true)}
        openCart={props.openCart}
        openItem={props.openItem}
        add={addOnly}
        remove={removeOnly}
      />
      {menuOpen && <MenuSheet count={basketCount} total={basketTotal} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={goHomeFromMenu} openCart={openBasket} experience={experience} mode={mode} switchMode={switchMode} />}
    </>;
  }

  if (mode === "cafe") {
    return <>
      <CafeReferenceHome experience={experience} items={visibleItems} feature={feature} category={props.category} setCategory={props.setCategory} query={props.query} setQuery={props.setQuery} showAll={props.showAll} tableNumber={props.tableNumber} cart={demoCart} count={demoCount} total={demoTotal} openMenu={() => setMenuOpen(true)} openCart={openBasket} add={addOnly} remove={removeOnly} />
      {menuOpen && <MenuSheet count={basketCount} total={basketTotal} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={goHomeFromMenu} openCart={openBasket} experience={experience} mode={mode} switchMode={switchMode} />}
      {demoCartOpen && <DemoCart items={demoLines} total={demoTotal} close={() => setDemoCartOpen(false)} clear={() => setDemoCart({})} theme={theme} />}
    </>;
  }

  return <>
    <SimpleListHome experience={experience} items={visibleItems} category={props.category} setCategory={props.setCategory} query={props.query} setQuery={props.setQuery} tableNumber={props.tableNumber} cart={demoCart} count={demoCount} total={demoTotal} openMenu={() => setMenuOpen(true)} openCart={openBasket} add={addOnly} remove={removeOnly} />
    {menuOpen && <MenuSheet count={basketCount} total={basketTotal} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={goHomeFromMenu} openCart={openBasket} experience={experience} mode={mode} switchMode={switchMode} />}
    {demoCartOpen && <DemoCart items={demoLines} total={demoTotal} close={() => setDemoCart({})} clear={() => setDemoCart({})} theme={theme} />}
  </>;
}

function RestaurantDeliveryHome({ items, allItems, feature, category, setCategory, query, setQuery, showAll, tableNumber, cart, count, total, openMenu, openCart, openItem, add, remove }: { items: MenuItem[]; allItems: MenuItem[]; feature: MenuItem; category: string; setCategory: (category: string) => void; query: string; setQuery: (query: string) => void; showAll: () => void; tableNumber: number; cart: Record<number, number>; count: number; total: number; openMenu: () => void; openCart: () => void; openItem: (item: MenuItem) => void; add: (event: MouseEvent, item: MenuItem) => void; remove: (event: MouseEvent, id: number) => void }) {
  const [view, setView] = useState<"popular" | "all" | "category">("popular");
  const q = query.trim().toLowerCase();
  const baseItems = view === "popular" ? allItems.filter((item) => item.popular) : items.length ? items : allItems;
  const displayItems = q ? baseItems.filter((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) : baseItems;
  const sectionTitle = view === "popular" ? "Popular Food" : category === "All" ? "All Food" : category === "Main" ? "Food" : category;
  const hero = feature || allItems[0];
  const categoryTiles = [
    { value: "popular", label: "Popular Food", icon: "★" },
    { value: "Drinks", label: "Drinks", icon: "☕" },
    { value: "Main", label: "Food", icon: "🍔" },
    { value: "Pudding", label: "Sweets", icon: "🍰" },
    { value: "Starter", label: "Bread", icon: "🥐" }
  ];

  function chooseTile(value: string) {
    if (value === "popular") {
      setView("popular");
      setCategory("All");
      showAll();
      return;
    }
    setView("category");
    setCategory(value);
    showAll();
  }

  function showEverything() {
    setView("all");
    setCategory("All");
    showAll();
  }

  return <main className="min-h-screen bg-[#0f0f10] px-1.5 pb-28 pt-3 text-white">
    <div className="mx-auto max-w-[440px]">
      <header className="flex items-center justify-between px-1 pt-1">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-white/55">Table Location</p>
          <p className="mt-1 truncate text-[11px] font-black text-white"><span className="text-[#f6c51b]">●</span> Table {tableNumber} · Restaurant Demo</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCart} className="relative grid h-9 w-9 place-items-center rounded-full bg-[#232323] text-sm shadow-lg ring-1 ring-white/10">🛒{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f6c51b] px-1 text-[10px] font-black text-black">{count}</span>}</button>
          <button onClick={openMenu} className="grid h-9 w-9 place-items-center rounded-full bg-[#232323] text-sm shadow-lg ring-1 ring-white/10">⚙</button>
        </div>
      </header>

      <label className="mt-4 flex h-11 items-center gap-3 rounded-full bg-[#1c1c1f] px-4 ring-1 ring-white/10">
        <span className="text-white/45">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-white/40" placeholder="Search your favourite food" />
        <button type="button" onClick={openMenu} className="text-white/55">☷</button>
      </label>

      <div className="mt-4 overflow-hidden rounded-[1.8rem] bg-[#f7f7f5] shadow-[0_22px_50px_rgba(0,0,0,0.28)] ring-4 ring-white">
        <button onClick={(event) => add(event, hero)} className="grid h-[150px] w-full grid-cols-[1.08fr_0.92fr] overflow-hidden rounded-b-[2.5rem] bg-[#f5c116] text-left text-black">
          <div className="p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/55">Limited Discount</p>
            <h1 className="mt-1 text-[23px] font-black leading-[0.9] tracking-[-0.06em]">Ramadhan<br />Special Deals</h1>
            <span className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-black text-white">Order Now</span>
          </div>
          <div className="relative">
            <div className="absolute -right-2 bottom-3 h-[118px] w-[138px] rotate-[-7deg] rounded-[1.8rem] bg-white bg-cover bg-center shadow-[0_18px_30px_rgba(0,0,0,0.18)]" style={{ backgroundImage: `url(${hero.image})` }} />
          </div>
        </button>

        <section className="-mt-6 rounded-b-[2rem] bg-[#f7f7f5] px-2 pb-7 pt-10 text-[#121516]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-black">Food Categories</h2>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {categoryTiles.map((tile) => {
              const active = tile.value === "popular" ? view === "popular" : view === "category" && category === tile.value;
              return <button key={tile.value} onClick={() => chooseTile(tile.value)} className="rounded-[1.05rem] px-1 py-2 text-center shadow-sm ring-1 ring-black/5" style={{ background: active ? "#f5c116" : "white" }}><span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#f5f1e7] text-lg">{tile.icon}</span><span className="mt-1 block text-[9px] font-black leading-tight">{tile.label}</span></button>;
            })}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-[15px] font-black">{sectionTitle}</h2>
            <button onClick={showEverything} className="text-[11px] font-black text-[#e3aa09]">See All</button>
          </div>
          <div className="mt-3 grid gap-3">
            {displayItems.slice(0, 8).map((item, index) => <RestaurantFoodCard key={item.id} item={item} qty={cart[item.id] || 0} index={index} open={() => openItem(item)} add={add} remove={remove} />)}
          </div>
        </section>
      </div>
    </div>

    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 items-center rounded-[1.35rem] bg-[#111113]/95 p-2 shadow-[0_20px_48px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-xl">
        <button onClick={() => chooseTile("popular")} className="rounded-2xl bg-[#f5c116] py-2 text-[11px] font-black text-black">Home</button>
        <button onClick={showEverything} className="py-2 text-[11px] font-black text-white/70">Menu</button>
        <button onClick={openCart} className="py-2 text-[11px] font-black text-white/70">Basket</button>
        <button onClick={openMenu} className="py-2 text-[11px] font-black text-white/70">More</button>
      </div>
    </nav>
  </main>;
}

function RestaurantFoodCard({ item, qty, index, open, add, remove }: { item: MenuItem; qty: number; index: number; open: () => void; add: (event: MouseEvent, item: MenuItem) => void; remove: (event: MouseEvent, id: number) => void }) {
  return <article onClick={open} className="flex min-h-[104px] items-center gap-3 rounded-[1.45rem] bg-white p-2.5 shadow-[0_12px_30px_rgba(17,21,23,0.08)] ring-1 ring-black/5" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
    <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[1.35rem] bg-[#f1efe8] bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${item.image})` }} />
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2"><span className="rounded-md bg-[#f5efd9] px-2 py-1 text-[8px] font-black text-[#8a6a11]">{item.category === "Main" ? "Food" : item.category}</span><span className="text-[10px] font-black text-[#e0a400]">★ {item.popular ? "4.6" : "3.8"}</span></div>
      <h3 className="mt-1 line-clamp-2 text-[14px] font-black leading-[1.08] tracking-tight text-[#101316]">{item.name}</h3>
      <p className="mt-1 line-clamp-1 text-[10px] font-bold text-[#7a8486]">{item.description}</p>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="text-[12px] font-black text-[#101316]">{money(item.price)}</span>{qty ? <div className="flex items-center rounded-full bg-[#f2f2ef] p-0.5"><button onClick={(event) => remove(event, item.id)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-[#101316]">-</button><span className="min-w-6 text-center text-[10px] font-black">{qty}</span><button onClick={(event) => add(event, item)} className="grid h-6 w-6 place-items-center rounded-full bg-[#101316] text-xs font-black text-white">+</button></div> : <button onClick={(event) => add(event, item)} className="grid h-7 w-7 place-items-center rounded-full border border-[#101316] text-sm font-black text-[#101316]">+</button>}</div>
    </div>
  </article>;
}

function CafeReferenceHome({ experience, items, feature, category, setCategory, query, setQuery, showAll, tableNumber, cart, count, total, openMenu, openCart, add, remove }: { experience: MenuExperience; items: MenuItem[]; feature: MenuItem; category: string; setCategory: (category: string) => void; query: string; setQuery: (query: string) => void; showAll: () => void; tableNumber: number; cart: Record<number, number>; count: number; total: number; openMenu: () => void; openCart: () => void; add: (event: MouseEvent, item: MenuItem) => void; remove: (event: MouseEvent, id: number) => void }) {
  const categories = experience.categories.filter((entry) => entry !== "All").slice(0, 4);
  const hero = feature || experience.items[0];
  const spotlight = experience.items[2] || hero;
  const visible = items.length ? items : experience.items;
  return <main className="min-h-screen overflow-hidden px-4 pb-28 pt-3 text-[#2d1609]" style={{ background: "radial-gradient(circle at 18% 0%, #ffe8bf 0, transparent 30%), radial-gradient(circle at 90% 12%, #f0bd73 0, transparent 28%), #f5d49a" }}>
    <div className="mx-auto max-w-[430px]"><header className="flex items-center justify-between pt-2"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8d5d24]">Table {tableNumber}</p><h1 className="text-[20px] font-black tracking-tight">Bean & Table</h1></div><div className="flex gap-2"><button onClick={openCart} className="relative grid h-10 w-10 place-items-center rounded-full bg-[#fff6e6] shadow-[0_10px_25px_rgba(108,68,22,0.16)] ring-1 ring-white/70">⌔{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#d48b2a] px-1 text-[10px] font-black text-white">{count}</span>}</button><button onClick={openMenu} className="grid h-10 w-10 place-items-center rounded-full bg-[#fff6e6] shadow-[0_10px_25px_rgba(108,68,22,0.16)] ring-1 ring-white/70">☰</button></div></header>
      <section className="mt-5 grid grid-cols-[1.04fr_0.96fr] items-center gap-3"><div><h2 className="text-[34px] font-black leading-[0.92] tracking-[-0.05em]">Coffee<br />Made Easy</h2><p className="mt-3 max-w-[150px] text-[10px] font-bold leading-4 text-[#8a6132]">Order your favourite drinks in seconds with a soft, premium cafe feel.</p><button onClick={openCart} className="mt-5 rounded-full bg-[#d79032] px-8 py-3 text-xs font-black text-white shadow-[0_13px_28px_rgba(142,86,24,0.28)]">Get Started</button></div><div className="relative h-[210px] overflow-visible rounded-[2rem] bg-[#f0be77] shadow-[0_22px_55px_rgba(118,70,18,0.18)]"><div className="absolute -bottom-5 left-1/2 h-[230px] w-[150px] -translate-x-1/2 rotate-[-7deg] rounded-[2rem] bg-cover bg-center shadow-[0_25px_50px_rgba(84,44,12,0.25)]" style={{ backgroundImage: `url(${spotlight.image})` }} /></div></section>
      <label className="mt-5 flex h-11 items-center gap-3 rounded-full bg-[#fff8ec] px-4 shadow-[0_12px_30px_rgba(105,65,25,0.12)] ring-1 ring-white/70"><span className="text-[#a36b29]">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-xs font-black text-[#2d1609] outline-none placeholder:text-[#aa7b45]" placeholder="Search coffee" /></label>
      <button onClick={(event) => add(event, hero)} className="mt-4 grid w-full grid-cols-[1fr_112px] overflow-hidden rounded-[1.7rem] bg-[#d99a44] p-4 text-left shadow-[0_18px_42px_rgba(110,65,17,0.2)]"><div><p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6d3c12]">50% OFF</p><h3 className="mt-1 text-xl font-black leading-none text-white">Coffee Discount</h3><p className="mt-1 text-[10px] font-bold text-white/75">Today only · warm cafe demo</p><span className="mt-4 inline-flex rounded-full bg-[#fff4df] px-4 py-2 text-[11px] font-black text-[#7a4312]">Order Now</span></div><div className="relative"><div className="absolute -right-4 -top-5 h-[135px] w-[120px] rounded-[1.5rem] bg-cover bg-center shadow-[0_15px_30px_rgba(78,42,12,0.23)]" style={{ backgroundImage: `url(${hero.image})` }} /></div></button>
      <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto"><button onClick={() => { setCategory("All"); showAll(); }} className="shrink-0 rounded-full px-4 py-2 text-[11px] font-black shadow-sm" style={{ background: category === "All" ? "#2d1609" : "#fff2d9", color: category === "All" ? "white" : "#7a4b1b" }}>All Coffee</button>{categories.map((entry) => <button key={entry} onClick={() => { setCategory(entry); showAll(); }} className="shrink-0 rounded-full px-4 py-2 text-[11px] font-black shadow-sm" style={{ background: category === entry ? "#2d1609" : "#fff2d9", color: category === entry ? "white" : "#7a4b1b" }}>{entry}</button>)}</nav>
      <section className="mt-5"><div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9b682d]">Coffee menu</p><h3 className="text-2xl font-black tracking-[-0.04em]">Popular now</h3></div><button onClick={openCart} className="rounded-full bg-[#fff3dc] px-3 py-2 text-[11px] font-black text-[#70420f] shadow-sm">{count ? money(total) : "Basket"}</button></div><div className="grid grid-cols-2 gap-3">{visible.slice(0, 8).map((item) => <CafeCard key={item.id} item={item} qty={cart[item.id] || 0} add={add} remove={remove} />)}</div></section></div>
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"><div className="grid grid-cols-4 items-center rounded-[1.6rem] bg-[#fff8ec]/95 p-2 shadow-[0_18px_45px_rgba(90,54,18,0.24)] ring-1 ring-white/80 backdrop-blur-xl"><button className="rounded-2xl bg-[#2d1609] py-2 text-[11px] font-black text-white">Home</button><button onClick={() => setCategory("All")} className="py-2 text-[11px] font-black text-[#8d5d24]">Menu</button><button onClick={openCart} className="py-2 text-[11px] font-black text-[#8d5d24]">Basket</button><button onClick={openMenu} className="py-2 text-[11px] font-black text-[#8d5d24]">More</button></div></nav>
  </main>;
}

function CafeCard({ item, qty, add, remove }: { item: MenuItem; qty: number; add: (event: MouseEvent, item: MenuItem) => void; remove: (event: MouseEvent, id: number) => void }) { return <article className="relative overflow-hidden rounded-[1.45rem] bg-[#fff4dd] p-2.5 shadow-[0_12px_28px_rgba(107,63,17,0.12)] ring-1 ring-white/80"><div className="h-28 rounded-[1.15rem] bg-[#edc079] bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${item.image})` }} /><div className="mt-2"><p className="line-clamp-1 text-[12px] font-black leading-tight text-[#2d1609]">{item.name}</p><p className="mt-0.5 line-clamp-1 text-[9px] font-bold text-[#9b6a34]">{item.description}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[12px] font-black text-[#2d1609]">{money(item.price)}</span>{qty ? <div className="flex items-center rounded-full bg-[#f4d8aa] p-0.5"><button onClick={(event) => remove(event, item.id)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-[#2d1609]">-</button><span className="min-w-6 text-center text-[10px] font-black">{qty}</span><button onClick={(event) => add(event, item)} className="grid h-6 w-6 place-items-center rounded-full bg-[#2d1609] text-xs font-black text-white">+</button></div> : <button onClick={(event) => add(event, item)} className="grid h-7 w-7 place-items-center rounded-full bg-[#d28b2f] text-sm font-black text-white shadow-md">+</button>}</div></div></article>; }

function SimpleListHome({ experience, items, category, setCategory, query, setQuery, tableNumber, cart, count, total, openMenu, openCart, add, remove }: { experience: MenuExperience; items: MenuItem[]; category: string; setCategory: (category: string) => void; query: string; setQuery: (query: string) => void; tableNumber: number; cart: Record<number, number>; count: number; total: number; openMenu: () => void; openCart: () => void; add: (event: MouseEvent, item: MenuItem) => void; remove: (event: MouseEvent, id: number) => void }) {
  const theme = experience.theme;
  return <><main className="min-h-screen px-4 pb-32 pt-4" style={{ background: theme.background, color: theme.ink }}><header className="sticky top-0 z-30 -mx-4 px-4 pb-3 pt-2 backdrop-blur-xl" style={{ background: theme.background }}><div className="mx-auto max-w-[480px]"><div className="mb-3 flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Table {tableNumber} · {experience.eyebrow}</p><h1 className="text-xl font-black tracking-tight">{experience.name}</h1></div><button onClick={openMenu} className="grid h-11 w-11 place-items-center rounded-full shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>☰</button></div><label className="flex h-14 items-center gap-3 rounded-full px-5 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" style={{ color: theme.ink }} placeholder={experience.searchPlaceholder} /></label></div></header><nav className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">{experience.categories.map((entry) => <button key={entry} onClick={() => setCategory(entry)} className="shrink-0 rounded-full px-4 py-2 text-xs font-black" style={{ background: category === entry ? theme.deep : theme.panel, color: category === entry ? "white" : theme.ink }}>{entry}</button>)}</nav><section className="mt-5 overflow-hidden rounded-[1.35rem] shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>{items.map((item, index) => <div key={item.id}><FoodRow item={item} qty={cart[item.id] || 0} theme={theme} index={index} open={() => undefined} plus={(event) => add(event, item)} minus={(event) => remove(event, item.id)} />{index < items.length - 1 && <div className="ml-[92px] h-px" style={{ background: `${theme.ink}16` }} />}</div>)}</section></main><Bottom count={count} total={total} tableNumber={tableNumber} open={openCart} theme={theme} /></>;
}

function FoodRow({ item, qty, theme, index, open, plus, minus }: { item: MenuItem; qty: number; theme: MenuExperience["theme"]; index: number; open: () => void; plus: (event: MouseEvent) => void; minus: (event: MouseEvent) => void }) { const unavailable = item.available === false; return <article onClick={open} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }} className={unavailable ? "food-card-motion cursor-pointer px-3 py-2.5 opacity-70" : "food-card-motion cursor-pointer px-3 py-2.5"}><div className="flex items-start gap-3"><div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[1rem] bg-cover bg-center ring-1 ring-black/5" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: theme.muted }}>{item.category}</p><h3 className="mt-0.5 line-clamp-1 text-base font-black leading-tight tracking-tight">{item.name}</h3></div><span className="shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase" style={{ background: unavailable ? "#fff1f2" : theme.soft, color: unavailable ? "#be123c" : theme.muted }}>{unavailable ? "Unavailable" : "Available"}</span></div><div className="mt-1 flex items-start gap-1.5"><DietaryBadges item={item} /><p className="line-clamp-1 text-xs font-semibold leading-4" style={{ color: theme.muted }}>{item.description}</p></div><div className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: theme.muted }}><span>{item.prep}</span><span>·</span><span>{item.allergens[0]}</span></div><div className="mt-1.5 flex items-center justify-between gap-2"><span className="text-sm font-black">{money(item.price)}</span>{qty ? <Stepper qty={qty} minus={minus} plus={plus} disabled={unavailable} theme={theme} /> : <button onClick={plus} disabled={unavailable} className="add-burst rounded-full px-3 py-1.5 text-[11px] font-black shadow-sm disabled:bg-slate-200 disabled:text-slate-400" style={unavailable ? undefined : { background: theme.deep, color: "white" }}>Add +</button>}</div></div></div></article>; }

export function Stepper({ qty, minus, plus, disabled = false, theme }: { qty: number; minus: (event: MouseEvent) => void; plus: (event: MouseEvent) => void; disabled?: boolean; theme: MenuExperience["theme"] }) { return <div className="flex items-center rounded-full p-0.5 ring-1 ring-black/5" style={{ background: theme.soft }}><button onClick={minus} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black shadow-sm">-</button><span key={qty} className="qty-pop min-w-7 text-center text-xs font-black">{qty}</span><button onClick={plus} disabled={disabled} className="add-burst grid h-7 w-7 place-items-center rounded-full font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400" style={disabled ? undefined : { background: theme.deep }}>+</button></div>; }

function Bottom({ count, total, tableNumber, open, theme }: { count: number; total: number; tableNumber: number; open: () => void; theme: MenuExperience["theme"] }) { return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3"><button onClick={open} className="basket-dock flex min-h-16 w-full items-center justify-between rounded-full px-5 text-left text-white shadow-[0_20px_50px_rgba(29,37,40,0.32)] backdrop-blur-xl" style={{ background: theme.deep }}><span><span className="block text-sm font-black">{count ? `${count} item${count === 1 ? "" : "s"}` : `Table ${tableNumber}`}</span><span className="block text-xs font-semibold text-white/65">{count ? `Table ${tableNumber} - Ready for checkout` : "Add items to start"}</span></span><span className="basket-price-pill rounded-full px-5 py-3 text-sm font-black shadow-lg" style={{ background: theme.accent }}>{count ? money(total) : "Basket"}</span></button></section>; }

function MenuSheet({ count, total, tableNumber, changeTable, close, goHome, openCart, experience, mode, switchMode }: { count: number; total: number; tableNumber: number; changeTable: (tableNumber: number) => void; close: () => void; goHome: () => void; openCart: () => void; experience: MenuExperience; mode: MenuExperienceId; switchMode: (mode: MenuExperienceId) => void }) { const [tableOpen, setTableOpen] = useState(false); const [draftTable, setDraftTable] = useState(String(tableNumber)); const parsedDraft = Number(draftTable); const validDraft = Number.isInteger(parsedDraft) && parsedDraft >= 1 && parsedDraft <= 999; const theme = experience.theme; function saveTable(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validDraft) return; changeTable(parsedDraft); setTableOpen(false); } return <div className="sheet-backdrop-enter fixed inset-0 z-[95] flex items-start justify-center bg-[#111517]/35 p-4 pt-20 backdrop-blur-sm"><div className="sheet-panel-enter w-full max-w-[480px] rounded-[2rem] p-4 shadow-[0_26px_70px_rgba(29,37,40,0.28)] ring-1 ring-white/80" style={{ background: theme.background, color: theme.ink }}><div className="flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Menu</p><h2 className="text-2xl font-black tracking-tight">{experience.name}</h2></div><button onClick={close} className="rounded-full px-4 py-3 text-xs font-black shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}>Close</button></div><section className="mt-5 rounded-[1.5rem] p-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><p className="px-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: theme.muted }}>Switch demo</p><div className="mt-3 grid gap-2">{experienceOptions.map((option) => { const active = option.id === mode; return <button key={option.id} onClick={() => switchMode(option.id)} className="flex min-h-16 items-center justify-between rounded-[1.25rem] px-4 text-left ring-1 ring-black/5" style={{ background: active ? theme.deep : theme.soft, color: active ? "white" : theme.ink }}><span><span className="block text-sm font-black">{option.label}{active ? " · Selected" : ""}</span><span className="block text-xs font-bold opacity-70">{option.id === "restaurant" ? "Black and yellow restaurant demo" : option.id === "cafe" ? "Reference-style cafe remake" : "Dark drinks demo"}</span></span><span className="text-xl">›</span></button>; })}</div></section><div className="mt-3 grid gap-3"><button onClick={goHome} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><span><span className="block text-sm font-black">Home</span><span className="block text-xs font-bold opacity-70">Back to the main menu</span></span><span className="text-xl">›</span></button><div className="rounded-[1.5rem] px-4 py-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><button onClick={() => setTableOpen((open) => !open)} className="flex w-full items-center justify-between text-left"><span><span className="block text-sm font-black">Change Table</span><span className="block text-xs font-bold opacity-70">Current table {tableNumber}</span></span><span className="text-xl">›</span></button>{tableOpen && <form onSubmit={saveTable} className="mt-3 flex items-center gap-2"><input value={draftTable} onChange={(event) => setDraftTable(event.target.value)} inputMode="numeric" pattern="[0-9]*" aria-label="Table number" className="min-h-10 w-full rounded-2xl px-3 text-sm font-black outline-none ring-1 ring-black/5" style={{ background: theme.soft, color: theme.ink }} /><button type="submit" disabled={!validDraft} className="min-h-10 rounded-2xl px-4 text-xs font-black disabled:bg-slate-200 disabled:text-slate-400" style={validDraft ? { background: theme.deep, color: "white" } : undefined}>Save</button></form>}</div><button onClick={openCart} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left text-white shadow-[0_18px_42px_rgba(29,37,40,0.22)]" style={{ background: theme.deep }}><span><span className="block text-sm font-black">Basket</span><span className="block text-xs font-bold text-white/65">{count ? `${count} items - ${money(total)}` : "No items yet"}</span></span><span className="text-xl">›</span></button></div></div></div>; }

function DemoCart({ items, total, close, clear, theme }: { items: (MenuItem & { qty: number })[]; total: number; close: () => void; clear: () => void; theme: MenuExperience["theme"] }) { return <div className="sheet-backdrop-enter fixed inset-0 z-[90] flex items-end justify-center bg-[#111517]/45 p-3 backdrop-blur-sm"><div className="sheet-panel-enter w-full max-w-[430px] rounded-[2rem] p-4 shadow-[0_26px_70px_rgba(29,37,40,0.32)] ring-1 ring-white/80" style={{ background: theme.background, color: theme.ink }}><div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ background: theme.muted }} /><div className="flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Demo basket</p><h2 className="text-2xl font-black tracking-tight">Basket</h2></div><button onClick={close} className="rounded-full px-4 py-3 text-xs font-black shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}>Close</button></div><div className="mt-4 grid gap-2">{items.length ? items.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl p-3 text-sm font-black ring-1 ring-black/5" style={{ background: theme.panel }}><span>{item.qty}x {item.name}</span><span>{money(item.qty * item.price)}</span></div>) : <p className="rounded-2xl p-5 text-center text-sm font-bold" style={{ background: theme.panel, color: theme.muted }}>Basket is empty</p>}</div><div className="mt-4 flex items-center justify-between rounded-2xl p-4 font-black ring-1 ring-black/5" style={{ background: theme.panel }}><span>Total</span><span>{money(total)}</span></div><button onClick={() => { clear(); close(); }} disabled={!items.length} className="mt-4 min-h-14 w-full rounded-full text-sm font-black text-white disabled:bg-slate-300 disabled:text-slate-500" style={items.length ? { background: theme.accent } : undefined}>Clear demo basket</button></div></div>; }
