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
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-pixel text-sm">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`bg-bg text-fg border-2 border-fg px-3 py-2 font-sans ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-gray-300">{error}</span>}
    </div>
  );
});
