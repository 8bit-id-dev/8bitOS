import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, deleteNote, listNotes, updateNote, type NoteDraft } from '@/shared/db/queries';
import type { Note, NoteKind } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  HandwriteCanvas,
  strokesToDataUrl,
  type HandStroke,
} from '@/shared/components/HandwriteCanvas';

const KINDS: Array<{ key: NoteKind; label: string }> = [
  { key: 'personal', label: 'PRIBADI' },
  { key: 'meeting', label: 'RAPAT' },
  { key: 'class', label: 'KELAS' },
  { key: 'session', label: 'SESI' },
];

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  const d = Math.floor(h / 24);
  return `${d}h lalu`;
};

const SAVE_DEBOUNCE_MS = 1_500;

export function NotesScreen() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<NoteKind>('personal');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handwriting layer (Doc 08 NOTES-02): dual-mode editor — text + stylus
  const [editorTab, setEditorTab] = useState<'text' | 'ink'>('text');
  const [strokes, setStrokes] = useState<HandStroke[]>([]);

  const notesQ = useQuery({
    queryKey: ['notes', user?.id ?? 'anon'],
    queryFn: () => listNotes(),
    enabled: Boolean(user),
    staleTime: 15_000,
  });

  const notes = notesQ.data ?? [];
  const active = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  const saveMutation = useMutation({
    mutationFn: (noteId: string) => {
      // Ink layer disimpan sebagai marker di akhir body
      const fullBody =
        strokes.length > 0
          ? `${body}\n[[ink:${JSON.stringify(strokes)}]]`
          : body;
      return updateNote(noteId, { title, body: fullBody, kind });
    },
    onSuccess: () => {
      setSaveState('saved');
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      setActiveId(null);
      setConfirmDelete(false);
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Auto-save debounce (Don't Make Teacher Save) — text, kind, dan ink strokes
  useEffect(() => {
    if (!active) return;
    const inkUnchanged =
      JSON.stringify(strokes) ===
      JSON.stringify(
        (() => {
          try {
            const m = active.body.match(/\[\[ink:(.+?)\]\]/s);
            return m ? (JSON.parse(m[1]!) as HandStroke[]) : [];
          } catch {
            return [];
          }
        })(),
      );
    const textBody = active.body.replace(/\s*\[\[ink:.+?\]\]\s*/s, '');
    if (active.title === title && textBody === body && active.kind === kind && inkUnchanged) {
      setSaveState('idle');
      return;
    }
    setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveMutation.mutate(active.id);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, kind, strokes, activeId]);

  const openNote = (n: Note) => {
    setActiveId(n.id);
    setTitle(n.title);
    // Handwrite layer tersimpan sebagai marker di body: [[ink:<strokes-json>]]
    const inkMatch = n.body.match(/\[\[ink:(.+?)\]\]/s);
    const textBody = n.body.replace(/\s*\[\[ink:.+?\]\]\s*/s, '');
    setBody(textBody);
    try {
      setStrokes(inkMatch ? (JSON.parse(inkMatch[1]!) as HandStroke[]) : []);
    } catch {
      setStrokes([]);
    }
    setKind(n.kind);
    setSaveState('idle');
  };

  const newNote = async () => {
    if (!user) return;
    const draft: NoteDraft = { kind: 'personal', title: '', body: '' };
    const created = await createNote(user.id, draft);
    void queryClient.invalidateQueries({ queryKey: ['notes'] });
    openNote(created);
  };

  return (
    <div className="min-h-screen flex">
      {/* Master — list */}
      <aside className="w-72 border-r border-line-strong bg-bg flex flex-col">
        <header className="h-header-h flex items-center justify-between px-3 border-b border-line-strong">
          <h1 className="font-sans font-bold text-small text-fg  label-pixel">
            ~/notes
          </h1>
          <button
            type="button"
            onClick={() => void newNote()}
            className="font-sans text-pixel-sm text-fg border border-line-strong px-1.5 hover:"
          >
            + BARU
          </button>
        </header>

        <nav className="flex border-b border-line">
          {KINDS.map((k) => (
            <span key={k.key} className="px-2 py-1 font-sans micro-pixel text-gray-500">
              {k.label}
            </span>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto">
          {notesQ.isLoading && (
            <p className="font-sans text-pixel-sm text-gray-300 p-3">loading…</p>
          )}
          {!notesQ.isLoading && notes.length === 0 && (
            <p className="font-sans text-pixel-sm text-gray-500 p-3">belum ada catatan</p>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => openNote(n)}
              className={`w-full text-left px-3 py-2 border-b border-line font-sans ${
                n.id === activeId ? 'bg-surface text-fg border-l-2 border-l-accent' : 'text-fg hover:bg-surface'
              }`}
            >
              <p className="text-pixel-sm truncate">{n.title || '(tanpa judul)'}</p>
              <p className="micro-pixel text-gray-500 mt-0.5">
                {KINDS.find((k) => k.key === n.kind)?.label} · {relativeTime(n.updated_at)}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Detail — editor */}
      <section className="flex-1 flex flex-col bg-bg">
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="PILIH ATAU BUAT CATATAN"
              hint="Catatan tersimpan otomatis saat Anda mengetik."
            />
          </div>
        ) : (
          <>
            <header className="h-header-h flex items-center gap-3 px-3 border-b border-line-strong">
              <span
                className={`font-sans micro-pixel ${
                  saveState === 'saved'
                    ? 'text-fg'
                    : saveState === 'saving'
                      ? 'text-gray-300'
                      : 'text-gray-500'
                }`}
                aria-live="polite"
              >
                {saveState === 'saved' ? '● tersimpan' : saveState === 'saving' ? '○ menyimpan…' : '○ siap'}
              </span>
              <div className="flex-1" />
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as NoteKind)}
                className="bg-bg text-fg border border-line-strong px-1.5 py-0.5 font-sans micro-pixel"
                aria-label="Jenis catatan"
              >
                {KINDS.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="font-sans text-pixel-sm text-gray-300 hover:text-fg"
                aria-label="Hapus catatan"
              >
                [HAPUS]
              </button>
            </header>

            <div className="flex-1 flex flex-col p-4 gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="judul…"
                className="bg-transparent text-pixel-xl font-sans text-fg border-none outline-none placeholder:text-gray-500"
                aria-label="Judul catatan"
              />

              {/* Dual-mode editor (Doc 08 §14: Digital + Stylus) */}
              <div className="flex gap-1 border-b border-line pb-1">
                <button
                  type="button"
                  onClick={() => setEditorTab('text')}
                  className={`micro-pixel px-2 py-1 border ${
                    editorTab === 'text'
                      ? 'bg-fg text-bg border-fg'
                      : 'text-gray-300 border-line-strong'
                  }`}
                >
                  TEKS
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('ink')}
                  className={`micro-pixel px-2 py-1 border ${
                    editorTab === 'ink'
                      ? 'bg-fg text-bg border-fg'
                      : 'text-gray-300 border-line-strong'
                  }`}
                >
                  ✎ TULIS TANGAN
                </button>
              </div>

              {editorTab === 'text' ? (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="tulis di sini…"
                  className="flex-1 bg-transparent text-small font-sans text-fg border border-line px-3 py-2 outline-none focus-visible:border-fg resize-none"
                  aria-label="Isi catatan"
                />
              ) : (
                <div className="flex-1 flex flex-col gap-2">
                  <HandwriteCanvas
                    strokes={strokes}
                    onChange={setStrokes}
                    height={220}
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => setStrokes((s) => s.slice(0, -1))}
                      className="micro-pixel px-2 py-1 border border-line-strong text-gray-300 hover:border-fg"
                    >
                      ↶ UNDO
                    </button>
                    <button
                      type="button"
                      onClick={() => setStrokes([])}
                      className="micro-pixel px-2 py-1 border border-line-strong text-gray-300 hover:border-fg"
                    >
                      KOSONGKAN
                    </button>
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={() => {
                        const url = strokesToDataUrl(strokes);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ink-${Date.now()}.png`;
                        a.click();
                      }}
                      disabled={strokes.length === 0}
                      className="micro-pixel px-2 py-1 border border-line-strong text-gray-300 hover:border-fg disabled:opacity-40"
                    >
                      PNG ↓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="HAPUS CATATAN?"
        message="Catatan ini akan dihapus permanen. TIDAK DAPAT DIBATALKAN."
        confirmLabel="HAPUS"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => active && deleteMutation.mutate(active.id)}
      />
    </div>
  );
}
