import type { HTMLAttributes } from 'react';

export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  cut?: boolean;
}

export function PixelCard({ cut = true, className = '', children, ...rest }: PixelCardProps) {
  const cutClass = cut ? 'pixel-cut' : '';
  return (
    <div className={`pixel-card ${cutClass} p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
