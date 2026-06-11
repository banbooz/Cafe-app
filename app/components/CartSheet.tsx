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
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-3">
      <div className="w-full max-w-[430px] rounded-[2rem] bg-[#f4f1ea] p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Basket</h2>
          <button onClick={close} className="rounded-full bg-white px-4 py-2 text-xs font-black ring-1 ring-slate-200">Close</button>
        </div>

        {hasUnavailable && <div className="mt-4 rounded-3xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-100">Some items are no longer available. Remove them before sending the order.</div>}

        <div className="no-scrollbar mt-4 max-h-72 space-y-3 overflow-y-auto">
          {items.length ? items.map((item) => <CartRow key={item.id} item={item} add={add} remove={remove} />) : <p className="rounded-3xl bg-white p-6 text-center text-sm font-bold text-slate-500">Basket is empty</p>}
        </div>

        <label className="mt-4 block rounded-3xl bg-white p-4 ring-1 ring-slate-200">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Chef notes</span>
          <textarea value={chefNotes} onChange={(event) => setChefNotes(event.target.value)} className="mt-3 min-h-20 w-full resize-none rounded-2xl bg-slate-100 p-3 text-sm font-bold outline-none" placeholder="No onions, sauce on the side, allergy notes..." />
        </label>

        <div className="mt-4 flex items-center justify-between rounded-3xl bg-white p-4 ring-1 ring-slate-200">
          <span className="font-black">Total</span>
          <span className="text-xl font-black">{money(total)}</span>
        </div>
        <button onClick={send} disabled={!items.length || hasUnavailable} className="primary mt-4 disabled:bg-slate-300 disabled:text-slate-500">{hasUnavailable ? "Remove unavailable item(s)" : "Send order"}</button>
      </div>
    </div>
  );
}

function CartRow({ item, add, remove }: { item: CartItem; add: (id: number) => void; remove: (id: number) => void }) {
  const unavailable = item.available === false;

  return (
    <article className={unavailable ? "flex items-center gap-3 rounded-3xl bg-white p-3 opacity-70 ring-1 ring-red-100" : "flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-slate-200"}>
      <div className="relative h-16 w-16 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
        {unavailable && <div className="absolute inset-0 rounded-2xl bg-slate-950/45" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-black text-slate-950">{item.name}</h3>
          {unavailable && <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700">Unavailable</span>}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <DietaryBadges item={item} />
          <p className="text-xs font-bold text-slate-500">{money(item.price)}</p>
        </div>
        <p className="mt-1 line-clamp-1 text-[11px] font-black text-slate-500">Allergens: {item.allergens.join(", ")}</p>
      </div>
      <div className="flex items-center rounded-full bg-slate-100 p-1">
        <button onClick={() => remove(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black">-</button>
        <span className="min-w-7 text-center text-xs font-black">{item.qty}</span>
        <button onClick={() => add(item.id)} disabled={unavailable} className={unavailable ? "grid h-7 w-7 cursor-not-allowed place-items-center rounded-full bg-slate-200 font-black text-slate-400" : "grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-black text-white"}>+</button>
      </div>
    </article>
  );
}
