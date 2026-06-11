export default function VegetarianBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`grid h-6 w-6 place-items-center rounded-full bg-emerald-700 text-[12px] font-black leading-none text-white shadow-sm ${className}`}
    >
      V
    </span>
  );
}
