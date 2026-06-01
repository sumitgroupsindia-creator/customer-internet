/**
 * Slim, theme-aware progress bar. `value` is 0–100. Tone drives the fill colour
 * (defaults to brand). Used for the billing-cycle timeline on the dashboard.
 */
const fills = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export default function ProgressBar({ value = 0, tone = 'brand', className = '', 'aria-label': ariaLabel }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-2.5 w-full rounded-full bg-surface-2 overflow-hidden ${className}`.trim()}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={`h-full rounded-full ${fills[tone] || fills.brand} transition-[width] duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
