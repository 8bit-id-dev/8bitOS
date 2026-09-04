import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  listAssessments,
  listClassesForUser,
  listDocuments,
  listNotes,
  listStudentsByClass,
} from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { rankItems, type PaletteItem } from './palette.helpers';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user && open),
    staleTime: 60_000,
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', user?.id ?? 'anon'],
    queryFn: () => listNotes(),
    enabled: Boolean(user && open),
    staleTime: 30_000,
  });

  const { data: assessments } = useQuery({
    queryKey: ['assessments', user?.id ?? 'anon'],
    queryFn: () => listAssessments(user!.id),
    enabled: Boolean(user && open),
    staleTime: 30_000,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents-all'],
    queryFn: () => listDocuments(),
    enabled: Boolean(user && open),
    staleTime: 30_000,
  });

  const { data: students } = useQuery({
    queryKey: ['students-all'],
    queryFn: async () => {
      const classes = classSummaries ?? [];
      const rows = await Promise.all(
        classes.map((c) => listStudentsByClass(c.classRow.id).catch(() => [])),
      );
      return rows.flatMap((list, i) =>
        list.map((s) => ({
          ...s,
          classId: classes[i]?.classRow.id ?? '',
          className: classes[i]?.classRow.name ?? '',
        })),
      );
    },
    enabled: Boolean(user && open && classSummaries?.length),
    staleTime: 30_000,
  });

  const items: PaletteItem[] = useMemo(() => {
    const nav: PaletteItem[] = [
      { id: 'n-dash', label: 'Dashboard', group: 'NAV', keywords: 'home beranda', to: '/' },
      { id: 'n-class', label: 'Classroom', group: 'NAV', keywords: 'kelas daftar', to: '/classroom' },
      { id: 'n-planner', label: 'Planner', group: 'NAV', keywords: 'rencana jadwal minggu', to: '/planner' },
      { id: 'n-notes', label: 'Notes', group: 'NAV', keywords: 'catatan', to: '/notes' },
      { id: 'n-tools', label: 'Tools', group: 'NAV', keywords: 'alat', to: '/tools' },
      { id: 'n-docs', label: 'Documents', group: 'NAV', keywords: 'dokumen arsip modul', to: '/documents' },
      { id: 'n-whiteboard', label: 'Whiteboard', group: 'NAV', keywords: 'papan tulis', to: '/whiteboard' },
      { id: 'n-browser', label: 'Browser', group: 'NAV', keywords: 'cari web', to: '/browser' },
    ];

    const classes: PaletteItem[] = (classSummaries ?? []).map((s) => ({
      id: `c-${s.classRow.id}`,
      label: s.classRow.name,
      hint: 'kelas',
      group: 'KELAS',
      keywords: `${s.subjectNames.join(' ')} wali ${s.classRow.homeroom}`,
      to: `/classroom/${s.classRow.id}`,
    }));

    const classGradebooks: PaletteItem[] = (classSummaries ?? []).map((s) => ({
      id: `g-${s.classRow.id}`,
      label: `Nilai ${s.classRow.name}`,
      hint: 'gradebook',
      group: 'NILAI',
      keywords: 'gradebook nilai',
      to: `/gradebook/${s.classRow.id}`,
    }));

    const classDocs: PaletteItem[] = (classSummaries ?? []).map((s) => ({
      id: `d-${s.classRow.id}`,
      label: `Dokumen ${s.classRow.name}`,
      hint: 'dokumen',
      group: 'DOKUMEN',
      keywords: 'modul lkpd arsip',
      to: `/classroom/${s.classRow.id}/documents`,
    }));

    const studentItems: PaletteItem[] = (students ?? []).map((s) => ({
      id: `s-${s.id}`,
      label: s.full_name,
      hint: `${s.className} · siswa`,
      group: 'SISWA',
      keywords: `nisn ${s.nisn}`,
      to: `/classroom/${s.classId}/students/${s.id}`,
    }));

    const noteItems: PaletteItem[] = (notes ?? []).slice(0, 40).map((n) => ({
      id: `note-${n.id}`,
      label: n.title || '(tanpa judul)',
      hint: 'note',
      group: 'CATATAN',
      keywords: n.body.slice(0, 120),
      to: '/notes',
    }));

    const assessItems: PaletteItem[] = (assessments ?? []).map((a) => ({
      id: `a-${a.id}`,
      label: a.title,
      hint: 'asesmen',
      group: 'ASESMEN',
      keywords: `${a.type} koreksi quiz ulangan`,
      to: `/assessment/${a.id}/run`,
    }));

    const docItems: PaletteItem[] = (documents ?? []).slice(0, 40).map((d) => ({
      id: `doc-${d.id}`,
      label: d.title,
      hint: 'dokumen',
      group: 'DOKUMEN',
      keywords: `${d.kind} ${d.tags}`,
      to: d.class_id ? `/classroom/${d.class_id}/documents` : '/documents',
    }));

    return [
      ...nav,
      ...classes,
      ...classGradebooks,
      ...classDocs,
      ...studentItems,
      ...noteItems,
      ...assessItems,
      ...docItems,
    ];
  }, [classSummaries, students, notes, assessments, documents]);

  const results = useMemo(() => rankItems(query, items, 9), [query, items]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const run = (item: PaletteItem) => {
    if (item.to) navigate(item.to);
    if (item.action) item.action();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-label="Command palette"
    >
      <div
        className="panel-strong w-[560px] max-w-[92vw] "
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const picked = results[cursor];
              if (picked) run(picked);
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="cari siswa, kelas, catatan, asesmenâ€¦ atau ketik perintah"
          className="w-full bg-transparent text-fg font-sans text-small px-4 py-3 outline-none border-b border-line-strong placeholder:text-gray-500"
          aria-label="Pencarian global"
        />

        <ul className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-3 font-sans text-pixel-sm text-gray-500">
              tidak ada hasil untuk "{query}"
            </li>
          )}
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => run(r)}
                onMouseEnter={() => setCursor(i)}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 font-sans text-pixel-sm ${
                  i === cursor ? 'bg-fg text-bg' : 'text-fg hover:bg-surface'
                }`}
              >
                <span className={i === cursor ? 'text-bg' : 'text-gray-500'}>{r.group}</span>
                <span className="flex-1 truncate">{r.label}</span>
                {r.hint && (
                  <span className={i === cursor ? 'text-bg/70' : 'text-gray-500'}>{r.hint}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <footer className="px-4 py-2 border-t hairline flex items-center gap-3 font-sans micro-pixel text-gray-500">
          <span>â†‘â†“ navigasi</span>
          <span>â†µ buka</span>
          <span>esc tutup</span>
          <span className="flex-1" />
          <span>ctrl+k</span>
        </footer>
      </div>
    </div>
  );
}
