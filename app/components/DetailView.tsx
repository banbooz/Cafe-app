"use client";

import { money, type MenuItem } from "../lib/menu";
import DietaryBadges from "./DietaryBadges";

type Props = {
  item: MenuItem;
  qty: number;
  add: (id: number) => void;
  remove: (id: number) => void;
  back: () => void;
  openCart: () => void;
};

export default function DetailView({ item, qty, add, remove, back, openCart }: Props) {
  const unavailable = item.available === false;

  return (
    <>
      <main className="page-enter min-h-screen bg-[#f7f7f5] px-4 pb-32 pt-4 text-[#1d2528]">
        <header className="motion-header sticky top-0 z-30 -mx-4 bg-[#f7f7f5]/85 px-4 pb-3 pt-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button onClick={back} className="grid h-11 w-11 place-items-center rounded-full bg-white text-xl font-black shadow-[0_12px_30px_rgba(29,37,40,0.12)] ring-1 ring-black/5">‹</button>
            <p className="max-w-[210px] truncate text-sm font-black text-[#111517]">{item.category}</p>
            <button onClick={openCart} className="grid h-11 w-11 place-items-center rounded-full bg-white text-xs font-black shadow-[0_12px_30px_rgba(29,37,40,0.12)] ring-1 ring-black/5">Bag</button>
          </div>
        </header>

        <section className="detail-hero-motion mt-2 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(29,37,40,0.14)] ring-1 ring-black/5">
          <div className="grid h-80 grid-cols-[1.2fr_0.8fr] gap-1 bg-white p-1">
            <div className="hero-photo-motion relative overflow-hidden rounded-[1.75rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
              {unavailable && <UnavailableOverlay />}
            </div>
            <div className="grid gap-1">
              <div className="hero-photo-motion rounded-[1.4rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})`, animationDelay: "80ms" }} />
              <div className="hero-photo-motion relative rounded-[1.4rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})`, animationDelay: "140ms" }}>
                <div className="absolute inset-0 rounded-[1.4rem] bg-black/25" />
                <span className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-2 text-[11px] font-black text-[#111517] shadow-lg">View</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5f7f80]">{item.category}</p>
                <h1 className="mt-2 text-3xl font-black leading-none tracking-tight text-[#111517]">{item.name}</h1>
              </div>
              <span className="rounded-full bg-[#f1f4f4] px-4 py-3 text-sm font-black text-[#111517] ring-1 ring-black/5">{money(item.price)}</span>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[1.5rem] bg-[#f7f9f9] p-4 ring-1 ring-black/5">
              <DietaryBadges item={item} />
              <p className="text-sm font-semibold leading-6 text-[#617174]">{unavailable ? "This item is currently unavailable from the kitchen." : item.description}</p>
            </div>

            <div className="mt-5 grid gap-3">
              <Info title="Prep time" text={item.prep} delay="120ms" />
              <Info title="Allergens" text={item.allergens.join(", ")} delay="180ms" />
            </div>
          </div>
        </section>
      </main>

      <section className="dock-slide-up fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 sm:bottom-5">
        {unavailable ? (
          <button disabled className="min-h-16 w-full cursor-not-allowed rounded-full bg-slate-200 px-5 text-sm font-black text-slate-500 shadow-none">Item not available</button>
        ) : qty ? (
          <div key={qty} className="basket-count-pop flex min-h-16 items-center gap-2 rounded-full bg-[#263238]/95 p-2 text-white shadow-[0_20px_50px_rgba(29,37,40,0.32)] backdrop-blur-xl">
            <button onClick={() => remove(item.id)} className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-lg font-black">-</button>
            <button onClick={openCart} className="flex-1 text-sm font-black">{qty} in basket</button>
            <button onClick={() => add(item.id)} className="add-burst grid h-12 w-12 place-items-center rounded-full bg-[#ff385c] text-lg font-black shadow-lg">+</button>
          </div>
        ) : (
          <button onClick={() => add(item.id)} className="add-burst min-h-16 w-full rounded-full bg-[#ff385c] px-5 text-sm font-black text-white shadow-[0_20px_50px_rgba(255,56,92,0.28)]">Add to basket</button>
        )}
      </section>
    </>
  );
}

function Info({ title, text, delay }: { title: string; text: string; delay: string }) {
  return (
    <div style={{ animationDelay: delay }} className="cart-row-enter rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#5f7f80]">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#1d2528]">{text}</p>
    </div>
  );
}

function UnavailableOverlay() {
  return <div className="absolute inset-0 grid place-items-center rounded-[1.75rem] bg-slate-950/55"><span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-rose-700 shadow-lg">Not available</span></div>;
}
