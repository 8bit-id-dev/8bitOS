import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pressed?: boolean;
}

const base =
  'font-mono label-term text-xs px-3 py-1.5 border select-none transition-shadow disabled:opacity-40 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-bg border-accent hover:shadow-glow focus-visible:shadow-glow',
  secondary:
    'bg-transparent text-accent border-accent-dim hover:border-accent hover:shadow-glow',
  ghost: 'bg-transparent text-dim border-transparent hover:text-fg',
  danger: 'bg-transparent text-fg border-dashed border-dim hover:text-accent',
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  function PixelButton(
    { variant = 'primary', className = '', children, type = 'button', ...rest },
    ref,
  ) {
    return (
      <button ref={ref} type={type} className={`${base} ${variants[variant]} ${className}`} {...rest}>
        {children}
      </button>
    );
  },
);
