import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Dock } from '@/shared/components/Dock';
import { AiPanel } from '@/features/ai/AiPanel';
import { CommandPalette } from '@/features/palette/CommandPalette';

export function AppLayout() {
  const [aiOpen, setAiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen pl-sidebar">
      <Outlet />
      <Dock />

      {/* Command palette trigger (Doc 05 v2: quiet, pixel label) */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="fixed bottom-4 right-24 z-40 h-12 px-3 pixel-cut font-pixel text-pixel-sm text-bg bg-fg border border-fg label-pixel hover:bg-surface hover:text-fg"
        aria-label="Buka command palette (Ctrl+K)"
        title="Ctrl+K"
      >
        ⌕ CARI
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
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
