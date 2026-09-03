import { Link } from 'react-router-dom';
import { PixelCard } from '@/shared/components/PixelCard';

const TOOLS = [
  { to: '/browser', glyph: '⌘', label: 'BROWSER', desc: 'cari materi & referensi' },
  { to: '/whiteboard', glyph: '▩', label: 'WHITEBOARD', desc: 'papan tulis + M-Pencil' },
  { to: '/assessment', glyph: '◉', label: 'ASESMEN', desc: 'quiz, ulangan, koreksi' },
  { to: '/gradebook', glyph: '▦', label: 'GRADEBOOK', desc: 'nilai tertimbang per kelas' },
  { to: '/documents', glyph: '▣', label: 'DOKUMEN', desc: 'modul ajar, LKPD, arsip' },
];

export function ToolsHome() {
  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-mono font-bold text-lg text-accent text-glow label-term">
          ~/tools
        </h1>
        <span className="font-mono text-xs text-dim">alat KBM</span>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="panel h-28 flex flex-col items-center justify-center gap-2 hover:border-accent-dim hover:shadow-glow transition-all"
          >
            <span className="text-2xl text-accent text-glow">{t.glyph}</span>
            <span className="font-mono text-xs text-fg label-term">{t.label}</span>
            <span className="font-mono text-micro-label text-dimmer">{t.desc}</span>
          </Link>
        ))}
      </div>

      <PixelCard title="mengembang">
        <p className="font-mono text-xs text-dim">
          timer overlay · kalkulator · file manager · print center — menyusul di spec berikutnya
        </p>
      </PixelCard>
    </main>
  );
}
