"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { experienceOptions, menuExperiences, money, type MenuExperience, type MenuExperienceId, type MenuItem } from "../lib/menu";
import DietaryBadges from "./DietaryBadges";

type Props = {
  experienceMode: MenuExperienceId;
  setExperienceMode: (mode: MenuExperienceId) => void;
  category: string;
  setCategory: (category: string) => void;
  query: string;
  setQuery: (query: string) => void;
  filtered: MenuItem[];
  allItems: MenuItem[];
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

const cafeUi = {
  background: "#f6ead8",
  panel: "#fffaf3",
  soft: "#f1dfc4",
  ink: "#2f2a24",
  muted: "#8a7460",
  accent: "#c9843b",
  deep: "#6d4a2e",
};

const restaurantTabs: { label: string; value: string; heading: string; image: string }[] = [
  { label: "All", value: "All", heading: "All", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80" },
  { label: "Main", value: "Main", heading: "Main", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" },
  { label: "Sides", value: "Starter", heading: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80" },
  { label: "Desserts", value: "Pudding", heading: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80" },
  { label: "Drinks", value: "Drinks", heading: "Drinks", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=300&q=80" },
];

function selectedRestaurantHeading(category: string) {
  return restaurantTabs.find((tab) => tab.value === category)?.heading || "All";
}

function categoryImage(category: string, items: MenuItem[], fallback?: MenuItem) {
  const source = items.length ? items : fallback ? [fallback] : [];
  const item = category === "All"
    ? source.find((entry) => entry.popular) || source[0]
    : source.find((entry) => entry.category === category) || source.find((entry) => entry.popular) || source[0];

  return item?.image || fallback?.image || "";
}

function rotateFromIndex(items: MenuItem[], start: number, count: number) {
  if (!items.length) return [];
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length]);
}

export default function HomeView(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const menuRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const experience = menuExperiences[props.experienceMode];
  const isRestaurant = props.experienceMode === "restaurant";
  const isCafe = props.experienceMode === "cafe";
  const theme = experience.theme;
  const activeTheme = isCafe ? cafeUi : theme;
  const visible = props.filtered.length ? props.filtered : props.allItems;
  const featuredItems = visible.some((item) => item.popular) ? visible.filter((item) => item.popular) : visible;
  const hero = featuredItems[featuredIndex % Math.max(featuredItems.length, 1)] || visible[0] || props.allItems[0] || experience.items[0];

  useEffect(() => {
    setFeaturedIndex(0);
  }, [props.experienceMode, props.category, props.query, props.popularOnly, visible.length]);

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setFeaturedIndex((index) => (index + 1) % featuredItems.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [featuredItems.length]);

  function chooseCategory(category: string) {
    props.setCategory(category);
    props.showAll();
    window.requestAnimationFrame(() => menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function addItem(event: MouseEvent, item: MenuItem) {
    event.stopPropagation();
    if (item.available === false) return;
    props.add(item.id);
  }

  function switchMode(mode: MenuExperienceId) {
    props.setExperienceMode(mode);
    setMenuOpen(false);
  }

  if (isRestaurant) {
    const trusted = rotateFromIndex(featuredItems.length ? featuredItems : visible, featuredIndex, 2);
    const recommended = visible.slice(0, 6);
    const orderAgain = visible.slice(0, 4);
    const activeHeading = selectedRestaurantHeading(props.category);

    return <main className="min-h-screen bg-[#ebe6dd] pb-28 text-[#241c18]">
      <div className="mx-auto w-full max-w-[480px] px-2 pt-3">
        <header className="rounded-[1.75rem] bg-[#2f2420] px-4 py-4 text-white shadow-lg shadow-[#2f2420]/20 ring-1 ring-[#d8ccc0]/30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="min-w-0 flex-1 truncate text-left">
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#c3915b]">Restaurant Demo</span>
              <span className="mt-1 block truncate text-[13px] font-black text-white/90">Table {props.tableNumber}, dining room</span>
            </button>
            <button onClick={() => setMenuOpen(true)} aria-label="Open design menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f8f4ee] text-xl font-black text-[#2f2420] shadow-sm">☰</button>
          </div>
          <label className="mt-4 flex min-h-14 items-center gap-3 rounded-[1.35rem] bg-[#f8f4ee] px-4 shadow-sm ring-1 ring-[#d8ccc0]">
            <span className="text-xs font-black text-[#766357]">Search</span>
            <input ref={searchRef} value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#241c18] outline-none placeholder:text-[#9a8575]" placeholder="Search restaurant dishes" />
            <button type="button" onClick={() => setMenuOpen(true)} className="border-l border-[#2f2420]/10 pl-3 text-xs font-black text-[#8f4f35]">Menu</button>
          </label>
        </header>

        <section className="mt-4">
          <div className="mb-2 px-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#766357]">Browse</p><h2 className="font-serif text-xl font-black tracking-tight text-[#241c18]">Restaurant categories</h2></div>
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-3 pt-2">
            {restaurantTabs.map((tab) => {
              const selected = props.category === tab.value;
              return <button key={tab.label} onClick={() => chooseCategory(tab.value)} className="w-[84px] shrink-0 text-center" aria-pressed={selected}>
                <RestaurantCategoryPhoto image={tab.image} label={tab.label} selected={selected} />
                <span className={selected ? "mt-2 block truncate text-[12px] font-black text-[#8f4f35]" : "mt-2 block truncate text-[12px] font-black text-[#5f5048]"}>{tab.label}</span>
              </button>;
            })}
          </div>
        </section>

        <section className="-mx-1 mt-4 rounded-[1.8rem] bg-[#2f2420] p-3 text-white shadow-lg shadow-[#2f2420]/15">
          <div className="mb-3 px-1"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c3915b]">Restaurant Demo</p><h2 className="font-serif text-2xl font-black tracking-tight">Chef's trusted picks</h2></div>
          <div className="grid grid-cols-2 gap-3">
            {trusted.map((item) => <TrustedCard key={`${item.id}-${featuredIndex}`} item={item} qty={props.cart[item.id] || 0} add={props.add} remove={props.remove} open={() => props.openItem(item)} />)}
          </div>
        </section>

        <section ref={menuRef} className="mt-5 scroll-mt-5">
          <div className="mb-3 px-1"><h2 className="font-serif text-2xl font-black tracking-tight text-[#241c18]">{activeHeading}</h2></div>
          <div className="grid gap-3">
            {recommended.map((item) => <RecommendedCard key={item.id} item={item} qty={props.cart[item.id] || 0} add={props.add} remove={props.remove} open={() => props.openItem(item)} />)}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 px-1"><h2 className="font-serif text-2xl font-black tracking-tight text-[#241c18]">Order again</h2></div>
          <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
            {orderAgain.map((item) => <OrderAgainCard key={item.id} item={item} qty={props.cart[item.id] || 0} add={props.add} remove={props.remove} open={() => props.openItem(item)} />)}
          </div>
        </section>
      </div>

      <RestaurantBottomBar focusSearch={() => searchRef.current?.focus()} count={props.count} openCart={props.openCart} openMenu={() => setMenuOpen(true)} />
      {menuOpen && <MenuSheet count={props.count} total={props.total} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={() => { chooseCategory("All"); setMenuOpen(false); }} openCart={props.openCart} experience={experience} mode={props.experienceMode} switchMode={switchMode} />}
    </main>;
  }

  return <main className="min-h-screen px-3 pb-32 pt-4" style={{ background: isCafe ? cafeUi.background : "#171312", color: activeTheme.ink }}>
    <div className="mx-auto max-w-[440px]">
      <header className={isCafe ? "flex items-center justify-between rounded-[1.6rem] px-1 py-1" : "flex items-center justify-between"}>
        <div className="flex min-w-0 items-center gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Table {props.tableNumber}</p>
            <h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em]">{experience.label}</h1>
          </div>
        </div>
        <button onClick={() => setMenuOpen(true)} aria-label="Open design menu" className="grid h-11 w-11 place-items-center rounded-full text-xl font-black shadow-sm ring-1 ring-black/5" style={{ background: activeTheme.panel, color: activeTheme.ink }}>☰</button>
      </header>

      <label className={isCafe ? "mt-4 flex h-12 items-center gap-3 rounded-full px-4 shadow-sm ring-1 ring-[#eadcc4]" : "mt-4 flex h-12 items-center gap-3 rounded-full px-4 ring-1 ring-black/10"} style={{ background: activeTheme.panel }}>
        <span className="text-sm opacity-60">⌕</span>
        <input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none placeholder:opacity-50" placeholder="Search menu or allergens" />
        {isCafe && <button type="button" onClick={() => setMenuOpen(true)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[#6d4a2e] shadow-sm">↔</button>}
      </label>

      {isCafe ? <button onClick={(event) => addItem(event, hero)} className="mt-4 block h-[158px] w-full overflow-hidden rounded-[1.9rem] bg-cover bg-center p-4 text-left shadow-[0_18px_36px_rgba(109,74,46,0.16)] ring-1 ring-white/80" style={{ backgroundImage: `linear-gradient(90deg, rgba(93,66,43,0.72) 0%, rgba(201,132,59,0.38) 48%, rgba(255,250,243,0.08) 100%), url(${hero.image})`, color: "white" }}>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/80">Today only</p>
        <h2 className="mt-1 max-w-[170px] text-[28px] font-black leading-[0.92] tracking-[-0.06em]">Featured pick</h2>
        <p className="mt-1 max-w-[190px] truncate text-xs font-black text-white/80">{hero.name}</p>
        <span className="mt-4 inline-flex rounded-full bg-[#fffaf3] px-4 py-2 text-[10px] font-black text-[#6d4a2e] shadow-sm">Add to basket</span>
      </button> : <button onClick={(event) => addItem(event, hero)} className="mt-4 grid h-[150px] w-full grid-cols-[1fr_118px] overflow-hidden rounded-[1.8rem] p-4 text-left shadow-[0_18px_34px_rgba(0,0,0,0.14)]" style={{ background: activeTheme.accent, color: "#111" }}><div><p className="text-[9px] font-black uppercase tracking-[0.14em] opacity-60">Featured</p><h2 className="mt-1 line-clamp-2 text-[23px] font-black leading-[0.95] tracking-[-0.05em]">{hero.name}</h2><span className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-black text-white">Add to basket</span></div><div className="h-[118px] rounded-[1.5rem] bg-white bg-cover bg-center shadow-sm ring-1 ring-black/10" style={{ backgroundImage: `url(${hero.image})` }} /></button>}

      <section className={isCafe ? "mt-4 rounded-[1.8rem] bg-transparent p-0" : "mt-4 rounded-[1.8rem] p-3 ring-1 ring-black/5"} style={isCafe ? { color: activeTheme.ink } : { background: activeTheme.panel, color: activeTheme.ink }}>
        <div className="mb-3 flex items-end justify-between">
          <div>{!isCafe && <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">Sections</p>}<h2 className="text-xl font-black">{isCafe ? "Menu" : "Browse menu"}</h2></div>
          <button onClick={() => chooseCategory("All")} className="rounded-full px-4 py-2 text-[11px] font-black shadow-sm" style={{ background: props.category === "All" ? activeTheme.accent : activeTheme.panel, color: props.category === "All" ? "#111" : activeTheme.ink }}>All</button>
        </div>
        <nav className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {experience.categories.filter((entry) => entry !== "All").map((entry) => {
            const selected = props.category === entry;
            const image = categoryImage(entry, props.allItems, hero);
            return <button key={entry} onClick={() => chooseCategory(entry)} className="shrink-0 text-center" aria-pressed={selected}>
              <CategoryPhotoIcon image={image} label={entry} selected={selected} accent={activeTheme.accent} />
              <span className="mt-2 block w-[76px] truncate text-[10px] font-black opacity-70">{entry}</span>
            </button>;
          })}
        </nav>
      </section>

      <section ref={menuRef} className="mt-5 scroll-mt-5 rounded-[1.8rem] p-3 ring-1 ring-black/5" style={{ background: activeTheme.panel, color: activeTheme.ink }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">Main menu</p><h2 className="text-xl font-black">{props.category === "All" ? "Menu" : props.category}</h2></div>
          {props.count > 0 && <span className="shrink-0 rounded-full px-3 py-2 text-[11px] font-black" style={{ background: activeTheme.soft }}>{props.count} items</span>}
        </div>
        <div className={isCafe ? "grid grid-cols-2 gap-3" : "grid gap-3"}>{visible.slice(0, 10).map((item) => isCafe ? <CafeCard key={item.id} item={item} qty={props.cart[item.id] || 0} add={props.add} remove={props.remove} open={() => props.openItem(item)} /> : <SimpleRow key={item.id} item={item} qty={props.cart[item.id] || 0} theme={activeTheme} add={props.add} remove={props.remove} open={() => props.openItem(item)} />)}</div>
      </section>
    </div>
    {isCafe ? <CafeBottomBar count={props.count} total={props.total} openCart={props.openCart} openMenu={() => setMenuOpen(true)} /> : <BottomBar count={props.count} total={props.total} openCart={props.openCart} openMenu={() => setMenuOpen(true)} accent={activeTheme.accent} />}
    {menuOpen && <MenuSheet count={props.count} total={props.total} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={() => { chooseCategory("All"); setMenuOpen(false); }} openCart={props.openCart} experience={experience} mode={props.experienceMode} switchMode={switchMode} />}
  </main>;
}

function RestaurantCategoryPhoto({ image, label, selected }: { image: string; label: string; selected: boolean }) {
  return <span className={selected ? "mx-auto block h-[76px] w-[76px] overflow-hidden rounded-[1.35rem] bg-cover bg-center shadow-lg ring-4 ring-[#a35a3d]" : "mx-auto block h-[76px] w-[76px] overflow-hidden rounded-[1.35rem] bg-cover bg-center shadow-sm ring-1 ring-[#d8ccc0]"} style={{ backgroundImage: `linear-gradient(180deg, rgba(36,28,24,0.02), rgba(36,28,24,0.22)), url(${image})` }} aria-label={label} />;
}

function CategoryPhotoIcon({ image, label, selected, accent }: { image: string; label: string; selected: boolean; accent: string }) {
  return <span className="mx-auto block h-[76px] w-[76px] overflow-hidden rounded-full bg-cover bg-center ring-2 ring-white" style={{ backgroundImage: `url(${image})`, boxShadow: selected ? `0 0 0 4px ${accent}` : "none" }} aria-label={label} />;
}

function TrustedCard({ item, qty, add, remove, open }: { item: MenuItem; qty: number; add: (id: number) => void; remove: (id: number) => void; open: () => void }) {
  return <article className="rounded-[1.35rem] bg-[#fbfaf7] p-2.5 text-[#241c18] shadow-sm ring-1 ring-[#d8ccc0]"><button onClick={open} className="block h-[140px] w-full rounded-[1.05rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.name}`} /><div className="mt-3"><h3 className="line-clamp-1 font-serif text-base font-black tracking-tight">{item.name}</h3><p className="mt-1 line-clamp-1 text-xs font-bold text-[#766357]">Chef favourite</p><DietaryBadges item={item} className="mt-1" /><div className="mt-3 flex items-center justify-between"><span className="text-base font-black">{money(item.price)}</span><RestaurantQty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></div></article>;
}

function RecommendedCard({ item, qty, add, remove, open }: { item: MenuItem; qty: number; add: (id: number) => void; remove: (id: number) => void; open: () => void }) {
  return <article className="flex gap-3 rounded-[1.35rem] bg-[#fbfaf7] p-2.5 shadow-sm ring-1 ring-[#d8ccc0]"><button onClick={open} className="h-[112px] w-[112px] shrink-0 rounded-[1rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.name}`} /><div className="min-w-0 flex-1 py-1"><h3 className="line-clamp-1 font-serif text-base font-black tracking-tight text-[#241c18]">{item.name}</h3><p className="mt-1 line-clamp-1 text-xs font-bold text-[#766357]">Recommended by kitchen</p><p className="mt-1 line-clamp-1 text-[11px] font-semibold text-[#8a7668]">Restaurant table ordering</p><DietaryBadges item={item} className="mt-1" /><div className="mt-2 flex items-center justify-between"><span className="text-base font-black text-[#241c18]">{money(item.price)}</span><RestaurantQty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></div></article>;
}

function OrderAgainCard({ item, qty, add, remove, open }: { item: MenuItem; qty: number; add: (id: number) => void; remove: (id: number) => void; open: () => void }) {
  return <article className="w-[172px] shrink-0 overflow-hidden rounded-[1.2rem] bg-[#fbfaf7] shadow-sm ring-1 ring-[#d8ccc0]"><button onClick={open} className="block h-[105px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.name}`} /><div className="p-2.5"><h3 className="line-clamp-1 font-serif text-sm font-black tracking-tight text-[#241c18]">{item.name}</h3><div className="mt-2 flex items-center justify-between"><span className="text-sm font-black">{money(item.price)}</span><RestaurantQty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></div></article>;
}

function CafeCard({ item, qty, add, remove, open }: { item: MenuItem; qty: number; add: (id: number) => void; remove: (id: number) => void; open: () => void }) {
  return <article className="relative overflow-hidden rounded-[1.55rem] bg-[#fffaf3] p-2.5 shadow-[0_10px_28px_rgba(201,132,59,0.14)] ring-1 ring-[#eadcc4]"><button onClick={open} className="block h-28 w-full rounded-[1.2rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.name}`} /><p className="mt-2 line-clamp-1 text-[12px] font-black text-[#2f2a24]">{item.name}</p><DietaryBadges item={item} className="mt-1" /><div className="mt-2 flex items-center justify-between"><span className="text-xs font-black text-[#6d4a2e]">{money(item.price)}</span><CafeQty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></article>;
}

function SimpleRow({ item, qty, theme, add, remove, open }: { item: MenuItem; qty: number; theme: MenuExperience["theme"]; add: (id: number) => void; remove: (id: number) => void; open: () => void }) {
  return <article className="flex items-start gap-3 rounded-[1.25rem] p-3 ring-1 ring-black/5" style={{ background: theme.soft }}><button onClick={open} className="h-[72px] w-[72px] shrink-0 rounded-[1rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.name}`} /><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: theme.muted }}>{item.category}</p><h3 className="line-clamp-1 text-base font-black">{item.name}</h3><div className="mt-1 flex items-start gap-1.5"><DietaryBadges item={item} /><p className="line-clamp-1 text-xs font-semibold" style={{ color: theme.muted }}>{item.description}</p></div><div className="mt-2 flex items-center justify-between"><span className="text-sm font-black">{money(item.price)}</span><Qty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></div></article>;
}

function RestaurantQty({ qty, add, remove, disabled = false }: { qty: number; add: () => void; remove: () => void; disabled?: boolean }) {
  if (!qty) return <button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="rounded-full bg-[#8f4f35] px-3 py-2 text-[11px] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">Add</button>;
  return <div className="flex items-center rounded-full bg-[#eaded2] p-0.5"><button onClick={(event) => { event.stopPropagation(); remove(); }} className="grid h-8 w-8 place-items-center rounded-full bg-white font-black text-[#8f4f35] shadow-sm">-</button><span className="min-w-8 text-center text-xs font-black text-[#5b352d]">{qty}</span><button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-full bg-[#8f4f35] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">+</button></div>;
}

function CafeQty({ qty, add, remove, disabled = false }: { qty: number; add: () => void; remove: () => void; disabled?: boolean }) {
  if (!qty) return <button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="rounded-full bg-[#c9843b] px-3 py-2 text-[11px] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">Add</button>;
  return <div className="flex items-center rounded-full bg-[#f1dfc4] p-0.5"><button onClick={(event) => { event.stopPropagation(); remove(); }} className="grid h-8 w-8 place-items-center rounded-full bg-white font-black text-[#6d4a2e] shadow-sm">-</button><span className="min-w-8 text-center text-xs font-black text-[#6d4a2e]">{qty}</span><button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-full bg-[#c9843b] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">+</button></div>;
}

function Qty({ qty, add, remove, disabled = false }: { qty: number; add: () => void; remove: () => void; disabled?: boolean }) {
  if (!qty) return <button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="rounded-full bg-[#0f5132] px-3 py-2 text-[11px] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">Add</button>;
  return <div className="flex items-center rounded-full bg-[#d7eadc] p-0.5"><button onClick={(event) => { event.stopPropagation(); remove(); }} className="grid h-8 w-8 place-items-center rounded-full bg-white font-black text-[#0f5132] shadow-sm">-</button><span className="min-w-8 text-center text-xs font-black text-[#0f5132]">{qty}</span><button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-full bg-[#0f5132] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">+</button></div>;
}

function RestaurantBottomBar({ count, focusSearch, openCart, openMenu }: { count: number; focusSearch: () => void; openCart: () => void; openMenu: () => void }) {
  return <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"><div className="grid h-16 grid-cols-4 items-center rounded-[1.6rem] bg-[#fbfaf7] text-[#766357] shadow-[0_18px_45px_rgba(47,36,32,0.16)] ring-1 ring-[#d8ccc0]"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="h-full text-xs font-black text-[#8f4f35]">Home</button><button onClick={focusSearch} className="h-full text-xs font-black">Search</button><button onClick={openCart} className="mx-auto grid h-12 min-w-12 place-items-center rounded-full bg-[#2f2420] px-3 text-xs font-black text-white shadow-lg">{count || "Cart"}</button><button onClick={openMenu} className="h-full text-xs font-black">Switch</button></div></nav>;
}

function CafeBottomBar({ count, total, openCart, openMenu }: { count: number; total: number; openCart: () => void; openMenu: () => void }) {
  return <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"><div className="grid h-16 grid-cols-3 items-center rounded-[1.7rem] bg-[#fffaf3]/95 text-[#6d4a2e] shadow-[0_16px_36px_rgba(201,132,59,0.16)] ring-1 ring-[#eadcc4] backdrop-blur-xl"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="h-full text-xs font-black">Home</button><button onClick={openCart} className="h-full text-xs font-black">{count ? `${count} ${money(total)}` : "Cart"}</button><button onClick={openMenu} className="h-full text-xs font-black">Menu</button></div></nav>;
}

function BottomBar({ count, total, openCart, openMenu, accent }: { count: number; total: number; openCart: () => void; openMenu: () => void; accent: string }) {
  return <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"><div className="grid grid-cols-3 items-center rounded-[1.35rem] bg-[#111113]/95 p-2 text-white shadow-[0_20px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-2xl py-2 text-[11px] font-black" style={{ background: accent, color: "#111" }}>Home</button><button onClick={openCart} className="py-2 text-[11px] font-black opacity-90">{count ? `Basket ${count} ${money(total)}` : "Basket"}</button><button onClick={openMenu} className="py-2 text-[11px] font-black opacity-75">Switch</button></div></nav>;
}

function MenuSheet({ count, total, tableNumber, changeTable, close, goHome, openCart, experience, mode, switchMode }: { count: number; total: number; tableNumber: number; changeTable: (tableNumber: number) => void; close: () => void; goHome: () => void; openCart: () => void; experience: MenuExperience; mode: MenuExperienceId; switchMode: (mode: MenuExperienceId) => void }) {
  const [tableOpen, setTableOpen] = useState(false);
  const [draftTable, setDraftTable] = useState(String(tableNumber));
  const parsedDraft = Number(draftTable);
  const validDraft = Number.isInteger(parsedDraft) && parsedDraft >= 1 && parsedDraft <= 999;
  const theme = experience.theme;

  function saveTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validDraft) return;
    changeTable(parsedDraft);
    setTableOpen(false);
  }

  return <div className="sheet-backdrop-enter fixed inset-0 z-[95] flex items-start justify-center bg-[#111517]/35 p-4 pt-20 backdrop-blur-sm">
    <div className="sheet-panel-enter w-full max-w-[480px] rounded-[2rem] p-4 shadow-[0_26px_70px_rgba(29,37,40,0.28)] ring-1 ring-white/80" style={{ background: theme.background, color: theme.ink }}>
      <div className="flex items-center justify-between">
        <div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Menu</p><h2 className="text-2xl font-black tracking-tight">{experience.name}</h2></div>
        <button onClick={close} className="rounded-full px-4 py-3 text-xs font-black shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}>Close</button>
      </div>
      <section className="mt-5 rounded-[1.5rem] p-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>
        <p className="px-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: theme.muted }}>Switch design</p>
        <div className="mt-3 grid gap-2">{experienceOptions.map((option) => {
          const active = option.id === mode;
          return <button key={option.id} onClick={() => switchMode(option.id)} className="flex min-h-16 items-center justify-between rounded-[1.25rem] px-4 text-left ring-1 ring-black/5" style={{ background: active ? theme.deep : theme.soft, color: active ? "white" : theme.ink }}><span><span className="block text-sm font-black">{option.label}{active ? " selected" : ""}</span><span className="block text-xs font-bold opacity-70">Open this customer layout</span></span><span className="text-xl">Next</span></button>;
        })}</div>
      </section>
      <div className="mt-3 grid gap-3">
        <button onClick={goHome} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><span><span className="block text-sm font-black">Home</span><span className="block text-xs font-bold opacity-70">Back to the main menu</span></span><span className="text-xl">Go</span></button>
        <div className="rounded-[1.5rem] px-4 py-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>
          <button onClick={() => setTableOpen((open) => !open)} className="flex w-full items-center justify-between text-left"><span><span className="block text-sm font-black">Change Table</span><span className="block text-xs font-bold opacity-70">Current table {tableNumber}</span></span><span className="text-xl">Edit</span></button>
          {tableOpen && <form onSubmit={saveTable} className="mt-3 flex items-center gap-2"><input value={draftTable} onChange={(event) => setDraftTable(event.target.value)} inputMode="numeric" pattern="[0-9]*" aria-label="Table number" className="min-h-10 w-full rounded-2xl px-3 text-sm font-black outline-none ring-1 ring-black/5" style={{ background: theme.soft, color: theme.ink }} /><button type="submit" disabled={!validDraft} className="min-h-10 rounded-2xl px-4 text-xs font-black disabled:bg-slate-200 disabled:text-slate-400" style={validDraft ? { background: theme.deep, color: "white" } : undefined}>Save</button></form>}
        </div>
        <button onClick={openCart} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left text-white shadow-[0_18px_42px_rgba(29,37,40,0.22)]" style={{ background: theme.deep }}><span><span className="block text-sm font-black">Basket</span><span className="block text-xs font-bold text-white/65">{count ? `${count} items ${money(total)}` : "No items yet"}</span></span><span className="text-xl">Open</span></button>
      </div>
    </div>
  </div>;
}
