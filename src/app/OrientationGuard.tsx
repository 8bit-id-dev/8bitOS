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
        className="fixed inset-0 flex flex-col items-center justify-center bg-bg text-fg p-6 text-center gap-4"
        role="alert"
      >
        <p className="font-pixel text-h1">ROTATE TABLET</p>
        <p className="font-pixel text-small text-gray-300">LANDSCAPE ONLY</p>
        <div className="text-[64px]" aria-hidden>
          ⟳
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
