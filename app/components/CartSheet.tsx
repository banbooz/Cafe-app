"use client";

import { money, type MenuItem } from "../lib/menu";
import DietaryBadges from "./DietaryBadges";

type CartItem = MenuItem & { qty: number };

type Props = {
  items: CartItem[];
  total: number;
  chefNotes: string;
  setChefNotes: (notes: string) => void;
  close: () => void;
  add: (id: number) => void;
  remove: (id: number) => void;
  send: () => void;
};

export default function CartSheet({ items, total, chefNotes, setChefNotes, close, add, remove, send }: Props) {
  const unavailableItems = items.filter((item) => item.available === false);
  const hasUnavailable = unavailableItems.length > 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#111517]/45 p-3 backdrop-blur-sm">
      <div className="w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-[#f7f7f5] p-4 shadow-[0_26px_70px_rgba(29,37,40,0.32)] ring-1 ring-white/80">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5f7f80]">Table 3</p>
            <h2 className="text-2xl font-black tracking-tight text-[#111517]">Basket</h2>
          </div>
          <button onClick={close} className="rounded-full bg-white px-4 py-3 text-xs font-black text-[#1d2528] shadow-sm ring-1 ring-black/5">Close</button>
        </div>

        {hasUnavailable && <div className="mt-4 rounded-[1.5rem] bg-rose-50 p-4 text-sm font-black text-rose-700 ring-1 ring-rose-100">Some items are no longer available. Remove them before sending the order.</div>}

        <div className="no-scrollbar mt-4 max-h-72 space-y-3 overflow-y-auto">
          {items.length ? items.map((item) => <CartRow key={item.id} item={item} add={add} remove={remove} />) : <p className="rounded-[1.5rem] bg-white p-7 text-center text-sm font-bold text-[#617174] shadow-sm ring-1 ring-black/5">Basket is empty</p>}
        </div>

        <label className="mt-4 block rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5f7f80]">Chef notes</span>
          <textarea value={chefNotes} onChange={(event) => setChefNotes(event.target.value)} className="mt-3 min-h-20 w-full resize-none rounded-[1.25rem] bg-[#f1f4f4] p-3 text-sm font-bold text-[#1d2528] outline-none placeholder:text-slate-400" placeholder="No onions, sauce on the side, allergy notes..." />
        </label>

        <div className="mt-4 flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
          <span className="font-black text-[#1d2528]">Total</span>
          <span className="text-2xl font-black text-[#111517]">{money(total)}</span>
        </div>
        <button onClick={send} disabled={!items.length || hasUnavailable} className="mt-4 min-h-16 w-full rounded-full bg-[#ff385c] px-5 text-sm font-black text-white shadow-[0_18px_44px_rgba(255,56,92,0.25)] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">{hasUnavailable ? "Remove unavailable item(s)" : "Send order"}</button>
      </div>
    </div>
  );
}

function CartRow({ item, add, remove }: { item: CartItem; add: (id: number) => void; remove: (id: number) => void }) {
  const unavailable = item.available === false;

  return (
    <article className={unavailable ? "flex items-center gap-3 rounded-[1.5rem] bg-white p-3 opacity-70 shadow-sm ring-1 ring-rose-100" : "flex items-center gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-black/5"}>
      <div className="relative h-16 w-16 shrink-0 rounded-[1.2rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
        {unavailable && <div className="absolute inset-0 rounded-[1.2rem] bg-slate-950/45" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-black text-[#111517]">{item.name}</h3>
          {unavailable && <span className="shrink-0 rounded-full bg-rose-100 px-2 py-1 text-[10px] font-black uppercase text-rose-700">Unavailable</span>}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <DietaryBadges item={item} />
          <p className="text-xs font-bold text-[#617174]">{money(item.price)}</p>
        </div>
      </div>
      <div className="flex items-center rounded-full bg-[#f1f4f4] p-1 ring-1 ring-black/5">
        <button onClick={() => remove(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-white font-black shadow-sm">-</button>
        <span className="min-w-8 text-center text-xs font-black">{item.qty}</span>
        <button onClick={() => add(item.id)} disabled={unavailable} className={unavailable ? "grid h-8 w-8 cursor-not-allowed place-items-center rounded-full bg-slate-200 font-black text-slate-400" : "grid h-8 w-8 place-items-center rounded-full bg-[#263238] font-black text-white shadow-sm"}>+</button>
      </div>
    </article>
  );
}
