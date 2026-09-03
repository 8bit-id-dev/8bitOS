import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, deleteNote, listNotes, updateNote, type NoteDraft } from '@/shared/db/queries';
import type { Note, NoteKind } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

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
    mutationFn: (noteId: string) => updateNote(noteId, { title, body, kind }),
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

  // Auto-save debounce (Don't Make Teacher Save)
  useEffect(() => {
    if (!active) return;
    if (active.title === title && active.body === body && active.kind === kind) {
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
  }, [title, body, kind, activeId]);

  const openNote = (n: Note) => {
    setActiveId(n.id);
    setTitle(n.title);
    setBody(n.body);
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
          <h1 className="font-mono font-bold text-sm text-accent text-glow label-term">
            ~/notes
          </h1>
          <button
            type="button"
            onClick={() => void newNote()}
            className="font-mono text-xs text-accent border border-accent-dim px-1.5 hover:shadow-glow"
          >
            + BARU
          </button>
        </header>

        <nav className="flex border-b border-line">
          {KINDS.map((k) => (
            <span key={k.key} className="px-2 py-1 font-mono text-micro-label text-dimmer">
              {k.label}
            </span>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto">
          {notesQ.isLoading && (
            <p className="font-mono text-xs text-dim p-3">loading…</p>
          )}
          {!notesQ.isLoading && notes.length === 0 && (
            <p className="font-mono text-xs text-dimmer p-3">belum ada catatan</p>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => openNote(n)}
              className={`w-full text-left px-3 py-2 border-b border-line font-mono ${
                n.id === activeId ? 'bg-bg-raised text-accent border-l-2 border-l-accent' : 'text-fg hover:bg-bg-raised'
              }`}
            >
              <p className="text-xs truncate">{n.title || '(tanpa judul)'}</p>
              <p className="text-micro-label text-dimmer mt-0.5">
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
                className={`font-mono text-micro-label ${
                  saveState === 'saved'
                    ? 'text-accent'
                    : saveState === 'saving'
                      ? 'text-dim'
                      : 'text-dimmer'
                }`}
                aria-live="polite"
              >
                {saveState === 'saved' ? '● tersimpan' : saveState === 'saving' ? '○ menyimpan…' : '○ siap'}
              </span>
              <div className="flex-1" />
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as NoteKind)}
                className="bg-bg text-fg border border-line-strong px-1.5 py-0.5 font-mono text-micro-label"
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
                className="font-mono text-xs text-dim hover:text-fg"
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
                className="bg-transparent text-lg font-mono text-accent border-none outline-none placeholder:text-dimmer"
                aria-label="Judul catatan"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="tulis di sini…"
                className="flex-1 bg-transparent text-sm font-mono text-fg border border-line px-3 py-2 outline-none focus-visible:border-accent resize-none"
                aria-label="Isi catatan"
              />
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
