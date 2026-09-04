import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessionContext, elapsedLabel } from '@/features/classroom/sessionContext';

// Persistent session indicator (Dokumen 06 §4): session aktif terlihat
// dari semua layar; tap untuk kembali ke Teaching Desk (absensi).
export function SessionIndicator() {
  const active = useSessionContext((s) => s.active);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;

  return (
    <Link
      to={`/classroom/${active.classId}/attendance/${active.sessionId}`}
      className="fixed top-2 right-4 z-40 flex items-center gap-2 pixel-cut bg-fg text-bg border border-fg px-3 py-1.5 label-pixel font-pixel text-pixel-xs"
      aria-label={`Sesi aktif: ${active.subjectName} ${active.className} — kembali`}
    >
      <span className="w-2 h-2 bg-bg animate-pulse" aria-hidden />
      <span>
        {active.subjectName.toUpperCase()} · {active.className}
      </span>
      <span className="tabular-nums">{elapsedLabel(active.startedAtIso, now)}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
