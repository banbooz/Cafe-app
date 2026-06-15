"use client";

import { useState } from "react";
import { setDoc } from "firebase/firestore";
import AddProductForm from "./AddProductForm";
import DietaryBadges from "./DietaryBadges";
import { itemMatchesExperience, menuCategoriesForExperience, menuExperiences, menuItemsForExperience, money, staffRoute, type MenuExperienceId, type MenuItem } from "../lib/menu";
import { isItemAvailable, useMenuAvailability } from "../lib/availability";
import { applyMenuSettings, cleanAllergenList, useMenuSettings } from "../lib/menuSettings";
import { useMenuCatalogue, type NewMenuProduct } from "../lib/menuCatalog";
import { cafeConfig, getCafeStorageKey } from "../lib/cafeConfig";
import { ensureFirebaseSignedIn, getFirebaseStateDoc } from "../lib/firebase";

type Props = { section: "Kitchen" | "Business"; compact?: boolean; experienceMode?: MenuExperienceId };
type MenuView = "active" | "inactive";
const editTabs = ["info", "image", "dietary", "description", "off"] as const;
type EditTab = (typeof editTabs)[number];
type StaffItem = ReturnType<typeof useMenuCatalogue>["visibleItems"][number];

const inactiveStorageKey = getCafeStorageKey("cafeHiddenMenuItems");

