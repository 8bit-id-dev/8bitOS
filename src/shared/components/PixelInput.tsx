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
  const inputId = id ?? `pixel-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-pixel text-sm">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`bg-bg text-fg border-2 ${error ? 'border-dashed' : 'border-fg'} px-3 py-2 font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-fg focus-visible:outline-offset-2 ${className}`}
        {...rest}
      />
      {error && (
        <span id={errorId} className="font-pixel text-micro text-fg">
          {error}
        </span>
      )}
    </div>
  );
});
