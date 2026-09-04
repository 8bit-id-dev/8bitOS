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
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/tools
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">alat KBM</span>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="panel h-28 flex flex-col items-center justify-center gap-2 hover:border-fg hover: transition-all"
          >
            <span className="text-2xl text-fg ">{t.glyph}</span>
            <span className="font-sans text-pixel-sm text-fg label-pixel">{t.label}</span>
            <span className="font-sans micro-pixel text-gray-500">{t.desc}</span>
          </Link>
        ))}
      </div>

      <PixelCard title="mengembang">
        <p className="font-sans text-pixel-sm text-gray-300">
          timer overlay · kalkulator · file manager · print center — menyusul di spec berikutnya
        </p>
      </PixelCard>
    </main>
  );
}
