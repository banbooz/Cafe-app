"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { experienceOptions, money, type MenuExperience, type MenuExperienceId, type MenuItem } from "../lib/menu";
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
  categories: readonly string[];
  experience: MenuExperience;
  experienceId: MenuExperienceId;
  changeExperience: (experienceId: MenuExperienceId) => void;
};

export default function HomeView(props: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const theme = props.experience.theme;
  const popular = props.filtered.filter((item) => item.popular);
  const feature = popular.length ? popular[featureIndex % popular.length] : undefined;
  const title = props.popularOnly ? "Popular today" : props.category === "All" ? props.experience.menuTitle : props.category;

  useEffect(() => setFeatureIndex(0), [props.experienceId]);
  useEffect(() => {
    if (!popular.length) return;
    const timer = window.setInterval(() => setFeatureIndex((current) => (current + 1) % popular.length), 5000);
    return () => window.clearInterval(timer);
  }, [popular.length]);

  function addOnly(event: MouseEvent, item: MenuItem) {
    event.stopPropagation();
    if (item.available !== false) props.add(item.id);
  }

  function removeOnly(event: MouseEvent, id: number) {
    event.stopPropagation();
    props.remove(id);
  }

  function resetMenu() {
    props.setQuery("");
    props.showAll();
    props.setCategory("All");
    setMenuOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  return (
    <>
      <main className="page-enter min-h-screen px-4 pb-32 pt-4" style={{ background: theme.background, color: theme.ink }}>
        <header className="motion-header sticky top-0 z-30 -mx-4 px-4 pb-3 pt-2 backdrop-blur-xl" style={{ background: theme.background }}>
          <div className="mx-auto max-w-[480px]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Table {props.tableNumber} · {props.experience.eyebrow}</p>
                <h1 className="truncate text-xl font-black tracking-tight">{props.experience.name}</h1>
                <p className="mt-1 line-clamp-1 text-xs font-bold" style={{ color: theme.muted }}>{props.experience.tagline}</p>
              </div>
              <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-full shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>
                <span className="grid gap-1.5"><span className="block h-0.5 w-5 rounded-full" style={{ background: theme.ink }} /><span className="block h-0.5 w-5 rounded-full" style={{ background: theme.ink }} /><span className="block h-0.5 w-5 rounded-full" style={{ background: theme.ink }} /></span>
              </button>
            </div>
            <label className="search-motion flex h-14 items-center gap-3 rounded-full px-5 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>
              <span style={{ color: theme.muted }}>⌕</span>
              <input value={props.query} onChange={(event) => props.setQuery(event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" style={{ color: theme.ink }} placeholder={props.experience.searchPlaceholder} />
            </label>
          </div>
        </header>

        <section className="mt-3">
          <div className="category-rail-motion no-scrollbar flex gap-6 overflow-x-auto border-b pb-3" style={{ borderColor: `${theme.ink}20` }}>
            {props.categories.map((entry) => {
              const active = props.category === entry && !props.popularOnly;
              return <button key={entry} onClick={() => { props.setCategory(entry); if (props.popularOnly) props.showAll(); }} className="motion-tab min-w-16 border-b-2 pb-2 text-center" style={{ borderColor: active ? theme.ink : "transparent", color: active ? theme.ink : theme.muted }}><span className="mx-auto grid h-8 w-8 place-items-center rounded-2xl text-lg shadow-sm ring-1 ring-black/5" style={{ background: active ? theme.soft : theme.panel }}>{props.experience.categoryIcons[entry] || "•"}</span><span className="mt-1 block text-xs font-black">{entry}</span></button>;
            })}
          </div>
        </section>

        {!props.query && !props.popularOnly && feature && (
          <button onClick={props.showPopular} className="feature-motion-card mt-5 block w-full overflow-hidden rounded-[2rem] text-left shadow-[0_24px_60px_rgba(29,37,40,0.16)] ring-1 ring-black/5" style={{ background: theme.panel }}>
            <div className="relative h-60 overflow-hidden">
              <div className="feature-kenburns absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${feature.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/80">{props.experience.featuredLabel}</p>
                <h2 className="mt-2 text-3xl font-black leading-none">{feature.name}</h2>
                <div className="mt-4 flex items-center justify-between"><span className="rounded-full bg-white/20 px-3 py-2 text-xs font-black">{money(feature.price)}</span><span className="rounded-full bg-white px-4 py-2 text-xs font-black" style={{ color: theme.deep }}>{props.experience.featuredCta}</span></div>
              </div>
            </div>
          </button>
        )}

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>{props.experience.menuLabel}</p><h2 className="text-2xl font-black tracking-tight">{title}</h2></div>
            {props.popularOnly && <button onClick={props.showAll} className="rounded-full px-4 py-2 text-xs font-black shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}>Show all</button>}
          </div>
          <div className="overflow-hidden rounded-[1.75rem] shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}>
            {props.filtered.length ? props.filtered.map((item, index) => <div key={item.id}><MenuRow item={item} qty={props.cart[item.id] || 0} theme={theme} index={index} open={() => props.openItem(item)} plus={(event) => addOnly(event, item)} minus={(event) => removeOnly(event, item.id)} />{index < props.filtered.length - 1 && <div className="ml-[112px] h-px" style={{ background: `${theme.ink}16` }} />}</div>) : <p className="p-7 text-center text-sm font-bold" style={{ color: theme.muted }}>{props.experience.emptyText}</p>}
          </div>
        </section>
      </main>
      <Bottom count={props.count} total={props.total} tableNumber={props.tableNumber} open={props.openCart} experience={props.experience} />
      {menuOpen && <MenuSheet count={props.count} total={props.total} tableNumber={props.tableNumber} changeTable={props.changeTable} close={() => setMenuOpen(false)} goHome={resetMenu} openCart={() => { setMenuOpen(false); props.openCart(); }} experience={props.experience} experienceId={props.experienceId} changeExperience={(next) => { props.changeExperience(next); setMenuOpen(false); }} />}
    </>
  );
}

function MenuRow({ item, qty, theme, index, open, plus, minus }: { item: MenuItem; qty: number; theme: MenuExperience["theme"]; index: number; open: () => void; plus: (event: MouseEvent) => void; minus: (event: MouseEvent) => void }) {
  const unavailable = item.available === false;
  return <article onClick={open} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }} className={unavailable ? "food-card-motion cursor-pointer px-4 py-4 opacity-60" : "food-card-motion cursor-pointer px-4 py-4"}><div className="flex items-start gap-4"><div className="h-[88px] w-[88px] shrink-0 rounded-[1.4rem] bg-cover bg-center ring-1 ring-black/5" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: theme.muted }}>{item.category}</p><h3 className="mt-1 line-clamp-1 text-lg font-black leading-tight">{item.name}</h3></div><span className="shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase" style={{ background: unavailable ? "#fff1f2" : theme.soft, color: unavailable ? "#be123c" : theme.muted }}>{unavailable ? "Unavailable" : "Available"}</span></div><div className="mt-2 flex items-start gap-2"><DietaryBadges item={item} /><p className="line-clamp-2 text-sm font-semibold leading-5" style={{ color: theme.muted }}>{item.description}</p></div><div className="mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: theme.muted }}><span>{item.prep}</span><span>·</span><span>{item.allergens[0]}</span></div><div className="mt-3 flex items-center justify-between gap-3"><span className="text-base font-black">{money(item.price)}</span>{qty ? <Stepper qty={qty} minus={minus} plus={plus} disabled={unavailable} theme={theme} /> : <button onClick={plus} disabled={unavailable} className="rounded-full px-4 py-2 text-xs font-black disabled:bg-slate-200 disabled:text-slate-400" style={unavailable ? undefined : { background: theme.deep, color: "white" }}>Add +</button>}</div></div></div></article>;
}

