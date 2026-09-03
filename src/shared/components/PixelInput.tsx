import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(function PixelInput(
  { label, error, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? `term-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-mono text-micro-label label-term text-dim">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`bg-bg text-fg border px-2 py-1.5 font-mono text-small focus-visible:border-accent focus-visible:shadow-glow ${
          error ? 'border-dashed border-fg' : 'border-line-strong'
        } ${className}`}
        {...rest}
      />
      {error && (
        <span id={errorId} className="font-mono text-micro-label text-fg">
          {error}
        </span>
      )}
    </div>
  );
});
