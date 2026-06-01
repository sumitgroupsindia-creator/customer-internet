/**
 * Consistent page header: optional eyebrow, title, subtitle and right-aligned
 * actions. Keeps spacing & typography identical across every internal page.
 */
export default function PageHeader({ eyebrow, title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{eyebrow}</p>
        )}
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-fg mt-1 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