export function Stepper({ qty, minus, plus, disabled = false, theme }: { qty: number; minus: (event: MouseEvent) => void; plus: (event: MouseEvent) => void; disabled?: boolean; theme?: MenuExperience["theme"] }) {
  return <div className="flex items-center rounded-full p-1 ring-1 ring-black/5" style={{ background: theme?.soft || "#f1f4f4" }}><button onClick={minus} className="grid h-8 w-8 place-items-center rounded-full bg-white font-black shadow-sm">-</button><span className="min-w-8 text-center text-xs font-black">{qty}</span><button onClick={plus} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-full font-black text-white disabled:bg-slate-200 disabled:text-slate-400" style={disabled ? undefined : { background: theme?.deep || "#263238" }}>+</button></div>;
}

function Bottom({ count, total, tableNumber, open, experience }: { count: number; total: number; tableNumber: number; open: () => void; experience: MenuExperience }) {
  const theme = experience.theme;
  return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 sm:bottom-5"><button onClick={open} className="basket-dock flex min-h-16 w-full items-center justify-between rounded-full px-5 text-left text-white shadow-[0_20px_50px_rgba(29,37,40,0.32)]" style={{ background: theme.deep }}><span><span className="block text-sm font-black">{count ? `${count} item${count === 1 ? "" : "s"}` : `Table ${tableNumber}`}</span><span className="block text-xs font-semibold text-white/65">{count ? `Table ${tableNumber} - Ready` : "Add items to start"}</span></span><span className="rounded-full px-5 py-3 text-sm font-black shadow-lg" style={{ background: theme.accent }}>{count ? money(total) : "Basket"}</span></button></section>;
}

