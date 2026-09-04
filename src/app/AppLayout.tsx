import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Dock } from '@/shared/components/Dock';
import { AiPanel } from '@/features/ai/AiPanel';
import { CommandPalette } from '@/features/palette/CommandPalette';
import { SessionIndicator } from '@/features/classroom/SessionIndicator';
import { TimerOverlay } from '@/features/timer/TimerOverlay';
import { QuickCapture } from '@/features/capture/QuickCapture';

export function AppLayout() {
  const [aiOpen, setAiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      // Quick capture: ctrl+j (ide cepat, Dok 06 §18)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCaptureOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    // Command palette can trigger quick capture too (Dok 06 §17)
    const captureHandler = () => setCaptureOpen(true);
    window.addEventListener('8bithos:quick-capture', captureHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('8bithos:quick-capture', captureHandler);
    };
  }, []);

  return (
    <div className="min-h-screen pl-sidebar">
      <Outlet />
      <Dock />

      {/* Persistent session indicator (Dok 06 §4) — visible on all screens */}
      <SessionIndicator />

      {/* Floating timer (Dok 06 §16) — callable from anywhere */}
      <TimerOverlay />

      {/* Command palette trigger (Dok 06 §17) */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="fixed bottom-4 right-[7.5rem] z-40 h-12 px-3 pixel-cut font-pixel text-pixel-sm text-bg bg-fg border border-fg label-pixel hover:bg-surface hover:text-fg"
        aria-label="Buka command palette (Ctrl+K)"
        title="Ctrl+K"
      >
        ⌕ CARI
      </button>

      {/* Quick capture FAB (Dok 06 §18) */}
      <button
        type="button"
        onClick={() => setCaptureOpen(true)}
        className="fixed bottom-[4.5rem] right-4 z-40 h-12 w-12 pixel-cut font-pixel text-pixel-md font-bold text-bg bg-fg border border-fg label-pixel hover:bg-surface hover:text-fg"
        aria-label="Quick capture (Ctrl+J)"
        title="Ctrl+J"
      >
        ✎
      </button>

      {/* AI FAB — 8bit AI pixel identity */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 w-12 pixel-cut font-pixel text-pixel-md font-bold text-bg bg-fg border border-fg label-pixel hover:bg-surface hover:text-fg"
        aria-label="Buka 8bit AI"
      >
        AI
      </button>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
