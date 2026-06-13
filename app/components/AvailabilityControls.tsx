"use client";

import { useMemo, useState } from "react";
import { menuItems, money } from "../lib/menu";
import { isItemAvailable, useMenuAvailability } from "../lib/availability";
import { applyMenuSettings, cleanAllergenList, useMenuSettings } from "../lib/menuSettings";
import DietaryBadges from "./DietaryBadges";

type Props = {
  section: "Kitchen" | "Business";
  compact?: boolean;
};

function cleanPriceInput(value: string) {
  const decimalCleaned = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  const [wholeRaw, decimalRaw] = decimalCleaned.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  return decimalRaw === undefined ? whole : `${whole}.${decimalRaw.slice(0, 2)}`;
}

function priceInputValue(value: number) {
  return String(value).replace(/^0+(?=\d)/, "");
}

export default function AvailabilityControls({ section, compact = false }: Props) {
  const { availability, setItemAvailability, resetAvailability } = useMenuAvailability();
  const { settings, updateItemSettings, resetMenuSettings } = useMenuSettings();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const visibleItems = useMemo(() => menuItems.map((item) => applyMenuSettings(item, settings)), [settings]);
  const availableCount = visibleItems.filter((item) => isItemAvailable(item.id, availability)).length;
  const otherHref = section === "Kitchen" ? "/business" : "/kitchen";
  const otherLabel = section === "Kitchen" ? "Business app" : "Kitchen app";

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button onClick={() => setOpen((current) => !current)} className="flex flex-1 items-start justify-between gap-4 text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Live menu controls</p>
            <h2 className="mt-1 text-xl font-black">Menu item toggles</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">Edit availability, descriptions, prices and V/VG badges. Changes update across the app.</p>
          </div>
          <span className="shrink-0 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">{open ? "Hide" : "Show"} menu</span>
        </button>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={otherHref} className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">{otherLabel}</a>
          <button onClick={resetAvailability} className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black text-white">Reset availability</button>
          <button onClick={resetMenuSettings} className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">Reset text</button>
        </div>
      </div>

      <button onClick={() => setOpen((current) => !current)} className="mt-4 flex w-full items-center justify-between rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
        <span className="font-black">Available now</span>
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase text-emerald-700">{availableCount}/{visibleItems.length}</span>
          <span className="text-sm font-black text-slate-500">{open ? "▲" : "▼"}</span>
        </span>
      </button>

      {open && (
        <div className={compact ? "mt-4 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3"}>
          {visibleItems.map((item) => {
            const available = isItemAvailable(item.id, availability);
            const editing = editingId === item.id;
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
                    <div className="mt-2 flex items-center gap-2">
                      <DietaryBadges item={item} />
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-200">{money(item.price)}</span>
                      <p className="line-clamp-1 text-xs font-bold text-slate-500">{item.description}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setItemAvailability(item.id, !available)}
                        aria-pressed={available}
                        className={available ? "flex h-10 items-center justify-center rounded-2xl bg-emerald-700 px-3 text-xs font-black text-white" : "flex h-10 items-center justify-center rounded-2xl bg-red-700 px-3 text-xs font-black text-white"}
                      >
                        {available ? "Available" : "Not available"}
                      </button>
                      <button onClick={() => setEditingId(editing ? null : item.id)} className="flex h-10 items-center justify-center rounded-2xl bg-white px-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                        {editing ? "Close" : "Edit"}
                      </button>
                    </div>

                    {editing && (
                      <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateItemSettings(item.id, { vegetarian: !item.vegetarian })} className={item.vegetarian ? "rounded-full bg-[#16803a] px-3 py-2 text-xs font-black text-white" : "rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"}>V</button>
                          <button onClick={() => updateItemSettings(item.id, { vegan: !item.vegan })} className={item.vegan ? "rounded-full bg-[#16803a] px-3 py-2 text-xs font-black text-white" : "rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"}>VG</button>
                        </div>
                        <label className="mt-3 block">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Price</span>
                          <input type="text" inputMode="decimal" value={priceInputValue(item.price)} onChange={(event) => { const next = cleanPriceInput(event.target.value); updateItemSettings(item.id, { price: Number.parseFloat(next || "0") }); }} className="mt-2 w-full rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
                        </label>
                        <label className="mt-3 block">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Description</span>
                          <textarea value={item.description} onChange={(event) => updateItemSettings(item.id, { description: event.target.value })} className="mt-2 min-h-20 w-full resize-none rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
                        </label>
                        <label className="mt-3 block">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Allergens</span>
                          <input value={item.allergens.join(", ")} onChange={(event) => updateItemSettings(item.id, { allergens: cleanAllergenList(event.target.value) })} className="mt-2 w-full rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
