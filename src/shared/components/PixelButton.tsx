import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pressed?: boolean;
}

const base =
  'font-pixel px-4 py-2 border-2 border-fg select-none motion-safe:active:translate-x-[2px] motion-safe:active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-fg text-bg shadow-pixel motion-safe:hover:shadow-pixel-sm',
  secondary: 'bg-bg text-fg shadow-pixel motion-safe:hover:shadow-pixel-sm',
  ghost: 'bg-transparent text-fg border-transparent hover:border-fg',
  danger: 'bg-bg text-fg border-dashed shadow-pixel-sm hover:bg-fg hover:text-bg',
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  function PixelButton(
    { variant = 'primary', pressed, className = '', children, type = 'button', ...rest },
    ref,
  ) {
    const pressStyle = pressed ? 'translate-x-[2px] translate-y-[2px] shadow-pixel-sm' : '';
    return (
      <button
        ref={ref}
        type={type}
        className={`${base} ${variants[variant]} ${pressStyle} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
