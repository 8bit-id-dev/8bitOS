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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[1px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="panel-accent w-[480px] max-w-[90vw] shadow-glow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-3 py-2 border-b border-accent-dim flex items-center justify-between">
          <h2 className="font-mono text-xs label-term text-accent text-glow">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-dim hover:text-accent text-xs px-1"
          >
            X
          </button>
        </header>
        <div className="p-4">{children}</div>
        {footer && <div className="px-4 pb-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
