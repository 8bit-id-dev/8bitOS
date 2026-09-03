import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pressed?: boolean;
}

const base =
  'font-pixel px-4 py-2 border-2 border-fg select-none transition-transform active:translate-x-[2px] active:translate-y-[2px]';

const variants: Record<Variant, string> = {
  primary: 'bg-fg text-bg shadow-pixel hover:shadow-pixel-sm',
  secondary: 'bg-bg text-fg shadow-pixel hover:shadow-pixel-sm',
  ghost: 'bg-transparent text-fg border-transparent',
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  function PixelButton({ variant = 'primary', pressed, className = '', children, ...rest }, ref) {
    const pressStyle = pressed ? 'translate-x-[2px] translate-y-[2px] shadow-pixel-sm' : '';
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${pressStyle} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