function MenuSheet({ count, total, tableNumber, changeTable, close, goHome, openCart, experience, experienceId, changeExperience }: { count: number; total: number; tableNumber: number; changeTable: (tableNumber: number) => void; close: () => void; goHome: () => void; openCart: () => void; experience: MenuExperience; experienceId: MenuExperienceId; changeExperience: (experienceId: MenuExperienceId) => void }) {
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

  return <div className="sheet-backdrop-enter fixed inset-0 z-[95] flex items-start justify-center bg-[#111517]/35 p-4 pt-20 backdrop-blur-sm"><div className="sheet-panel-enter w-full max-w-[480px] rounded-[2rem] p-4 shadow-lg ring-1 ring-white/80" style={{ background: theme.background, color: theme.ink }}><div className="flex items-center justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: theme.muted }}>Menu</p><h2 className="text-2xl font-black tracking-tight">{experience.name}</h2></div><button onClick={close} className="rounded-full px-4 py-3 text-xs font-black shadow-sm ring-1 ring-black/5" style={{ background: theme.panel, color: theme.ink }}>Close</button></div><section className="mt-5 rounded-[1.5rem] p-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><p className="px-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: theme.muted }}>Switch demo</p><div className="mt-3 grid gap-2">{experienceOptions.map((option) => { const active = option.id === experienceId; return <button key={option.id} onClick={() => changeExperience(option.id)} className="flex min-h-16 items-center justify-between rounded-[1.25rem] px-4 text-left ring-1 ring-black/5" style={{ background: active ? theme.deep : theme.soft, color: active ? "white" : theme.ink }}><span><span className="block text-sm font-black">{option.label}{active ? " · Selected" : ""}</span><span className="block text-xs font-bold opacity-70">{option.id === "restaurant" ? "The current restaurant version" : option.id === "cafe" ? "Brown cafe remake" : "Dark refreshments mode"}</span></span><span className="text-xl">›</span></button>; })}</div></section><div className="mt-3 grid gap-3"><button onClick={goHome} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><span><span className="block text-sm font-black">Home</span><span className="block text-xs font-bold opacity-70">Back to the main menu</span></span><span className="text-xl">›</span></button><div className="rounded-[1.5rem] px-4 py-3 shadow-sm ring-1 ring-black/5" style={{ background: theme.panel }}><button onClick={() => setTableOpen((open) => !open)} className="flex w-full items-center justify-between text-left"><span><span className="block text-sm font-black">Change Table</span><span className="block text-xs font-bold opacity-70">Current table {tableNumber}</span></span><span className="text-xl">›</span></button>{tableOpen && <form onSubmit={saveTable} className="mt-3 flex items-center gap-2"><input value={draftTable} onChange={(event) => setDraftTable(event.target.value)} inputMode="numeric" pattern="[0-9]*" className="min-h-10 w-full rounded-2xl px-3 text-sm font-black outline-none ring-1 ring-black/5" style={{ background: theme.soft, color: theme.ink }} /><button type="submit" disabled={!validDraft} className="min-h-10 rounded-2xl px-4 text-xs font-black disabled:bg-slate-200 disabled:text-slate-400" style={validDraft ? { background: theme.deep, color: "white" } : undefined}>Save</button></form>}</div><button onClick={openCart} className="flex min-h-16 items-center justify-between rounded-[1.5rem] px-4 text-left text-white shadow-sm" style={{ background: theme.deep }}><span><span className="block text-sm font-black">Basket</span><span className="block text-xs font-bold text-white/65">{count ? `${count} items - ${money(total)}` : "No items yet"}</span></span><span className="text-xl">›</span></button></div></div></div>;
}
