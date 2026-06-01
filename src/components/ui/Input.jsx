import { forwardRef, useId } from 'react';

/**
 * Labelled input with built-in error + hint messaging and accessible wiring
 * (label htmlFor, aria-invalid, aria-describedby). `leftIcon` renders inside.
 */
const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, className = '', id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">{leftIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`input-field ${leftIcon ? 'pl-11' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