const editTabLabels: Record<EditTab, string> = {
  info: "Info",
  image: "Pic",
  dietary: "Diet",
  description: "Desc",
  off: "Bin",
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

function saveInactiveIds(ids: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(inactiveStorageKey, JSON.stringify(ids));
  window.dispatchEvent(new StorageEvent("storage", { key: inactiveStorageKey }));
}

async function syncInactiveIds(ids: number[], staffItems: MenuItem[]) {
  const stateDoc = getFirebaseStateDoc();
  if (!stateDoc) return;
  const signedIn = await ensureFirebaseSignedIn();
  if (!signedIn) return;
  try {
    await setDoc(stateDoc, { cafeId: cafeConfig.id, staffMenuItems: staffItems, hiddenMenuItemIds: ids, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.warn("Could not sync inactive items. Local storage still works.", error);
  }
}

export default function StaffMenuControls({ section, compact = false, experienceMode = "restaurant" }: Props) {
  const { availability, setItemAvailability, resetAvailability } = useMenuAvailability();
  const { settings, updateItemSettings, resetMenuSettings } = useMenuSettings();
  const catalogue = useMenuCatalogue(settings, experienceMode);
  const { staffItems, hiddenIds, visibleItems, addStaffProduct, hideStaffProduct } = catalogue;
  const experience = menuExperiences[experienceMode];
  const categoryOptions = menuCategoriesForExperience(experienceMode);
  const inactiveSet = new Set(hiddenIds);
  const inactiveItems = [...menuItemsForExperience(experienceMode), ...staffItems.filter((item) => itemMatchesExperience(item, experienceMode))]
    .filter((item) => inactiveSet.has(item.id))
    .map((item) => applyMenuSettings(item, settings));
  const [open, setOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>("active");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<EditTab>("info");
  const availableCount = visibleItems.filter((item) => isItemAvailable(item.id, availability)).length;
  const otherHref = staffRoute(section === "Kitchen" ? "business" : "kitchen", experienceMode);
  const otherLabel = section === "Kitchen" ? "Business app" : "Kitchen app";

  function handleImageUpload(id: number, file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateItemSettings(id, { image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function handleCreateProduct(product: NewMenuProduct, available: boolean) {
    const id = addStaffProduct({ ...product, experienceMode });
    setItemAvailability(id, available);
    setOpen(true);
    setMenuView("active");
    setEditingId(id);
    setActiveEditTab("info");
    return id;
  }

  function toggleEditing(id: number, isEditing: boolean) {
    setEditingId(isEditing ? null : id);
    if (!isEditing) setActiveEditTab("info");
  }

  function setItemInactive(id: number, name: string) {
    const confirmed = window.confirm(`${name} will move to Inactive Items for ${experience.label}. It will leave this live customer menu, while old orders and analytics keep their history. You can add it back later.`);
    if (!confirmed) return;
    hideStaffProduct(id);
    setItemAvailability(id, false);
    setEditingId(null);
    setActiveEditTab("info");
  }

  function setItemActive(id: number) {
    const nextInactiveIds = hiddenIds.filter((entry) => entry !== id);
    saveInactiveIds(nextInactiveIds);
    void syncInactiveIds(nextInactiveIds, staffItems);
    setItemAvailability(id, true);
    setMenuView("active");
  }

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button onClick={() => setOpen((current) => !current)} className="flex flex-1 items-start justify-between gap-4 text-left">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">{experience.label} controls</p>
            <h2 className="mt-1 text-xl font-black">Menu item toggles</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">Add, edit and manage active or inactive products for this model only. Changes sync across its customer, kitchen and business views.</p>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">{open ? "Hide" : "Show"} menu</span>
        </button>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={otherHref} className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">{otherLabel}</a>
          <button onClick={resetAvailability} className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black text-white">Reset availability</button>
          <button onClick={resetMenuSettings} className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700">Reset text</button>
        </div>
      </div>

      <AddProductForm onCreate={handleCreateProduct} categories={categoryOptions} experienceMode={experienceMode} />

      <button onClick={() => setOpen((current) => !current)} className="mt-4 flex w-full items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-200">
        <span className="min-w-0 font-black">Available now</span>
        <span className="flex shrink-0 items-center gap-3"><span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase text-emerald-700">{availableCount}/{visibleItems.length}</span><span className="text-sm font-black text-slate-500">{open ? "▲" : "▼"}</span></span>
      </button>

      {open && <div className="mt-4"><div className="grid gap-2 rounded-3xl bg-slate-100 p-2 sm:grid-cols-2"><button type="button" onClick={() => setMenuView("active")} className={menuView === "active" ? "min-h-11 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white" : "min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600"}>Edit Items</button><button type="button" onClick={() => { setMenuView("inactive"); setEditingId(null); }} className={menuView === "inactive" ? "min-h-11 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white" : "min-h-11 rounded-2xl px-4 text-sm font-black text-slate-600"}>Inactive Items ({inactiveItems.length})</button></div>{menuView === "active" ? <div className={compact ? "mt-4 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3"}>{visibleItems.map((item) => <StaffItemCard key={item.id} item={item} categoryOptions={categoryOptions} available={isItemAvailable(item.id, availability)} editing={editingId === item.id} activeTab={activeEditTab} setActiveTab={setActiveEditTab} setItemAvailability={setItemAvailability} updateItemSettings={updateItemSettings} toggleEditing={toggleEditing} handleImageUpload={handleImageUpload} setItemInactive={setItemInactive} />)}</div> : <InactiveItemsView items={inactiveItems} setItemActive={setItemActive} />}</div>}
    </section>
  );
}

type StaffItemCardProps = {
  item: StaffItem;
  categoryOptions: readonly string[];
  available: boolean;
  editing: boolean;
  activeTab: EditTab;
  setActiveTab: (tab: EditTab) => void;
  setItemAvailability: (id: number, available: boolean) => void;
  updateItemSettings: ReturnType<typeof useMenuSettings>["updateItemSettings"];
  toggleEditing: (id: number, isEditing: boolean) => void;
  handleImageUpload: (id: number, file?: File) => void;
  setItemInactive: (id: number, name: string) => void;
};

function StaffItemCard({ item, categoryOptions, available, editing, activeTab, setActiveTab, setItemAvailability, updateItemSettings, toggleEditing, handleImageUpload, setItemInactive }: StaffItemCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0"><p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-orange-600">{item.category}</p><h3 className="truncate font-black text-slate-950">{item.name}</h3></div>
            <div className="flex shrink-0 items-center gap-2"><span className={available ? "rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700" : "rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700"}>{available ? "On" : "Off"}</span><button onClick={() => setItemInactive(item.id, item.name)} aria-label={`Move ${item.name} to inactive items`} className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-xs font-black text-red-800 ring-1 ring-red-100">Bin</button></div>
          </div>
          <div className="mt-2 flex min-w-0 items-center gap-2"><DietaryBadges item={item} /><span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-200">{money(item.price)}</span><p className="min-w-0 truncate text-xs font-bold text-slate-500">{item.description}</p></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => setItemAvailability(item.id, !available)} aria-pressed={available} className={available ? "flex min-h-10 min-w-0 items-center justify-center rounded-2xl bg-emerald-700 px-2 text-center text-xs font-black leading-tight text-white" : "flex min-h-10 min-w-0 items-center justify-center rounded-2xl bg-red-700 px-2 text-center text-xs font-black leading-tight text-white"}>{available ? "Available" : "Unavailable"}</button><button onClick={() => toggleEditing(item.id, editing)} className="flex min-h-10 min-w-0 items-center justify-center rounded-2xl bg-white px-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">{editing ? "Close" : "Edit"}</button></div>
        </div>
      </div>
      {editing && <ProductEditPanel item={item} categoryOptions={categoryOptions} activeTab={activeTab} setActiveTab={setActiveTab} updateItemSettings={updateItemSettings} handleImageUpload={handleImageUpload} setItemInactive={setItemInactive} />}
    </article>
  );
}

function ProductEditPanel({ item, categoryOptions, activeTab, setActiveTab, updateItemSettings, handleImageUpload, setItemInactive }: Pick<StaffItemCardProps, "item" | "categoryOptions" | "activeTab" | "setActiveTab" | "updateItemSettings" | "handleImageUpload" | "setItemInactive">) {
  return (
    <div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{editTabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} title={tab[0].toUpperCase() + tab.slice(1)} className={tab === "off" ? activeTab === tab ? "flex min-h-10 min-w-0 items-center justify-center rounded-xl bg-red-800 px-2 text-center text-[10px] font-black leading-tight text-white" : "flex min-h-10 min-w-0 items-center justify-center rounded-xl bg-red-50 px-2 text-center text-[10px] font-black leading-tight text-red-800 ring-1 ring-red-100" : activeTab === tab ? "flex min-h-10 min-w-0 items-center justify-center rounded-xl bg-slate-900 px-2 text-center text-[10px] font-black leading-tight text-white" : "flex min-h-10 min-w-0 items-center justify-center rounded-xl bg-slate-100 px-2 text-center text-[10px] font-black leading-tight text-slate-600"}><span className="block max-w-full truncate">{editTabLabels[tab]}</span></button>)}</div>
      {activeTab === "info" && <div className="mt-3 space-y-3"><label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Product name</span><input value={item.name} onChange={(event) => updateItemSettings(item.id, { name: event.target.value })} className="mt-2 w-full min-w-0 rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" /></label><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><label className="block min-w-0"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Category</span><select value={item.category} onChange={(event) => updateItemSettings(item.id, { category: event.target.value })} className="mt-2 w-full min-w-0 rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200">{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="block min-w-0"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Prep</span><input value={item.prep} onChange={(event) => updateItemSettings(item.id, { prep: event.target.value })} className="mt-2 w-full min-w-0 rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" /></label></div><label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Price</span><input type="text" inputMode="decimal" value={priceInputValue(item.price)} onChange={(event) => { const next = cleanPriceInput(event.target.value); updateItemSettings(item.id, { price: Number.parseFloat(next || "0") }); }} className="mt-2 w-full min-w-0 rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" /></label><button onClick={() => updateItemSettings(item.id, { popular: !item.popular })} className={item.popular ? "min-h-11 rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600"}>Popular</button></div>}
      {activeTab === "image" && <label className="mt-3 block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Upload/change picture</span><div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center ring-1 ring-slate-200" style={{ backgroundImage: `url(${item.image})` }} /><input type="file" accept="image/*" onChange={(event) => handleImageUpload(item.id, event.target.files?.[0])} className="w-full min-w-0 rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" /></div></label>}
      {activeTab === "dietary" && <div className="mt-3 space-y-3"><div className="flex flex-wrap gap-2"><button onClick={() => updateItemSettings(item.id, { vegetarian: !item.vegetarian })} className={item.vegetarian ? "min-h-11 rounded-full bg-[#16803a] px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600"}>V</button><button onClick={() => updateItemSettings(item.id, { vegan: !item.vegan })} className={item.vegan ? "min-h-11 rounded-full bg-[#16803a] px-4 py-2 text-xs font-black text-white" : "min-h-11 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600"}>VG</button></div><label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Allergens</span><input value={item.allergens.join(", ")} onChange={(event) => updateItemSettings(item.id, { allergens: cleanAllergenList(event.target.value) })} className="mt-2 w-full min-w-0 rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" /></label></div>}
      {activeTab === "description" && <label className="mt-3 block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Description</span><textarea value={item.description} onChange={(event) => updateItemSettings(item.id, { description: event.target.value })} className="mt-2 min-h-20 w-full min-w-0 resize-none rounded-xl bg-slate-50 p-3 text-xs font-bold outline-none ring-1 ring-slate-200" /></label>}
      {activeTab === "off" && <div className="mt-3 rounded-2xl bg-red-50 p-3 ring-1 ring-red-100"><p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">Move to inactive</p><p className="mt-2 text-xs font-bold leading-5 text-red-700">This item leaves the live menu. Old orders keep the item name and it can be added back later.</p><button onClick={() => setItemInactive(item.id, item.name)} className="mt-3 min-h-11 w-full rounded-2xl bg-red-700 px-4 text-xs font-black text-white">Move to Inactive Items</button></div>}
    </div>
  );
}

function InactiveItemsView({ items, setItemActive }: { items: MenuItem[]; setItemActive: (id: number) => void }) {
  if (!items.length) return <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><h3 className="font-black text-slate-950">No inactive items</h3><p className="mt-2 text-sm font-bold leading-6 text-slate-500">Items moved out of the live menu will appear here.</p></div>;
  return <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.id} className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="flex gap-3"><div className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{item.category}</p><h3 className="truncate font-black text-slate-950">{item.name}</h3><p className="mt-1 truncate text-xs font-bold text-slate-500">{money(item.price)} · {item.prep}</p></div></div><button onClick={() => setItemActive(item.id)} className="mt-3 min-h-11 w-full rounded-2xl bg-emerald-700 px-4 text-xs font-black text-white">Add Back to Menu</button></article>)}</div>;
}
