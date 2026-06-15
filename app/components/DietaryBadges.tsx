import type { MenuItem } from "../lib/menu";

type BadgeItem = Pick<MenuItem, "vegetarian" | "vegan"> & { allergens?: string[] };

export default function DietaryBadges({ item, className = "" }: { item: BadgeItem; className?: string }) {
  const allergens = (item.allergens || []).filter((entry) => entry && entry.toLowerCase() !== "none listed").slice(0, 2);
  if (!item.vegetarian && !item.vegan && allergens.length === 0) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {item.vegetarian && <Badge label="V" title="Vegetarian" tone="green" />}
      {item.vegan && <Badge label="VG" title="Vegan" tone="green" />}
      {allergens.map((allergen) => <Badge key={allergen} label={allergen} title={`Contains ${allergen}`} tone="amber" />)}
    </span>
  );
}

function Badge({ label, title, tone }: { label: string; title: string; tone: "green" | "amber" }) {
  const style = tone === "green" ? "bg-[#16803a] text-white" : "bg-amber-100 text-amber-900 ring-1 ring-amber-200";

  return (
    <span
      aria-label={title}
      title={title}
      className={`inline-grid min-h-6 place-items-center rounded-full px-2 text-[10px] font-black leading-none shadow-sm ${style}`}
    >
      {label}
    </span>
  );
}
