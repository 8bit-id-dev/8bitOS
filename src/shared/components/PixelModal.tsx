import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface PixelModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function PixelModal({ open, onClose, title, children, footer }: PixelModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="panel-strong pixel-cut w-[480px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <header className="px-4 py-3 border-b border-line-strong flex items-center justify-between">
          <h2 className="font-pixel text-pixel-sm text-fg uppercase tracking-widest">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-pixel text-gray-500 hover:text-fg text-pixel-sm"
          >
            [X]
          </button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 pb-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
