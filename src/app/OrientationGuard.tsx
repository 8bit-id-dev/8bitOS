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
      <div className="fixed inset-0 flex items-center justify-center bg-bg text-fg font-pixel text-2xl p-6 text-center">
        ROTATE TABLET · LANDSCAPE ONLY
      </div>
    );
  }
  return <>{children}</>;
}
