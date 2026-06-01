import Icon from './Icon';

/**
 * Consistent empty / error state with an icon, message and optional action.
 */
export default function EmptyState({ icon = 'inbox', title, description, action, className = '' }) {
  return (
    <div className={`text-center py-16 px-6 animate-fade-up ${className}`.trim()}>
      <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-subtle mb-5">
        <Icon name={icon} className="w-8 h-8" />
      </div>
      {title && <h3 className="text-lg font-semibold text-fg">{title}</h3>}
      {description && <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
