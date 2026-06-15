"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
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

const restaurantTabs = [
  { label: "BREAKFAST", value: "All" },
  { label: "SIDES", value: "Starter" },
  { label: "TEA", value: "Drinks" },
  { label: "COFFEE", value: "Drinks" },
  { label: "OTHER HOT", value: "Main" },
];

export default function HomeView(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const experience = menuExperiences[props.experienceMode];
  const isRestaurant = props.experienceMode === "restaurant";
  const theme = experience.theme;
  const visible = props.filtered.length ? props.filtered : props.allItems;
  const hero = visible.find((item) => item.popular) || visible[0] || props.allItems[0] || experience.items[0];
  const accent = isRestaurant ? "#f4b23e" : theme.accent;

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
    return <main className="min-h-screen bg-[#eeeeea] pb-32 text-[#171717]">
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-black/10 bg-[#eeeeea]/95 px-4 backdrop-blur">
        <button onClick={() => setMenuOpen(true)} className="text-xl leading-none text-[#777]">☰</button>
        <h1 className="text-sm font-semibold text-[#555]">Menu</h1>
        <button onClick={props.openCart} className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#333] shadow-sm">{props.count || ""}</button>
      </header>

      <section className="h-[150px] bg-cover bg-center" style={{ backgroundImage: `url(${hero.image})` }} />

      <nav className="no-scrollbar sticky top-12 z-30 flex gap-5 overflow-x-auto border-b border-black/10 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#333]">
        {restaurantTabs.map((tab) => <button key={`${tab.label}-${tab.value}`} onClick={() => chooseCategory(tab.value)} className={props.category === tab.value ? "shrink-0 border-b-2 border-black pb-1" : "shrink-0 pb-1 text-[#777]"}>{tab.label}</button>)}
      </nav>

      <section ref={menuRef} className="mx-auto max-w-[430px] px-3 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#777]">Table {props.tableNumber}</p>
          <button onClick={() => chooseCategory("All")} className="rounded-full bg-white px-3 py-2 text-[10px] font-black shadow-sm ring-1 ring-black/10">See all</button>
        </div>
        <div className="space-y-2">
          {visible.slice(0, 12).map((item) => <RestaurantRow key={item.id} item={item} qty={props.cart[item.id] || 0} add={props.add} remove={props.remove} open={() => props.openItem(item)} />)}
        </div>
      </section>

      <BottomBar count={props.count} total={props.total} openCart={props.openCart} openMenu={() => setMenuOpen(true)} accent={accent} />
      {menuOpen && <MenuSheet count={props.count} total={props.total} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={() => { chooseCategory("All"); setMenuOpen(false); }} openCart={props.openCart} experience={experience} mode={props.experienceMode} switchMode={switchMode} />}
    </main>;
  }

  return <main className="min-h-screen px-3 pb-32 pt-4" style={{ background: props.experienceMode === "cafe" ? "#f5d49a" : "#171312", color: theme.ink }}>
    <div className="mx-auto max-w-[440px]">
      <header className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Table {props.tableNumber}</p><h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em]">{experience.label}</h1></div><button onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-full shadow-sm ring-1 ring-white/10" style={{ background: theme.panel }}>☰</button></header>
      <label className="mt-4 flex h-12 items-center gap-3 rounded-full px-4 ring-1 ring-black/10" style={{ background: theme.panel }}><span className="opacity-50">⌕</span><input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none placeholder:opacity-50" placeholder="Search menu or allergens" /></label>
      <button onClick={(event) => addItem(event, hero)} className="mt-4 grid h-[150px] w-full grid-cols-[1fr_118px] overflow-hidden rounded-[1.8rem] p-4 text-left shadow-[0_22px_50px_rgba(0,0,0,0.22)]" style={{ background: accent, color: "#111" }}><div><p className="text-[9px] font-black uppercase tracking-[0.14em] opacity-60">Featured</p><h2 className="mt-1 line-clamp-2 text-[23px] font-black leading-[0.95] tracking-[-0.05em]">{hero.name}</h2><span className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-black text-white">Add to basket</span></div><div className="h-[118px] rounded-[1.5rem] bg-white bg-cover bg-center shadow-[0_18px_30px_rgba(0,0,0,0.18)]" style={{ backgroundImage: `url(${hero.image})` }} /></button>
      <section className="mt-4 rounded-[1.8rem] p-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}><div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">Scrollable sections</p><h2 className="text-xl font-black">{experience.label}</h2></div><button onClick={() => chooseCategory("All")} className="rounded-full px-3 py-2 text-[11px] font-black" style={{ background: props.category === "All" ? accent : theme.soft, color: props.category === "All" ? "#111" : theme.ink }}>All</button></div><nav className="no-scrollbar flex gap-3 overflow-x-auto pb-2">{experience.categories.filter((entry) => entry !== "All").map((entry) => <button key={entry} onClick={() => chooseCategory(entry)} className="shrink-0 text-center"><span className="grid h-[76px] w-[76px] place-items-center rounded-full text-2xl shadow-[0_14px_34px_rgba(0,0,0,0.18)] ring-1 ring-black/10" style={{ background: props.category === entry ? accent : theme.soft, color: props.category === entry ? "#111" : theme.ink }}>{experience.categoryIcons[entry] || "•"}</span><span className="mt-2 block w-[76px] truncate text-[10px] font-black opacity-70">{entry}</span></button>)}</nav></section>
      <section ref={menuRef} className="mt-5 scroll-mt-5 rounded-[1.8rem] p-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">Main menu</p><h2 className="text-xl font-black">{props.category === "All" ? "Everything" : props.category}</h2></div>{props.count > 0 && <span className="shrink-0 rounded-full px-3 py-2 text-[11px] font-black" style={{ background: theme.soft }}>{props.count} · {money(props.total)}</span>}</div><div className={props.experienceMode === "cafe" ? "grid grid-cols-2 gap-3" : "grid gap-3"}>{visible.slice(0, 10).map((item) => props.experienceMode === "cafe" ? <CafeCard key={item.id} item={item} qty={props.cart[item.id] || 0} add={props.add} remove={props.remove} /> : <SimpleRow key={item.id} item={item} qty={props.cart[item.id] || 0} theme={theme} add={props.add} remove={props.remove} />)}</div></section>
    </div>
    <BottomBar count={props.count} total={props.total} openCart={props.openCart} openMenu={() => setMenuOpen(true)} accent={accent} />
    {menuOpen && <MenuSheet count={props.count} total={props.total} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={() => { chooseCategory("All"); setMenuOpen(false); }} openCart={props.openCart} experience={experience} mode={props.experienceMode} switchMode={switchMode} />}
  </main>;
}

