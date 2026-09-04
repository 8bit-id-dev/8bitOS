import { useEffect, useRef, useState } from 'react';

// Floating system timer (Dokumen 06 §16): dipanggil dari mana saja,
// tidak membuka halaman baru — overlay kecil yang tenang.
export function TimerOverlay() {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    raf.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, [running]);

  const label = () => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const setPreset = (mins: number) => {
    setSeconds(mins * 60);
    setRunning(true);
    setOpen(true);
  };

  // Command palette integration (Dok 06 §17: "timer 15 minutes")
  useEffect(() => {
    const handler = (e: Event) => {
      const mins = (e as CustomEvent<number>).detail;
      setPreset(mins ?? 5);
    };
    window.addEventListener('8bithos:timer', handler);
    return () => window.removeEventListener('8bithos:timer', handler);
  }, []);

  return (
    <>
      {/* Trigger chip — quiet, docked bottom-center */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1">
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : (setRunning(true), setOpen(true)))}
          className="pixel-cut bg-surface text-fg border border-line-strong px-3 py-1.5 label-pixel font-pixel text-pixel-xs hover:border-fg"
          aria-label={open ? 'Sembunyikan timer' : 'Buka timer'}
        >
          ⏱ {open ? label() : 'TIMER'}
        </button>
        {!open && (
          <>
            <button
              type="button"
              onClick={() => setPreset(5)}
              className="pixel-cut bg-surface text-gray-300 border border-line-strong px-2 py-1.5 micro-pixel hover:border-fg hover:text-fg"
              aria-label="Timer 5 menit"
            >
              5m
            </button>
            <button
              type="button"
              onClick={() => setPreset(15)}
              className="pixel-cut bg-surface text-gray-300 border border-line-strong px-2 py-1.5 micro-pixel hover:border-fg hover:text-fg"
              aria-label="Timer 15 menit"
            >
              15m
            </button>
          </>
        )}
      </div>

      {/* Floating panel */}
      {open && (
        <div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 panel-strong pixel-cut p-4 w-56 text-center"
          role="dialog"
          aria-label="Timer kelas"
        >
          <p className="micro-pixel text-gray-300 mb-2">CLASS TIMER</p>
          <p className="font-pixel text-[32px] leading-none font-bold text-fg tabular-nums">
            {label()}
          </p>
          <div className="flex gap-1 justify-center mt-3">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="pixel-cut bg-fg text-bg border border-fg px-3 py-1.5 micro-pixel font-pixel"
            >
              {running ? 'PAUSE' : 'RESUME'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSeconds(0);
                setRunning(false);
              }}
              className="pixel-cut bg-transparent text-gray-300 border border-line-strong px-3 py-1.5 micro-pixel font-pixel hover:border-fg hover:text-fg"
            >
              STOP
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="pixel-cut bg-transparent text-gray-500 border border-line px-3 py-1.5 micro-pixel font-pixel hover:text-fg"
            >
              HIDE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
