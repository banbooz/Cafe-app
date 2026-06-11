export default function VegetarianBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`grid h-6 w-6 place-items-center rounded-[6px] border-2 border-emerald-700 bg-white/90 shadow-sm ${className}`}
    >
      <span className="h-3 w-3 rounded-full bg-emerald-700" />
    </span>
  );
}
