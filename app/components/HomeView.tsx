"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { categories, money, type MenuItem } from "../lib/menu";
import VegetarianBadge from "./VegetarianBadge";

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

  return (
    <>
      <main className="px-4 pb-32 pt-4">
        <header className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">Table 3</p>
            <h1 className="text-lg font-black text-slate-950">The Corner Cafe</h1>
          </div>
          <label className="mt-4 flex h-12 items-center rounded-2xl bg-slate-100 px-4">
            <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search menu" />
          </label>
        </header>

        {!props.query && !props.popularOnly && popularItem && (
          <button onClick={props.showPopular} className="mt-4 block w-full overflow-hidden rounded-[2rem] bg-slate-900 text-left text-white shadow-sm transition active:scale-[0.99]">
            <div key={popularItem.id} className="relative h-40 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${popularItem.image})` }}>
              {popularItem.available === false && <UnavailableOverlay />}
            </div>
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Popular today</p>
              <h2 className="mt-1 text-2xl font-black">{popularItem.name}</h2>
              <p className="mt-2 text-sm font-semibold text-white/70">Tap to view popular items.</p>
            </div>
          </button>
        )}

        <section className="mt-5">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {categories.map((entry) => (
              <button key={entry} onClick={() => { props.setCategory(entry); if (props.popularOnly) props.showAll(); }} className={props.category === entry && !props.popularOnly ? "min-w-[88px] rounded-[1.4rem] bg-slate-900 px-4 py-4 text-sm font-black text-white" : "min-w-[88px] rounded-[1.4rem] bg-white px-4 py-4 text-sm font-black text-slate-700 ring-1 ring-slate-200"}>
                {entry}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Menu</p>
              <h2 className="text-xl font-black text-slate-950">{props.popularOnly ? "Popular items" : props.category === "All" ? "All items" : props.category}</h2>
            </div>
            {props.popularOnly && <button onClick={props.showAll} className="text-sm font-black text-orange-600">Show all</button>}
          </div>

          <div className="space-y-3">
            {props.filtered.map((item) => {
              const unavailable = item.available === false;
              return (
                <article key={item.id} onClick={() => props.openItem(item)} className={unavailable ? "flex cursor-pointer gap-3 rounded-3xl bg-white p-3 opacity-70 shadow-sm ring-1 ring-slate-200 active:scale-[0.99]" : "flex cursor-pointer gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"}>
                  <div className="relative h-24 w-24 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
                    {item.vegetarian && <VegetarianBadge className="absolute left-2 top-2" />}
                    {unavailable && <UnavailableOverlay />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-600">{item.category}</p>
                      <span className={unavailable ? "rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700" : "rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700"}>{unavailable ? "Unavailable" : "Available"}</span>
                    </div>
                    <h3 className="mt-1 line-clamp-1 font-black text-slate-950">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500">{item.description}</p>
                    <p className="mt-1 line-clamp-1 text-[11px] font-black text-slate-500">Allergens: {item.allergens.join(", ")}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black">{money(item.price)}</span>
                      {props.cart[item.id] ? <Stepper qty={props.cart[item.id]} minus={(event) => removeOnly(event, item.id)} plus={(event) => addOnly(event, item)} disabled={unavailable} /> : <button onClick={(event) => addOnly(event, item)} disabled={unavailable} className={unavailable ? "grid h-9 w-9 cursor-not-allowed place-items-center rounded-full bg-slate-200 font-black text-slate-400" : "add"}>+</button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Bottom count={props.count} total={props.total} open={props.openCart} />
    </>
  );
}

function UnavailableOverlay() {
  return <div className="absolute inset-0 grid place-items-center rounded-2xl bg-slate-950/55"><span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase text-red-700">Not available</span></div>;
}

export function Stepper({ qty, minus, plus, disabled = false }: { qty: number; minus: (event: MouseEvent) => void; plus: (event: MouseEvent) => void; disabled?: boolean }) {
  return <div className="flex items-center rounded-full bg-slate-100 p-1"><button onClick={minus} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black">-</button><span className="min-w-7 text-center text-xs font-black">{qty}</span><button onClick={plus} disabled={disabled} className={disabled ? "grid h-7 w-7 cursor-not-allowed place-items-center rounded-full bg-slate-200 font-black text-slate-400" : "grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-black text-white"}>+</button></div>;
}

function Bottom({ count, total, open }: { count: number; total: number; open: () => void }) {
  return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-[#f4f1ea]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]"><button onClick={open} className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-slate-900 px-4 text-left text-white"><span><span className="block text-sm font-black">{count ? `${count} items` : "Table 3"}</span><span className="block text-xs font-semibold text-white/65">{count ? "Ready for checkout" : "Add items to start"}</span></span><span className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black">{count ? money(total) : "Basket"}</span></button></section>;
}
