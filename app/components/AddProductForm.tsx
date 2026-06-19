"use client";

import { useState } from "react";
import { money, type MenuExperienceId } from "../lib/menu";
import { blankNewMenuProduct, type NewMenuProduct } from "../lib/menuCatalog";
import { cleanAllergenList } from "../lib/menuSettings";

type Props = {
  onCreate: (product: NewMenuProduct, available: boolean) => number;
  categories: readonly string[];
  experienceMode: MenuExperienceId;
};

const staffPrimaryButton = "bg-slate-900 text-white";
const staffSecondaryButton = "bg-white text-slate-600 ring-1 ring-slate-200";

function cleanPriceInput(value: string) {
  const decimalCleaned = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  const [wholeRaw, decimalRaw] = decimalCleaned.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "";
  return decimalRaw === undefined ? whole : `${whole || "0"}.${decimalRaw.slice(0, 2)}`;
}

function priceFromInput(value: string) {
  const cleaned = cleanPriceInput(value);
  if (!cleaned) return 0;
  const number = Number.parseFloat(cleaned);
  if (!Number.isFinite(number)) return 0;

  const looksLikePence = !cleaned.includes(".") && number >= 100;
  return Number((looksLikePence ? number / 100 : number).toFixed(2));
}

function formattedPriceInput(value: string) {
  return priceFromInput(value).toFixed(2);
}

export default function AddProductForm({ onCreate, categories, experienceMode }: Props) {
  const defaultCategory = categories[0] || "Main";
  const [product, setProduct] = useState<NewMenuProduct>(() => blankNewMenuProduct(experienceMode, defaultCategory));
  const [priceDraft, setPriceDraft] = useState("");
  const [allergenDraft, setAllergenDraft] = useState("");
  const [available, setAvailable] = useState(true);
  const [open, setOpen] = useState(false);
  const customerPrice = priceFromInput(priceDraft);
  const canCreate = product.name.trim().length > 1 && product.description.trim().length > 1 && customerPrice >= 0;

  function update(changes: Partial<NewMenuProduct>) {
    setProduct((current) => ({ ...current, ...changes, experienceMode }));
  }

  function resetDraftForm() {
    setProduct(blankNewMenuProduct(experienceMode, defaultCategory));
    setPriceDraft("");
    setAllergenDraft("");
    setAvailable(true);
  }

  function toggleOpen() {
    setOpen((current) => {
      if (current) resetDraftForm();
      return !current;
    });
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
    onCreate({ ...product, experienceMode, price: customerPrice, allergens: cleanAllergenList(allergenDraft) }, available);
    resetDraftForm();
    setOpen(false);
  }

  return (
    <section className="mt-4 rounded-[1.75rem] bg-slate-50 p-4 ring-1 ring-slate-200">
      <button onClick={toggleOpen} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">Add product</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">Create a new {experienceMode} menu item</h3>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">New products sync to this model’s customer menu, kitchen and dashboard.</p>
        </div>
        <span className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black ${staffSecondaryButton}`}>{open ? "Close" : "Add"}</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Product name</span>
              <input value={product.name} onChange={(event) => update({ name: event.target.value })} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" placeholder={experienceMode === "drinks" ? "e.g. House Lager" : experienceMode === "cafe" ? "e.g. Iced Oat Latte" : "e.g. Halloumi Burger"} />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Category</span>
              <select value={product.category} onChange={(event) => update({ category: event.target.value })} className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200">
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Price (£)</span>
              <input
                type="text"
                inputMode="decimal"
                value={priceDraft}
                onChange={(event) => setPriceDraft(cleanPriceInput(event.target.value))}
                onBlur={() => setPriceDraft((current) => current ? formattedPriceInput(current) : "")}
                className="mt-2 w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200"
                placeholder="7.99"
              />
              <div className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">Customer price: {money(customerPrice)}</div>
              <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">Example: type 7.99 for £7.99. If you type 799, it formats as £7.99.</p>
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
            <textarea
              value={allergenDraft}
              onChange={(event) => setAllergenDraft(event.target.value)}
              onBlur={() => setAllergenDraft((current) => cleanAllergenList(current).join(", "))}
              className="mt-2 min-h-20 w-full resize-none rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200"
              placeholder="Type allergens separated by commas, e.g. Gluten, Milk, Nuts"
            />
            <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">Use commas to separate allergens. Leave blank for “None listed”.</p>
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Image URL or upload</span>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center ring-1 ring-slate-200" style={{ backgroundImage: `url(${product.image})` }} />
              <div className="grid flex-1 gap-2">
                <input value={product.image} onChange={(event) => update({ image: event.target.value })} className="w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" placeholder="Paste image URL" />
                <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files?.[0])} className="w-full rounded-xl bg-white p-3 text-xs font-bold outline-none ring-1 ring-slate-200" />
              </div>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAvailable((current) => !current)} className={available ? `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffPrimaryButton}` : `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffSecondaryButton}`}>{available ? "Available" : "Not available"}</button>
            <button onClick={() => update({ popular: !product.popular })} className={product.popular ? `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffPrimaryButton}` : `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffSecondaryButton}`}>Popular</button>
            <button onClick={() => update({ vegetarian: !product.vegetarian })} className={product.vegetarian ? `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffPrimaryButton}` : `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffSecondaryButton}`}>V</button>
            <button onClick={() => update({ vegan: !product.vegan })} className={product.vegan ? `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffPrimaryButton}` : `min-h-11 rounded-full px-4 py-2 text-xs font-black ${staffSecondaryButton}`}>VG</button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button onClick={createProduct} disabled={!canCreate} className={`min-h-14 rounded-2xl px-5 text-sm font-black disabled:bg-slate-300 disabled:text-slate-500 ${staffPrimaryButton}`}>Create product</button>
            <button onClick={() => { resetDraftForm(); setOpen(false); }} className={`min-h-14 rounded-2xl px-5 text-sm font-black ${staffSecondaryButton}`}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
