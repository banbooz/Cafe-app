"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { categories, money, type MenuItem } from "../lib/menu";
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
};

const categoryIcons: Record<string, string> = {
  All: "⌂",
  Starter: "✦",
  Main: "◉",
  Pudding: "◆",
  Drinks: "◌",
};

export default function HomeView(props: Props) {
  const popular = props.filtered.filter((item) => item.popular);
  const [popularIndex, setPopularIndex] = useState(0);
  const popularItem = popular.length ? popular[popularIndex % popular.length] : undefined;

  useEffect(() => {
    if (!popular.length) return;
    const timer = window.setInterval(() => {
      setPopularIndex((current) => (current + 1) % popular.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [popular.length]);

  function addOnly(event: MouseEvent, item: MenuItem) {
    event.stopPropagation();
    if (item.available === false) return;
    props.add(item.id);
  }

  function removeOnly(event: MouseEvent, id: number) {
    event.stopPropagation();
    props.remove(id);
  }

  const title = props.popularOnly ? "Popular today" : props.category === "All" ? "Explore menu" : props.category;

  return (
    <>
      <main className="page-enter min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-4 text-[#1d2528]">
        <header className="motion-header sticky top-0 z-30 -mx-4 bg-[#f7f7f5]/85 px-4 pb-3 pt-2 backdrop-blur-xl">
          <div className="mx-auto max-w-[430px]">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5f7f80]">Table 3</p>
                <h1 className="text-xl font-black tracking-tight text-[#111517]">The Corner Cafe</h1>
              </div>
              <button onClick={props.openCart} className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-black shadow-[0_12px_30px_rgba(29,37,40,0.12)] ring-1 ring-black/5">
                {props.count || "☰"}
              </button>
            </div>

            <label className="search-motion flex h-14 items-center gap-3 rounded-full bg-white px-5 shadow-[0_18px_40px_rgba(29,37,40,0.13)] ring-1 ring-black/5">
              <span className="text-sm text-slate-400">⌕</span>
              <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} className="w-full bg-transparent text-sm font-bold text-[#1d2528] outline-none placeholder:text-slate-400" placeholder="Start your search" />
            </label>
          </div>
        </header>

        <section className="mt-3">
          <div className="category-rail-motion no-scrollbar flex gap-7 overflow-x-auto border-b border-black/10 pb-3">
            {categories.map((entry) => {
              const active = props.category === entry && !props.popularOnly;
              return (
                <button key={entry} onClick={() => { props.setCategory(entry); if (props.popularOnly) props.showAll(); }} className={active ? "motion-tab motion-tab-active min-w-16 border-b-2 border-[#111517] pb-2 text-center text-[#111517]" : "motion-tab min-w-16 border-b-2 border-transparent pb-2 text-center text-[#617174]"}>
                  <span className="mx-auto grid h-8 w-8 place-items-center rounded-2xl bg-white text-lg shadow-[0_10px_24px_rgba(29,37,40,0.08)] ring-1 ring-black/5">{categoryIcons[entry] || "•"}</span>
                  <span className="mt-1 block text-xs font-black">{entry}</span>
                </button>
              );
            })}
          </div>
        </section>

        {!props.query && !props.popularOnly && popularItem && (
          <button onClick={props.showPopular} className="feature-motion-card mt-5 block w-full overflow-hidden rounded-[2rem] bg-white text-left shadow-[0_24px_60px_rgba(29,37,40,0.16)] ring-1 ring-black/5 active:scale-[0.99]">
            <div key={popularItem.id} className="feature-kenburns relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${popularItem.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
              {popularItem.available === false && <UnavailableOverlay />}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Featured today</p>
                <h2 className="mt-2 max-w-[280px] text-3xl font-black leading-none tracking-tight">{popularItem.name}</h2>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/18 px-3 py-2 text-xs font-black backdrop-blur-md">{money(popularItem.price)}</span>
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#111517] shadow-lg">View popular</span>
                </div>
              </div>
            </div>
          </button>
        )}

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5f7f80]">Menu</p>
              <h2 className="text-2xl font-black tracking-tight text-[#111517]">{title}</h2>
            </div>
            {props.popularOnly && <button onClick={props.showAll} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#263238] shadow-sm ring-1 ring-black/5">Show all</button>}
          </div>

          <div className="grid gap-5">
            {props.filtered.map((item, index) => (
              <FoodCard key={item.id} item={item} qty={props.cart[item.id] || 0} index={index} open={() => props.openItem(item)} plus={(event) => addOnly(event, item)} minus={(event) => removeOnly(event, item.id)} />
            ))}
          </div>
        </section>
      </main>
      <Bottom count={props.count} total={props.total} open={props.openCart} />
    </>
  );
}

function FoodCard({ item, qty, index, open, plus, minus }: { item: MenuItem; qty: number; index: number; open: () => void; plus: (event: MouseEvent) => void; minus: (event: MouseEvent) => void }) {
  const unavailable = item.available === false;

  return (
    <article onClick={open} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }} className={unavailable ? "food-card-motion cursor-pointer overflow-hidden rounded-[1.8rem] bg-white opacity-70 shadow-[0_18px_42px_rgba(29,37,40,0.10)] ring-1 ring-black/5 active:scale-[0.99]" : "food-card-motion cursor-pointer overflow-hidden rounded-[1.8rem] bg-white shadow-[0_18px_42px_rgba(29,37,40,0.10)] ring-1 ring-black/5 active:scale-[0.99]"}>
      <div className="relative h-52 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
        <button onClick={plus} disabled={unavailable} className={unavailable ? "add-burst absolute right-4 top-4 grid h-11 w-11 cursor-not-allowed place-items-center rounded-full bg-white/70 font-black text-slate-400 shadow-lg backdrop-blur-md" : "add-burst absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white font-black text-[#111517] shadow-[0_12px_26px_rgba(29,37,40,0.22)]"}>+</button>
        {unavailable && <UnavailableOverlay />}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5f7f80]">{item.category}</p>
            <h3 className="mt-1 line-clamp-1 text-xl font-black tracking-tight text-[#111517]">{item.name}</h3>
          </div>
          <span className={unavailable ? "rounded-full bg-rose-50 px-3 py-2 text-[10px] font-black uppercase text-rose-700" : "rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase text-emerald-700"}>{unavailable ? "Unavailable" : "Available"}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <DietaryBadges item={item} />
          <p className="line-clamp-1 text-sm font-semibold text-[#617174]">{item.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-base font-black text-[#111517]">{money(item.price)}</span>
          {qty ? <Stepper qty={qty} minus={minus} plus={plus} disabled={unavailable} /> : <span className="text-xs font-black text-[#617174]">Tap for details</span>}
        </div>
      </div>
    </article>
  );
}

function UnavailableOverlay() {
  return <div className="absolute inset-0 grid place-items-center bg-slate-950/55"><span className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase text-rose-700 shadow-lg">Not available</span></div>;
}

export function Stepper({ qty, minus, plus, disabled = false }: { qty: number; minus: (event: MouseEvent) => void; plus: (event: MouseEvent) => void; disabled?: boolean }) {
  return <div className="flex items-center rounded-full bg-[#f1f4f4] p-1 ring-1 ring-black/5"><button onClick={minus} className="grid h-8 w-8 place-items-center rounded-full bg-white font-black shadow-sm">-</button><span key={qty} className="qty-pop min-w-8 text-center text-xs font-black">{qty}</span><button onClick={plus} disabled={disabled} className={disabled ? "add-burst grid h-8 w-8 cursor-not-allowed place-items-center rounded-full bg-slate-200 font-black text-slate-400" : "add-burst grid h-8 w-8 place-items-center rounded-full bg-[#263238] font-black text-white shadow-sm"}>+</button></div>;
}

function Bottom({ count, total, open }: { count: number; total: number; open: () => void }) {
  return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 sm:bottom-5"><button key={count || "empty"} onClick={open} className={count ? "basket-dock basket-count-pop flex min-h-16 w-full items-center justify-between rounded-full bg-[#263238]/95 px-5 text-left text-white shadow-[0_20px_50px_rgba(29,37,40,0.32)] backdrop-blur-xl" : "basket-dock flex min-h-16 w-full items-center justify-between rounded-full bg-[#263238]/95 px-5 text-left text-white shadow-[0_20px_50px_rgba(29,37,40,0.32)] backdrop-blur-xl"}><span><span className="block text-sm font-black">{count ? `${count} item${count === 1 ? "" : "s"}` : "Table 3"}</span><span className="block text-xs font-semibold text-white/65">{count ? "Ready for checkout" : "Add items to start"}</span></span><span key={total} className="basket-price-pill rounded-full bg-[#ff385c] px-5 py-3 text-sm font-black shadow-lg">{count ? money(total) : "Basket"}</span></button></section>;
}
