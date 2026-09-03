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

      {/* Command palette trigger (Dokumen 06 §17, Dokumen 07 §28-29) */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="fixed bottom-4 right-20 z-40 h-12 px-3 font-mono font-bold text-sm text-bg bg-accent border-2 border-accent shadow-glow hover:shadow-glow-md label-term"
        aria-label="Buka command palette (Ctrl+K)"
        title="Ctrl+K"
      >
        ⌕ CARI
      </button>

      {/* AI FAB — always available (Dokumen 06: AI selalu tersedia) */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 w-12 font-mono font-bold text-lg text-bg bg-accent border-2 border-accent shadow-glow hover:shadow-glow-md label-term"
        aria-label="Buka AI Assistant"
      >
        AI
      </button>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
