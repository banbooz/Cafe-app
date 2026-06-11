"use client";

import { menuItems } from "../lib/menu";
import { isItemAvailable, useMenuAvailability } from "../lib/availability";
import { Phone } from "./AppShell";

type Props = {
  section: "Kitchen" | "Business";
};

export default function StaffAvailabilityApp({ section }: Props) {
  const { availability, setItemAvailability, resetAvailability } = useMenuAvailability();
  const availableCount = menuItems.filter((item) => isItemAvailable(item.id, availability)).length;
  const otherSection = section === "Kitchen" ? "Business" : "Kitchen";
  const otherHref = section === "Kitchen" ? "/business" : "/kitchen";

  return (
    <Phone>
      <main className="px-4 pb-10 pt-4">
        <header className="rounded-[2rem] bg-slate-900 p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">{section} app</p>
          <h1 className="mt-2 text-2xl font-black">Menu availability</h1>
          <p className="mt-2 text-sm font-bold text-white/70">Toggle food and drinks on or off. Customer ordering updates from the same availability list.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
            <a href="/" className="rounded-2xl bg-white/10 px-3 py-3 text-white">Customer</a>
            <a href={otherHref} className="rounded-2xl bg-white/10 px-3 py-3 text-white">{otherSection}</a>
            <button onClick={resetAvailability} className="rounded-2xl bg-white/10 px-3 py-3 text-white">Reset</button>
          </div>
        </header>

        <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Live menu</p>
              <h2 className="text-lg font-black text-slate-950">{availableCount}/{menuItems.length} available</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase text-emerald-700">Synced</span>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {menuItems.map((item) => {
            const available = isItemAvailable(item.id, availability);
            return (
              <article key={item.id} className="flex gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <div className="h-20 w-20 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-600">{item.category}</p>
                      <h3 className="truncate font-black text-slate-950">{item.name}</h3>
                    </div>
                    <span className={available ? "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700" : "shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700"}>{available ? "On" : "Off"}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{item.description}</p>
                  <button
                    onClick={() => setItemAvailability(item.id, !available)}
                    aria-pressed={available}
                    className={available ? "mt-3 flex h-11 w-full items-center justify-between rounded-2xl bg-emerald-700 px-4 text-sm font-black text-white" : "mt-3 flex h-11 w-full items-center justify-between rounded-2xl bg-red-700 px-4 text-sm font-black text-white"}
                  >
                    <span>{available ? "Available" : "Not available"}</span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs">Tap to toggle</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </Phone>
  );
}
