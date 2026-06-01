import Icon from './Icon';

/**
 * KPI / metric card used across the dashboard and list pages.
 * Tone drives the accent colour of the icon chip and optional delta.
 */
const tones = {
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  neutral: 'bg-surface-2 text-muted',
};

export default function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'brand',
  delta,
  className = '',
}) {
  return (
    <div className={`card p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone] || tones.brand}`}>
          <Icon name={icon} className="w-[22px] h-[22px]" />
        </span>
        {delta != null && (
          <span className={`badge ${delta >= 0 ? 'badge-success' : 'badge-danger'}`}>
            <Icon name="trendingUp" className={`w-3.5 h-3.5 ${delta < 0 ? 'rotate-90' : ''}`} />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-display font-extrabold text-fg leading-none truncate">{value}</p>
      <p className="mt-1.5 text-sm font-medium text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
