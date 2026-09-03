import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Dock } from '@/shared/components/Dock';
import { AiPanel } from '@/features/ai/AiPanel';

export function AppLayout() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="min-h-screen pl-sidebar">
      <Outlet />
      <Dock />

      {/* AI FAB — always available (Dokumen 06: AI selalu tersedia) */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 w-12 font-mono font-bold text-lg text-bg bg-accent border-2 border-accent shadow-glow hover:shadow-glow-md label-term"
        aria-label="Buka AI Assistant"
      >
        AI
      </button>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
