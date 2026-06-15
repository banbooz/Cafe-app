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

export default function HomeView(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const experience = menuExperiences[props.experienceMode];
  const isRestaurant = props.experienceMode === "restaurant";
  const theme = experience.theme;
  const visible = props.filtered.length ? props.filtered : props.allItems;
  const hero = visible.find((item) => item.popular) || visible[0] || props.allItems[0] || experience.items[0];
  const accent = isRestaurant ? "#f5c116" : theme.accent;

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

  function openCard(item: MenuItem) {
    if (isRestaurant) props.openItem(item);
  }

  const pageStyle = isRestaurant
    ? { background: "#0f0f10", color: "white" }
    : { background: props.experienceMode === "cafe" ? "#f5d49a" : "#171312", color: theme.ink };

  const panelStyle = isRestaurant
    ? { background: "#f7f7f5", color: "#121516" }
    : { background: theme.panel, color: theme.ink };

  return <main className="min-h-screen px-3 pb-32 pt-4" style={pageStyle}>
    <div className="mx-auto max-w-[440px]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Table {props.tableNumber}</p>
          <h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em]">{experience.label}</h1>
        </div>
        <button onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-full shadow-sm ring-1 ring-white/10" style={{ background: isRestaurant ? "#232323" : theme.panel }}>☰</button>
      </header>

      <label className="mt-4 flex h-12 items-center gap-3 rounded-full px-4 ring-1 ring-black/10" style={{ background: isRestaurant ? "#1c1c1f" : theme.panel }}>
        <span className="opacity-50">⌕</span>
        <input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none placeholder:opacity-50" placeholder="Search menu or allergens" />
      </label>

      <button onClick={(event) => addItem(event, hero)} className="mt-4 grid h-[150px] w-full grid-cols-[1fr_118px] overflow-hidden rounded-[1.8rem] p-4 text-left shadow-[0_22px_50px_rgba(0,0,0,0.22)]" style={{ background: accent, color: "#111" }}>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] opacity-60">Featured</p>
          <h2 className="mt-1 line-clamp-2 text-[23px] font-black leading-[0.95] tracking-[-0.05em]">{hero.name}</h2>
          <span className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-black text-white">Add to basket</span>
        </div>
        <div className="h-[118px] rounded-[1.5rem] bg-white bg-cover bg-center shadow-[0_18px_30px_rgba(0,0,0,0.18)]" style={{ backgroundImage: `url(${hero.image})` }} />
      </button>

      <section className="mt-4 rounded-[1.8rem] p-3 shadow-sm ring-1 ring-black/5" style={panelStyle}>
        {isRestaurant ? <div className="grid grid-cols-5 gap-2">
          {["All", ...experience.categories.filter((entry) => entry !== "All")].slice(0, 5).map((entry) => <button key={entry} onClick={() => chooseCategory(entry)} className="rounded-[1.05rem] px-1 py-2 text-center shadow-sm ring-1 ring-black/5" style={{ background: props.category === entry ? accent : "white" }}><span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#f5f1e7] text-lg">{experience.categoryIcons[entry] || "★"}</span><span className="mt-1 block text-[9px] font-black leading-tight text-black">{entry === "Main" ? "Food" : entry}</span></button>)}
        </div> : <div>
          <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">Scrollable sections</p><h2 className="text-xl font-black">{experience.label}</h2></div><button onClick={() => chooseCategory("All")} className="rounded-full px-3 py-2 text-[11px] font-black" style={{ background: props.category === "All" ? accent : theme.soft, color: props.category === "All" ? "#111" : theme.ink }}>All</button></div>
          <nav className="no-scrollbar flex gap-3 overflow-x-auto pb-2">{experience.categories.filter((entry) => entry !== "All").map((entry) => <button key={entry} onClick={() => chooseCategory(entry)} className="shrink-0 text-center"><span className="grid h-[76px] w-[76px] place-items-center rounded-full text-2xl shadow-[0_14px_34px_rgba(0,0,0,0.18)] ring-1 ring-black/10" style={{ background: props.category === entry ? accent : theme.soft, color: props.category === entry ? "#111" : theme.ink }}>{experience.categoryIcons[entry] || "•"}</span><span className="mt-2 block w-[76px] truncate text-[10px] font-black opacity-70">{entry}</span></button>)}</nav>
        </div>}
      </section>

      <section ref={menuRef} className="mt-5 scroll-mt-5 rounded-[1.8rem] p-3 shadow-sm ring-1 ring-black/5" style={panelStyle}>
        <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">Main menu</p><h2 className="text-xl font-black">{props.category === "All" ? "Everything" : props.category}</h2></div>{props.count > 0 && <span className="shrink-0 rounded-full px-3 py-2 text-[11px] font-black" style={{ background: isRestaurant ? "#fff7d2" : theme.soft }}>{props.count} · {money(props.total)}</span>}</div>
        <div className={props.experienceMode === "cafe" ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          {visible.slice(0, 10).map((item, index) => <MenuCard key={item.id} item={item} qty={props.cart[item.id] || 0} theme={theme} compact={props.experienceMode === "cafe"} index={index} open={() => openCard(item)} add={props.add} remove={props.remove} />)}
        </div>
      </section>
    </div>

    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-3 items-center rounded-[1.35rem] p-2 shadow-[0_20px_48px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl" style={{ background: isRestaurant ? "#111113f2" : `${theme.panel}f2` }}>
        <button onClick={() => chooseCategory("All")} className="rounded-2xl py-2 text-[11px] font-black" style={{ background: accent, color: "#111" }}>Home</button>
        <button onClick={props.openCart} className="py-2 text-[11px] font-black opacity-75">Basket{props.count > 0 ? ` · ${props.count}` : ""}</button>
        <button onClick={() => setMenuOpen(true)} className="py-2 text-[11px] font-black opacity-75">More</button>
      </div>
    </nav>

    {menuOpen && <MenuSheet count={props.count} total={props.total} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={() => { chooseCategory("All"); setMenuOpen(false); }} openCart={props.openCart} experience={experience} mode={props.experienceMode} switchMode={(mode) => { props.setExperienceMode(mode); setMenuOpen(false); }} />}
  </main>;
}

function MenuCard({ item, qty, theme, compact, index, open, add, remove }: { item: MenuItem; qty: number; theme: MenuExperience["theme"]; compact: boolean; index: number; open: () => void; add: (id: number) => void; remove: (id: number) => void }) {
  const unavailable = item.available === false;
  if (compact) return <article className="relative overflow-hidden rounded-[1.45rem] bg-white/70 p-2.5 shadow-sm ring-1 ring-black/5"><div className="h-28 rounded-[1.15rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><p className="mt-2 line-clamp-1 text-[12px] font-black">{item.name}</p><DietaryBadges item={item} className="mt-1" /><div className="mt-2 flex items-center justify-between"><span className="text-xs font-black">{money(item.price)}</span><Qty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={unavailable} /></div></article>;
  return <article onClick={open} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }} className={unavailable ? "food-card-motion px-3 py-2.5 opacity-70" : "food-card-motion px-3 py-2.5"}><div className="flex items-start gap-3"><div className="h-[72px] w-[72px] shrink-0 rounded-[1rem] bg-cover bg-center ring-1 ring-black/5" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: theme.muted }}>{item.category}</p><h3 className="mt-0.5 line-clamp-1 text-base font-black leading-tight tracking-tight">{item.name}</h3></div><span className="shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase" style={{ background: unavailable ? "#fff1f2" : theme.soft, color: unavailable ? "#be123c" : theme.muted }}>{unavailable ? "Unavailable" : "Available"}</span></div><div className="mt-1 flex items-start gap-1.5"><DietaryBadges item={item} /><p className="line-clamp-1 text-xs font-semibold leading-4" style={{ color: theme.muted }}>{item.description}</p></div><div className="mt-1.5 flex items-center justify-between gap-2"><span className="text-sm font-black">{money(item.price)}</span><Qty qty={qty} add={() => add(item.id)} remove={() => remove(item.id)} disabled={unavailable} /></div></div></div></article>;
}

function Qty({ qty, add, remove, disabled = false }: { qty: number; add: () => void; remove: () => void; disabled?: boolean }) {
  if (!qty) return <button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="rounded-full bg-black px-3 py-1.5 text-[11px] font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">Add +</button>;
  return <div className="flex items-center rounded-full bg-black/10 p-0.5"><button onClick={(event) => { event.stopPropagation(); remove(); }} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black shadow-sm">-</button><span className="min-w-7 text-center text-xs font-black">{qty}</span><button onClick={(event) => { event.stopPropagation(); add(); }} disabled={disabled} className="grid h-7 w-7 place-items-center rounded-full bg-black font-black text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400">+</button></div>;
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
