import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

// Input = reading surface: Inter font (Doc 05 v2 §7.4)
export interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(function PixelInput(
  { label, error, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="micro-pixel text-gray-300">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`bg-bg text-fg border px-3 py-2 font-sans text-small focus-visible:border-fg ${
          error ? 'border-dashed border-fg' : 'border-line-strong'
        } ${className}`}
        {...rest}
      />
      {error && (
        <span id={errorId} className="micro-pixel text-fg">
          {error}
        </span>
      )}
    </div>
  );
});
