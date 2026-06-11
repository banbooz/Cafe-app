"use client";

import { money, type MenuItem } from "../lib/menu";

type CartItem = MenuItem & { qty: number };

export default function CartSheet({ items, total, close, add, remove, send }: { items: CartItem[]; total: number; close: () => void; add: (id: number) => void; remove: (id: number) => void; send: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-3">
      <div className="w-full max-w-[430px] rounded-[2rem] bg-[#f4f1ea] p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Basket</h2>
          <button onClick={close} className="rounded-full bg-white px-4 py-2 text-xs font-black ring-1 ring-slate-200">Close</button>
        </div>
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {items.length ? items.map((item) => <CartRow key={item.id} item={item} add={add} remove={remove} />) : <p className="rounded-3xl bg-white p-6 text-center text-sm font-bold text-slate-500">Basket is empty</p>}
        </div>
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
      <div className="h-16 w-16 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-black text-slate-950">{item.name}</h3>
        <p className="text-xs font-bold text-slate-500">{money(item.price)}</p>
      </div>
      <div className="flex items-center rounded-full bg-slate-100 p-1">
        <button onClick={() => remove(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black">-</button>
        <span className="min-w-7 text-center text-xs font-black">{item.qty}</span>
        <button onClick={() => add(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-black text-white">+</button>
      </div>
    </article>
  );
}
