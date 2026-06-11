"use client";

import { menuItems } from "../lib/menu";
import { isItemAvailable, useMenuAvailability } from "../lib/availability";

type Props = {
  section: "Kitchen" | "Business";
  compact?: boolean;
};

export default function AvailabilityControls({ section, compact = false }: Props) {
  const { availability, setItemAvailability, resetAvailability } = useMenuAvailability();
  const availableCount = menuItems.filter((item) => isItemAvailable(item.id, availability)).length;
  const otherHref = section === "Kitchen" ? "/business" : "/kitchen";
  const otherLabel = section === "Kitchen" ? "Business app" : "Kitchen app";

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Live availability</p>
          <h2 className="mt-1 text-xl font-black">Menu item toggles</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{section} can turn individual food and drink items on/off. Customer checkout blocks unavailable items.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href={otherHref} className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">{otherLabel}</a>
          <button onClick={resetAvailability} className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black text-white">Reset all</button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <span className="font-black">Available now</span>
        <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase text-emerald-700">{availableCount}/{menuItems.length}</span>
      </div>

      <div className={compact ? "mt-4 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3"}>
        {menuItems.map((item) => {
          const available = isItemAvailable(item.id, availability);
          return (
            <article key={item.id} className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-600">{item.category}</p>
                      <h3 className="truncate font-black text-slate-950">{item.name}</h3>
                    </div>
                    <span className={available ? "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700" : "shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700"}>{available ? "On" : "Off"}</span>
                  </div>
                  <button
                    onClick={() => setItemAvailability(item.id, !available)}
                    aria-pressed={available}
                    className={available ? "mt-3 flex h-10 w-full items-center justify-between rounded-2xl bg-emerald-700 px-4 text-xs font-black text-white" : "mt-3 flex h-10 w-full items-center justify-between rounded-2xl bg-red-700 px-4 text-xs font-black text-white"}
                  >
                    <span>{available ? "Available" : "Not available"}</span>
                    <span>Toggle</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
