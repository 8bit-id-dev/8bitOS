import type { HTMLAttributes } from 'react';

export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  title?: string;
}

export function PixelCard({ accent = false, title, className = '', children, ...rest }: PixelCardProps) {
  return (
    <section className={`${accent ? 'panel-accent' : 'panel'} ${className}`} {...rest}>
      {title && (
        <header className="px-3 py-1.5 border-b hairline text-micro-label text-dim label-term">
          {title}
        </header>
      )}
      <div className="p-3">{children}</div>
    </section>
  );
}
