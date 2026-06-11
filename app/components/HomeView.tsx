"use client";

import { categoryIcons, categories, menuItems, money, type MenuItem } from "../lib/menu";

type Props = {
  category: string;
  setCategory: (category: string) => void;
  query: string;
  setQuery: (query: string) => void;
  filtered: MenuItem[];
  cart: Record<number, number>;
  count: number;
  total: number;
  add: (id: number) => void;
  remove: (id: number) => void;
  openItem: (item: MenuItem) => void;
  openCart: () => void;
};

export default function HomeView(props: Props) {
  const popular = menuItems.filter((item) => item.popular);

  return (
    <>
      <main className="px-4 pb-32 pt-4">
        <header className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <button className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-sm font-black">Menu</button>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">Table 3</p>
              <h1 className="text-base font-black text-slate-950">The Corner Cafe</h1>
            </div>
            <button onClick={props.openCart} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-sm font-black text-white">{props.count}</button>
          </div>
          <label className="mt-4 flex h-12 items-center rounded-2xl bg-slate-100 px-4">
            <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search menu" />
          </label>
        </header>

        {!props.query && props.category === "All" && (
          <section className="mt-4 overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-sm">
            <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${popular[0].image})` }} />
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Popular today</p>
              <h2 className="mt-1 text-2xl font-black">Fresh food & coffee</h2>
              <p className="mt-2 text-sm font-semibold text-white/70">Order from your table when ready.</p>
            </div>
          </section>
        )}

        <section className="mt-5">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((entry) => (
              <button key={entry} onClick={() => props.setCategory(entry)} className={props.category === entry ? "min-w-[78px] rounded-[1.4rem] bg-slate-900 px-3 py-3 text-white" : "min-w-[78px] rounded-[1.4rem] bg-white px-3 py-3 text-slate-700 ring-1 ring-slate-200"}>
                <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-950">{categoryIcons[entry]}</span>
                <span className="mt-2 block text-xs font-black">{entry}</span>
              </button>
            ))}
          </div>
        </section>

        {!props.query && props.category === "All" && (
          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">Order again</h2>
              <span className="text-sm font-black text-orange-600">Popular</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {popular.map((item) => (
                <button key={item.id} onClick={() => props.openItem(item)} className="w-44 shrink-0 rounded-3xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200">
                  <div className="h-24 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                  <h3 className="mt-3 line-clamp-1 font-black text-slate-950">{item.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-black">{money(item.price)}</span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white">+</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5">
          <div className="mb-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Menu</p>
            <h2 className="text-xl font-black text-slate-950">{props.category === "All" ? "All items" : props.category}</h2>
          </div>
          <div className="space-y-3">
            {props.filtered.map((item) => (
              <article key={item.id} className="flex gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <button onClick={() => props.openItem(item)} className="h-24 w-24 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="min-w-0 flex-1">
                  <button onClick={() => props.openItem(item)} className="w-full text-left">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-600">{item.category}</p>
                    <h3 className="mt-1 line-clamp-1 font-black text-slate-950">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500">{item.description}</p>
                  </button>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-black">{money(item.price)}</span>
                    {props.cart[item.id] ? <Stepper qty={props.cart[item.id]} minus={() => props.remove(item.id)} plus={() => props.add(item.id)} /> : <button onClick={() => props.add(item.id)} className="add">+</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Bottom count={props.count} total={props.total} open={props.openCart} />
    </>
  );
}

export function Stepper({ qty, minus, plus }: { qty: number; minus: () => void; plus: () => void }) {
  return <div className="flex items-center rounded-full bg-slate-100 p-1"><button onClick={minus} className="grid h-7 w-7 place-items-center rounded-full bg-white font-black">-</button><span className="min-w-7 text-center text-xs font-black">{qty}</span><button onClick={plus} className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-black text-white">+</button></div>;
}

function Bottom({ count, total, open }: { count: number; total: number; open: () => void }) {
  return <section className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-[#f4f1ea]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]"><button onClick={open} className="flex min-h-16 w-full items-center justify-between rounded-2xl bg-slate-900 px-4 text-left text-white"><span><span className="block text-sm font-black">{count ? `${count} items` : "Table 3"}</span><span className="block text-xs font-semibold text-white/65">{count ? "Ready for checkout" : "Add items to start"}</span></span><span className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black">{count ? money(total) : "Basket"}</span></button></section>;
}
