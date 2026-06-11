export default function VegetarianBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`grid h-6 w-6 place-items-center rounded-full border-2 border-emerald-800 bg-white shadow-sm ${className}`}
    >
      <span className="text-[8px] font-black leading-none text-emerald-800">Veg</span>
    </span>
  );
}
