import type { MenuItem } from "../lib/menu";

export default function DietaryBadges({ item, className = "" }: { item: Pick<MenuItem, "vegetarian" | "vegan">; className?: string }) {
  if (!item.vegetarian && !item.vegan) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {item.vegetarian && <Badge label="V" title="Vegetarian" />}
      {item.vegan && <Badge label="VG" title="Vegan" />}
    </span>
  );
}

function Badge({ label, title }: { label: string; title: string }) {
  return (
    <span
      aria-label={title}
      title={title}
      className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-[#16803a] px-1.5 text-[10px] font-black leading-none text-white shadow-sm"
    >
      {label}
    </span>
  );
}
