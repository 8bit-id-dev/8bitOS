import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PixelButton } from '@/shared/components/PixelButton';
import { PixelCard } from '@/shared/components/PixelCard';
import { createNote } from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';

const normalizeUrl = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
};

const SEARCH_ENGINES: Array<{ label: string; home: string; make: (q: string) => string }> = [
  { label: 'DUCKDUCKGO', home: 'https://duckduckgo.com', make: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  { label: 'BING', home: 'https://www.bing.com', make: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  { label: 'GOOGLE', home: 'https://www.google.com', make: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
];

export function Browser() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [engineIndex, setEngineIndex] = useState(0);
  const engine = SEARCH_ENGINES[engineIndex]!;
  const [input, setInput] = useState('');
  const [url, setUrl] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const go = (raw?: string) => {
    const value = raw ?? input;
    if (!value.trim()) return;
    const next = /^[\w-]+(\.[\w-]+)+/.test(value.trim()) && !value.includes(' ')
      ? normalizeUrl(value)
      : engine.make(value);
    setUrl(next);
    setInput(next);
    setBlocked(false);
  };

  const saveNoteMutation = useMutation({
    mutationFn: () =>
      createNote(user!.id, {
        kind: 'personal',
        title: `Referensi: ${url}`,
        body: input.trim(),
      }),
    onSuccess: () => {
      setSavedMsg('●● tersimpan ke notes');
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTimeout(() => setSavedMsg(''), 2500);
    },
  });

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/browser
        </h1>
        <div className="flex gap-1">
          {SEARCH_ENGINES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setEngineIndex(i)}
              className={`font-sans micro-pixel px-1.5 py-0.5 border ${
                engine.label === s.label
                  ? 'text-fg border-line-strong'
                  : 'text-gray-500 border-line-strong'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
      >
        <button
          type="button"
          onClick={() => {
            setUrl(engine.home);
            setInput(engine.home);
            setBlocked(false);
          }}
          className="font-sans text-pixel-sm text-gray-300 hover:text-fg px-1"
          aria-label="Beranda mesin pencari"
        >
          ●a
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="cari materi atau ketik URL●●"
          className="flex-1 bg-bg text-fg border border-line-strong px-3 py-1.5 font-sans text-pixel-sm focus-visible:border-fg"
          aria-label="Alamat atau pencarian"
        />
        <PixelButton type="submit">GO</PixelButton>
      </form>

      <div className="panel-strong flex-1 min-h-[420px] overflow-hidden relative">
        {url && !blocked ? (
          <iframe
            src={url}
            title="8bitOS internal browser"
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setBlocked(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <p className="font-sans text-pixel-sm text-gray-300">
              {blocked ? 'situs menolak dimuat dalam frame (X-Frame-Options)' : 'belum ada halaman'}
            </p>
            {!blocked && url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-pixel-sm text-fg underline"
              >
                buka di tab baru ↗⬠
              </a>
            )}
            {blocked && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-pixel-sm text-fg underline"
              >
                {`buka ${url} di tab baru ↗`}
              </a>
            )}
          </div>
        )}
      </div>

      <PixelCard title="aksi_halaman">
        <div className="flex gap-2 flex-wrap items-center">
          <PixelButton
            variant="secondary"
            disabled={!url}
            onClick={() => saveNoteMutation.mutate()}
          >
            + SIMPAN KE NOTES
          </PixelButton>
          {/* Content → Question flow (Dokumen 06 §13) */}
          <Link to="/assessment/new" className="inline-block">
            <PixelButton>+ BUAT SOAL</PixelButton>
          </Link>
          <span className="font-sans text-pixel-sm text-gray-300" aria-live="polite">
            {savedMsg}
          </span>
          <span className="flex-1" />
          <span className="font-sans micro-pixel text-gray-500">
            catat sumber: {url || '—'}
          </span>
        </div>
      </PixelCard>
    </main>
  );
}
