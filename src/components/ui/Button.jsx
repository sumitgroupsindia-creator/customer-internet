import { forwardRef } from 'react';

/**
 * Polymorphic button. Renders a <button>, or an arbitrary element via `as`
 * (e.g. Link or `a`) while keeping consistent styling, sizing and loading state.
 */
const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'text-xs px-3.5 py-2 rounded-lg gap-1.5',
  md: '', // inherits .btn defaults
  lg: 'text-base px-6 py-3 rounded-2xl',
};

const Button = forwardRef(function Button(
  { as: Comp = 'button', variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props },
  ref,
) {
  const classes = [variants[variant] || variants.primary, sizes[size] || '', className].join(' ').trim();
  return (
    <Comp ref={ref} className={classes} disabled={Comp === 'button' ? disabled || loading : undefined} aria-busy={loading || undefined} {...props}>
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
      )}
      {children}
    </Comp>
  );
});

export default Button;
