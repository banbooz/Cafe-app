export default function VegetarianBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`grid h-7 w-7 place-items-center ${className}`}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-sm" aria-hidden="true" fill="none">
        <path
          d="M49.7 10.7A24 24 0 1 0 58 32"
          stroke="#75c993"
          strokeWidth="5.4"
          strokeLinecap="round"
        />
        <path
          d="M18.2 26.1 30 47.2 45.9 17.4"
          stroke="#75c993"
          strokeWidth="7.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35.2 15.2c7.9-1.3 15.2.2 21.2 3.7-1.8 8.6-6.5 14.4-13.9 17.3-4.3 1.7-8.9 1.9-13.4.7.3-8.7 2.3-16 6.1-21.7Z"
          fill="#75c993"
        />
        <path
          d="M34.1 34.1c5.1-6.8 10.8-11.5 17.2-14.2"
          stroke="white"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
