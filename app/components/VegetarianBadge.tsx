export default function VegetarianBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`grid h-6 w-6 place-items-center ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none">
        <path d="M20 12a8.5 8.5 0 1 1-2.4-5.9" stroke="#2f6b55" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.7 12.2l3 3.2 7.1-7.1" stroke="#2f6b55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.1 5.1c2.8.2 4.8 1.4 6 3.7-2.2.6-4.2.2-5.9-1.1-.2 1.8-.9 3.4-2.2 4.7.1-2.9 0-5.1 2.1-7.3Z" fill="#7bc99a" stroke="#2f6b55" strokeWidth="1" strokeLinejoin="round" />
        <path d="M12 10.9c1.8-1.4 3.4-2.5 5-3.3" stroke="#2f6b55" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
  );
}
