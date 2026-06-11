"use client";

import { money, type MenuItem } from "../lib/menu";
import VegetarianBadge from "./VegetarianBadge";

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
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-3">
      <div className="w-full max-w-[430px] rounded-[2rem] bg-[#f4f1ea] p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Basket</h2>
          <button onClick={close} className="rounded-full bg-white px-4 py-2 text-xs font-black ring-1 ring-slate-200">Close</button>
        </div>

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
        <button onClick={send} disabled={!items.length} className="primary mt-4 disabled:bg-slate-300 disabled:text-slate-500">Send order</button>
      </div>
    </div>
  );
}

function CartRow({ item, add, remove }: { item: CartItem; add: (id: number) => void; remove: (id: number) => void }) {
  return (
    <article className="flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-slate-200">
      <div className="relative h-16 w-16 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
        {item.vegetarian && <VegetarianBadge className="absolute left-1 top-1 h-5 w-5 text-[10px]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-black text-slate-950">{item.name}</h3>
        <p className="text-xs font-bold text-slate-500">{money(item.price)}</p>
        <p className="mt-1 line-clamp-1 text-[11px] font-black text-slate-500">Allergens: {item.allergens.join(", ")}</p>
      </div>
      <div className="flex items-center rounded-full bg-slate-100 p-1">
        <button onClick={() => remove(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black">-</button>
        <span className="min-w-7 text-center text-xs font-black">{item.qty}</span>
        <button onClick={() => add(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-black text-white">+</button>
      </div>
    </article>
  );
}
