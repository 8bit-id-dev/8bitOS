import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pressed?: boolean;
}

const base =
  'label-pixel font-pixel text-pixel-sm px-4 py-2 select-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]';

const variants: Record<Variant, string> = {
  // Primary: putih solid, pixel-cut (Doc 05 v2 §7.1)
  primary:
    'pixel-cut bg-fg text-bg border border-fg hover:bg-surface hover:text-fg',
  secondary:
    'pixel-cut bg-transparent text-fg border border-line-strong hover:border-fg',
  ghost: 'bg-transparent text-gray-300 border border-transparent hover:text-fg',
  danger: 'pixel-cut bg-transparent text-gray-300 border border-dashed border-gray-500 hover:text-fg',
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  function PixelButton(
    { variant = 'primary', pressed, className = '', children, type = 'button', ...rest },
    ref,
  ) {
    const press = pressed ? 'translate-x-[2px] translate-y-[2px]' : '';
    return (
      <button
        ref={ref}
        type={type}
        className={`${base} ${variants[variant]} ${press} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
