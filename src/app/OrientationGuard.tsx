import { useEffect, useState, type ReactNode } from 'react';

export function OrientationGuard({ children }: { children: ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  if (isPortrait) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center bg-bg text-fg p-6 text-center gap-3"
        role="alert"
      >
        <p className="font-pixel text-pixel-xl text-fg uppercase tracking-widest">ROTATE TABLET</p>
        <p className="micro-pixel text-gray-300">landscape only</p>
        <div className="text-[48px] text-fg" aria-hidden>
          ⟳
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