function RestaurantRow({ item, qty, add, remove, open }: { item: MenuItem; qty: number; add: (id: number) => void; remove: (id: number) => void; open: () => void }) {
  return <article onClick={open} className="flex min-h-[108px] gap-3 rounded-sm border border-black/10 bg-white p-2 shadow-sm"><div className="h-[92px] w-[92px] shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1 py-1"><h3 className="line-clamp-1 text-[13px] font-black text-[#171717]">{item.name}</h3><p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4 text-[#555]">{item.description}</p><DietaryBadges item={item} className="mt-1" /><div className="mt-2 flex items-center justify-between"><span className="text-[11px] font-black text-[#111]">{money(item.price)}</span><Qty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></div></article>;
}

function CafeCard({ item, qty, add, remove }: { item: MenuItem; qty: number; add: (id: number) => void; remove: (id: number) => void }) {
  return <article className="relative overflow-hidden rounded-[1.45rem] bg-white/70 p-2.5 shadow-sm ring-1 ring-black/5"><div className="h-28 rounded-[1.15rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><p className="mt-2 line-clamp-1 text-[12px] font-black">{item.name}</p><DietaryBadges item={item} className="mt-1" /><div className="mt-2 flex items-center justify-between"><span className="text-xs font-black">{money(item.price)}</span><Qty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></article>;
}

function SimpleRow({ item, qty, theme, add, remove }: { item: MenuItem; qty: number; theme: MenuExperience["theme"]; add: (id: number) => void; remove: (id: number) => void }) {
  return <article className="flex items-start gap-3 rounded-[1.25rem] p-3 ring-1 ring-black/5" style={{ background: theme.soft }}><div className="h-[72px] w-[72px] shrink-0 rounded-[1rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: theme.muted }}>{item.category}</p><h3 className="line-clamp-1 text-base font-black">{item.name}</h3><div className="mt-1 flex items-start gap-1.5"><DietaryBadges item={item} /><p className="line-clamp-1 text-xs font-semibold" style={{ color: theme.muted }}>{item.description}</p></div><div className="mt-2 flex items-center justify-between"><span className="text-sm font-black">{money(item.price)}</span><Qty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={item.available === false} /></div></div></article>;
}

function Qty({ qty, add, remove, disabled = false }: { qty: number; add: () => void; remove: () => void; disabled?: boolean }) {
  if (!qty) return <button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="rounded-full bg-black px-3 py-1.5 text-[11px] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">Add +</button>;
  return <div className="flex items-center rounded-full bg-black/10 p-0.5"><button onClick={(event) => { event.stopPropagation(); remove(); }} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black shadow-sm">-</button><span className="min-w-7 text-center text-xs font-black">{qty}</span><button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="grid h-7 w-7 place-items-center rounded-full bg-black font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">+</button></div>;
}

function BottomBar({ count, total, openCart, openMenu, accent }: { count: number; total: number; openCart: () => void; openMenu: () => void; accent: string }) {
  return <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"><div className="grid grid-cols-3 items-center rounded-[1.35rem] bg-[#111113]/95 p-2 text-white shadow-[0_20px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-2xl py-2 text-[11px] font-black" style={{ background: accent, color: "#111" }}>Home</button><button onClick={openCart} className="py-2 text-[11px] font-black opacity-90">{count ? `Basket · ${count} · ${money(total)}` : "Basket"}</button><button onClick={openMenu} className="py-2 text-[11px] font-black opacity-75">More</button></div></nav>;
}

function MenuSheet({ count, total, tableNumber, changeTable, close, goHome, openCart, experience, mode, switchMode }: { count: number; total: number; tableNumber: number; changeTable: (tableNumber: number) => void; close: () => void; goHome: () => void; openCart: () => void; experience: MenuExperience; mode: MenuExperienceId; switchMode: (mode: MenuExperienceId) => void }) {
  const [tableOpen, setTableOpen] = useState(false);
  const [draftTable, setDraftTable] = useState(String(tableNumber));
  const parsedDraft = Number(draftTable);
  const validDraft = Number.isInteger(parsedDraft) && parsedDraft >= 1 && parsedDraft <= 999;
  const theme = experience.theme;
  function saveTable(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validDraft) return; changeTable(parsedDraft); setTableOpen(false); }
  return <div className="sheet-backdrop-enter fixed inset-0 z-[95] flex items-start justify-center bg-[#111517]/35 p-4 pt-20 backdrop-blur-sm"><div className="sheet-panel-enter w-full max-w-[480px] rounded-[2rem] p-4 shadow-[0_26px_70px_rgba(29,37,40,0.28)] ring-1 ring-white/80" style={{ background: theme.background, color: theme.ink }}><div className="flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Menu</p><h2 className="text-2xl font-black tracking-tight">{experience.name}</h2></div><button onClick={close} className="rounded-full px-4 py-3 text-xs font-black shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}>Close</button></div><section className="mt-5 rounded-[1.5rem] p-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><p className="px-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: theme.muted }}>Switch demo</p><div className="mt-3 grid gap-2">{experienceOptions.map((option) => { const active = option.id === mode; return <button key={option.id} onClick={() => switchMode(option.id)} className="flex min-h-16 items-center justify-between rounded-[1.25rem] px-4 text-left ring-1 ring-black/5" style={{ background: active ? theme.deep : theme.soft, color: active ? "white" : theme.ink }}><span><span className="block text-sm font-black">{option.label}{active ? " · Selected" : ""}</span><span className="block text-xs font-bold opacity-70">Open this customer layout</span></span><span className="text-xl">›</span></button>; })}</div></section><div className="mt-3 grid gap-3"><button onClick={goHome} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><span><span className="block text-sm font-black">Home</span><span className="block text-xs font-bold opacity-70">Back to the main menu</span></span><span className="text-xl">›</span></button><div className="rounded-[1.5rem] px-4 py-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><button onClick={() => setTableOpen((open) => !open)} className="flex w-full items-center justify-between text-left"><span><span className="block text-sm font-black">Change Table</span><span className="block text-xs font-bold opacity-70">Current table {tableNumber}</span></span><span className="text-xl">›</span></button>{tableOpen && <form onSubmit={saveTable} className="mt-3 flex items-center gap-2"><input value={draftTable} onChange={(event) => setDraftTable(event.target.value)} inputMode="numeric" pattern="[0-9]*" aria-label="Table number" className="min-h-10 w-full rounded-2xl px-3 text-sm font-black outline-none ring-1 ring-black/5" style={{ background: theme.soft, color: theme.ink }} /><button type="submit" disabled={!validDraft} className="min-h-10 rounded-2xl px-4 text-xs font-black disabled:bg-slate-200 disabled:text-slate-400" style={validDraft ? { background: theme.deep, color: "white" } : undefined}>Save</button></form>}</div><button onClick={openCart} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left text-white shadow-[0_18px_42px_rgba(29,37,40,0.22)]" style={{ background: theme.deep }}><span><span className="block text-sm font-black">Basket</span><span className="block text-xs font-bold text-white/65">{count ? `${count} items - ${money(total)}` : "No items yet"}</span></span><span className="text-xl">›</span></button></div></div></div>;
}
