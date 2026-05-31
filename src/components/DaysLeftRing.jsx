/**
 * Days-left ring: animated SVG donut showing % of cycle remaining.
 */
export default function DaysLeftRing({ daysLeft, totalDays = 30, size = 160 }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = Math.max(totalDays || 30, 1);
  const ratio = daysLeft === null || daysLeft === undefined
    ? 0
    : Math.max(0, Math.min(1, daysLeft / safeTotal));
  const offset = circumference * (1 - ratio);

  let color = '#10b981'; // emerald
  if (daysLeft <= 0) color = '#ef4444';
  else if (daysLeft <= 2) color = '#f97316';
  else if (daysLeft <= 7) color = '#f59e0b';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius}
          stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>
          {daysLeft <= 0 ? Math.abs(daysLeft) : daysLeft}
        </span>
        <span className="text-xs text-gray-500 mt-0.5">
          {daysLeft < 0 ? 'days ago' : daysLeft === 0 ? 'expires today' : 'days left'}
        </span>
      </div>
    </div>
  );
}
