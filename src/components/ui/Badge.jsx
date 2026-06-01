const tones = {
  brand: 'badge-brand',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
};

export default function Badge({ tone = 'neutral', className = '', children, dot = false, ...props }) {
  return (
    <span className={`${tones[tone] || tones.neutral} ${className}`.trim()} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
