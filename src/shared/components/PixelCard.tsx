import type { HTMLAttributes } from 'react';

export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  title?: string;
}

// Flat card: hairline border, no shadow, generous padding (Doc 05 v2 §7.2)
export function PixelCard({ accent = false, title, className = '', children, ...rest }: PixelCardProps) {
  return (
    <section className={`${accent ? 'panel-strong' : 'panel'} ${className}`} {...rest}>
      {title && (
        <header className="px-4 py-2 border-b hairline micro-pixel text-gray-300 label-pixel">
          {title}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
