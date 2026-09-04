import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// Toast system (Dokumen 09 §24, P0): feedback singkat '✓ Saved'.
// Monokrom, quiet — muncul singkat lalu hilang sendiri.

interface ToastItem {
  id: number;
  label: string;
}

interface ToastApi {
  toast: (label: string) => void;
}

const ToastCtx = createContext<ToastApi>({ toast: () => undefined });

export const useToast = (): ToastApi => useContext(ToastCtx);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((label: string) => {
    const id = nextId++;
    setItems((prev) => [...prev.slice(-2), { id, label }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {/* Toast stack — bottom center, di atas semua FAB */}
      <div
        className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-1 pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {items.map((t) => (
          <span
            key={t.id}
            className="pixel-cut bg-fg text-bg border border-fg px-3 py-1.5 font-pixel text-pixel-xs"
          >
            {t.label}
          </span>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
