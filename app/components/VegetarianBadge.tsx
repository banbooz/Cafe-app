export default function VegetarianBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Vegetarian"
      title="Vegetarian"
      className={`grid h-10 w-10 place-items-center ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" aria-hidden="true" fill="none">
        <path
          d="M25 62a29 29 0 0 0 50 0"
          stroke="#4fab55"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M25 55a29 29 0 0 1 4-15"
          stroke="#4fab55"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M75 55a29 29 0 0 0-4-15"
          stroke="#4fab55"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M48 78C35 60 27 39 29 12c16 13 26 33 25 60-2 2-4 4-6 6Z"
          fill="#4fab55"
        />
        <path
          d="M52 78C63 55 73 35 82 8c-20 10-35 30-36 62 2 3 4 5 6 8Z"
          fill="#4fab55"
        />
        <path
          d="M41 27c4 13 6 26 6 42"
          stroke="white"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M71 21C62 35 55 50 50 70"
          stroke="white"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <text
          x="50"
          y="94"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          letterSpacing="1.5"
          fill="#4fab55"
        >
          VEG
        </text>
      </svg>
    </span>
  );
}
