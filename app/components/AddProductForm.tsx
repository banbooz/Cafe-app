"use client";

import { useState } from "react";
import { productCategories } from "../lib/menu";
import { blankNewMenuProduct, type NewMenuProduct } from "../lib/menuCatalog";
import { cleanAllergenList } from "../lib/menuSettings";

type Props = {
  onCreate: (product: NewMenuProduct, available: boolean) => number;
};

function cleanPriceInput(value: string) {
  const decimalCleaned = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  const [wholeRaw, decimalRaw] = decimalCleaned.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  return decimalRaw === undefined ? whole : `${whole}.${decimalRaw.slice(0, 2)}`;
}

export default function AddProductForm({ onCreate }: Props) {
  const [product, setProduct] = useState<NewMenuProduct>(() => blankNewMenuProduct());
  const [available, setAvailable] = useState(true);
  const [open, setOpen] = useState(false);
  const canCreate = product.name.trim().length > 1 && product.description.trim().length > 1 && product.price >= 0;

  function update(changes: Partial<NewMenuProduct>) {
    setProduct((current) => ({ ...current, ...changes }));
  }

  function handleImageUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update({ image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function createProduct() {
    if (!canCreate) return;
    onCreate(product, available);
    setProduct(blankNewMenuProduct());
    setAvailable(true);
    setOpen(false);
  }

  return (
    <section className="mt-4 rounded-[1.75rem] bg-slate-50 p-4 ring-1 ring-slate-200">
      <button onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">Add product</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">Create a new menu item</h3>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">New products sync to the customer menu, kitchen and dashboard.</p>
        </div>
        <span className="shrink-0 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">{open ? "Close" : "Add"}</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Product name</span>
              <input value={product.name} onChange={(event) => update({ name: event.target.value })} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" placeholder="e.g. Halloumi Burger" />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Category</span>
              <select value={product.category} onChange={(event) => update({ category: event.target.value })} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200">
                {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Price</span>
              <input type="text" inputMode="decimal" value={String(product.price)} onChange={(event) => { const next = cleanPriceInput(event.target.value); update({ price: Number.parseFloat(next || "0") }); }} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Prep time</span>
              <input value={product.prep} onChange={(event) => update({ prep: event.target.value })} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" placeholder="5 min" />
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Description</span>
            <textarea value={product.description} onChange={(event) => update({ description: event.target.value })} className="mt-2 min-h-20 w-full resize-none rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" placeholder="Short customer-facing description" />
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Allergens</span>
            <input value={product.allergens.join(", ")} onChange={(event) => update({ allergens: cleanAllergenList(event.target.value) })} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" placeholder="Gluten, Milk" />
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Image URL or upload</span>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center ring-1 ring-slate-200" style={{ backgroundImage: `url(${product.image})` }} />
              <div className="grid flex-1 gap-2">
                <input value={product.image} onChange={(event) => update({ image: event.target.value })} className="w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
                <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files?.[0])} className="w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
              </div>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAvailable((current) => !current)} className={available ? "min-h-11 rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-red-700 px-4 py-2 text-xs font-black text-white"}>{available ? "Available" : "Not available"}</button>
            <button onClick={() => update({ popular: !product.popular })} className={product.popular ? "min-h-11 rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200"}>Popular</button>
            <button onClick={() => update({ vegetarian: !product.vegetarian })} className={product.vegetarian ? "min-h-11 rounded-full bg-[#16803a] px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200"}>V</button>
            <button onClick={() => update({ vegan: !product.vegan })} className={product.vegan ? "min-h-11 rounded-full bg-[#16803a] px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200"}>VG</button>
          </div>

          <button onClick={createProduct} disabled={!canCreate} className="min-h-14 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white disabled:bg-slate-300 disabled:text-slate-500">Create product</button>
        </div>
      )}
    </section>
  );
}
