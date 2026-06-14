"use client";

import { money, type MenuItem } from "../lib/menu";

type Props = {
  recommendations: MenuItem[];
  add: (id: number) => void;
  close: () => void;
  continueToCheckout: () => void | Promise<void>;
  isSubmitting?: boolean;
};

function shortCategory(category: string) {
  if (category === "Drinks") return "Drink";
  if (category === "Pudding") return "Dessert";
  return category;
}

export default function UpsellSheet({ recommendations, add, close, continueToCheckout, isSubmitting = false }: Props) {
  return (
    <div className="sheet-backdrop-enter fixed inset-0 z-[100] flex items-end justify-center bg-[#111517]/55 p-3 backdrop-blur-sm">
      <div className="sheet-panel-enter w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-[#f7f7f5] p-4 shadow-[0_26px_70px_rgba(29,37,40,0.35)] ring-1 ring-white/80">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />

        <section
          className="overflow-hidden rounded-[1.75rem] bg-[#ff385c] text-white shadow-[0_18px_44px_rgba(255,56,92,0.22)]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, rgba(255,255,255,.16) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,.16) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,.16) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.16) 75%)",
            backgroundSize: "22px 22px",
            backgroundPosition: "0 0, 0 11px, 11px -11px, -11px 0px",
          }}
        >
          <div className="bg-[#ff385c]/88 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/75">Before checkout</p>
                <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight">Would you like anything else with your order?</h2>
              </div>
              <button onClick={close} className="shrink-0 rounded-full bg-white px-4 py-3 text-xs font-black text-[#1d2528] shadow-sm">
                Back
              </button>
            </div>
            <p className="mt-3 text-sm font-bold leading-5 text-white/85">Quick extras picked from available menu items, without repeating what is already in your basket.</p>
          </div>
        </section>

        <div className="mt-4 max-h-[46vh] space-y-3 overflow-y-auto pr-0.5">
          {recommendations.length ? (
            recommendations.map((item, index) => <UpsellCard key={item.id} item={item} index={index} add={add} />)
          ) : (
            <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-black text-[#111517]">No extra recommendations left.</p>
              <p className="mt-1 text-xs font-bold text-[#617174]">Everything suggested is already in your basket or unavailable.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            void continueToCheckout();
          }}
          disabled={isSubmitting}
          className="add-burst mt-4 min-h-16 w-full rounded-full bg-[#ff385c] px-5 text-sm font-black text-white shadow-[0_18px_44px_rgba(255,56,92,0.25)] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        >
          {isSubmitting ? "Checking order..." : "Continue to checkout"}
        </button>
      </div>
    </div>
  );
}

function UpsellCard({ item, index, add }: { item: MenuItem; index: number; add: (id: number) => void }) {
  return (
    <article style={{ animationDelay: `${Math.min(index, 4) * 55}ms` }} className="cart-row-enter grid grid-cols-[74px_1fr] gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-black/5">
      <div className="h-[74px] w-[74px] rounded-[1.25rem] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="rounded-full bg-[#f1f4f4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#5f7f80]">{shortCategory(item.category)}</p>
          <p className="shrink-0 text-sm font-black text-[#111517]">{money(item.price)}</p>
        </div>
        <h3 className="mt-2 truncate text-base font-black text-[#111517]">{item.name}</h3>
        <p className="mt-1 max-h-10 overflow-hidden text-xs font-bold leading-5 text-[#617174]">{item.description}</p>
        <button onClick={() => add(item.id)} className="add-burst mt-3 min-h-10 w-full rounded-full bg-[#263238] px-4 text-xs font-black text-white shadow-sm">
          Add
        </button>
      </div>
    </article>
  );
}
