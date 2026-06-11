"use client";

import { money, type MenuItem } from "../lib/menu";
import { Footer, Top } from "./AppShell";
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
      <Top title={item.name} back={back} right="Basket" onRight={openCart} />
      <main className="px-4 pb-32 pt-4">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="relative h-72 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
            {unavailable && <div className="absolute inset-0 grid place-items-center bg-slate-950/55"><span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase text-red-700">Not available</span></div>}
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">{item.category}</p>
              <span className={unavailable ? "rounded-full bg-red-100 px-3 py-2 text-xs font-black uppercase text-red-700" : "rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase text-emerald-700"}>{unavailable ? "Unavailable" : "Available"}</span>
            </div>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-black leading-tight text-slate-950">{item.name}</h1>
              <span className="h-fit rounded-2xl bg-slate-100 px-3 py-2 font-black">{money(item.price)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <DietaryBadges item={item} />
              <p className="text-sm font-bold leading-6 text-slate-500">{unavailable ? "This item is currently unavailable from the kitchen." : item.description}</p>
            </div>
            <p className="mt-2 text-sm font-black leading-6 text-slate-600">Allergens: {item.allergens.join(", ")}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Info label="Prep" value={item.prep} />
              <Info label="Category" value={item.category} />
            </div>
          </div>
        </div>
      </main>
      <Footer>
        {unavailable ? (
          <button disabled className="primary cursor-not-allowed bg-slate-300 text-slate-500 shadow-none">Item not available</button>
        ) : qty ? (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900 p-2 text-white">
            <button onClick={() => remove(item.id)} className="qty">-</button>
            <button onClick={openCart} className="flex-1 text-sm font-black">{qty} in basket</button>
            <button onClick={() => add(item.id)} className="qty-accent">+</button>
          </div>
        ) : (
          <button onClick={() => add(item.id)} className="primary">Add to basket</button>
        )}
      </Footer>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
