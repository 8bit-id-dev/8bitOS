import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  deleteDocument,
  getDocumentUrl,
  listClassesForUser,
  listDocuments,
  uploadDocument,
} from '@/shared/db/queries';
import type { DocumentKind, DocumentRow } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

const KINDS: Array<{ value: DocumentKind; label: string }> = [
  { value: 'modul_ajar', label: 'MODUL AJAR' },
  { value: 'rpp', label: 'RPP' },
  { value: 'lkpd', label: 'LKPD' },
  { value: 'soal', label: 'SOAL' },
  { value: 'nilai', label: 'NILAI' },
  { value: 'surat', label: 'SURAT' },
  { value: 'lainnya', label: 'LAINNYA' },
];

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.value, k.label]));

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function Documents() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<DocumentKind>('modul_ajar');
  const [filterKind, setFilterKind] = useState<DocumentKind | ''>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<DocumentRow | null>(null);

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const docsQ = useQuery({
    queryKey: ['documents', classId ?? 'all', filterKind],
    queryFn: () =>
      listDocuments({
        classId: classId || undefined,
        kind: filterKind || undefined,
      }),
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadDocument(user!.id, file, { class_id: classId ?? null, kind }),
    onSuccess: () => {
      setUploadError('');
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (e) => setUploadError((e as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (doc: DocumentRow) => deleteDocument(doc),
    onSuccess: () => {
      setConfirmDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const openMutation = useMutation({
    mutationFn: (doc: DocumentRow) => getDocumentUrl(doc),
    onSuccess: (url) => window.open(url, '_blank'),
  });

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    void uploadMutation
      .mutateAsync(file)
      .finally(() => {
        setUploading(false);
        if (fileInput.current) fileInput.current.value = '';
      });
  };

  const cls = classId
    ? (classSummaries ?? []).find((s) => s.classRow.id === classId)?.classRow
    : null;
  const docs = docsQ.data ?? [];

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-mono font-bold text-lg text-accent text-glow label-term">
          {cls ? `~/documents/${cls.name.toLowerCase().replace(/\s+/g, '-')}` : '~/documents'}
        </h1>
        {classId ? (
          <Link to={`/classroom/${classId}`} className="font-mono text-xs text-dim hover:text-accent">
            ← kelas
          </Link>
        ) : (
          <span className="font-mono text-xs text-dim">semua dokumen</span>
        )}
      </header>

      <PixelCard title="upload" accent>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DocumentKind)}
            className="bg-bg text-fg border border-line-strong px-2 py-1.5 font-mono text-xs"
            aria-label="Jenis dokumen"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <input
            ref={fileInput}
            type="file"
            onChange={(e) => handleFile(e.target.files)}
            className="text-xs font-mono text-dim file:mr-2 file:font-mono file:text-xs file:px-2 file:py-1 file:border file:border-accent-dim file:bg-transparent file:text-accent"
            aria-label="Pilih file"
          />
          {uploading && <span className="font-mono text-xs text-dim">mengunggah…</span>}
          {uploadError && (
            <span className="font-mono text-xs text-fg">ERROR: {uploadError}</span>
          )}
          <span className="flex-1" />
          <span className="font-mono text-micro-label text-dimmer">
            {cls ? `kelas: ${cls.name} · ` : ''}maks 50MB · PDF/DOCX/XLSX/PPT/PNG/JPG
          </span>
        </div>
      </PixelCard>

      <div className="flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => setFilterKind('')}
          className={`font-mono text-micro-label px-1.5 py-0.5 border ${
            filterKind === '' ? 'text-accent border-accent-dim' : 'text-dimmer border-line-strong'
          }`}
        >
          SEMUA
        </button>
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            onClick={() => setFilterKind(k.value)}
            className={`font-mono text-micro-label px-1.5 py-0.5 border ${
              filterKind === k.value
                ? 'text-accent border-accent-dim'
                : 'text-dimmer border-line-strong'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {docsQ.isLoading && <p className="font-mono text-xs text-dim">loading…</p>}

      {!docsQ.isLoading && docs.length === 0 && (
        <EmptyState
          title="BELUM ADA DOKUMEN"
          hint="Upload modul ajar, LKPD, soal, atau dokumen lainnya."
        />
      )}

      <div className="space-y-2">
        {docs.map((d) => (
          <PixelCard key={d.id} className="hover:border-accent-dim transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-fg truncate">{d.title}</p>
                <p className="font-mono text-micro-label text-dimmer mt-0.5">
                  {KIND_LABEL[d.kind]} · {d.mime_type.split('/').pop() ?? '?'} ·{' '}
                  {formatSize(d.size_bytes)}
                </p>
              </div>
              <PixelButton
                variant="secondary"
                onClick={() => openMutation.mutate(d)}
                disabled={openMutation.isPending}
              >
                BUKA ↗
              </PixelButton>
              <button
                type="button"
                onClick={() => setConfirmDelete(d)}
                className="font-mono text-xs text-dim hover:text-fg"
                aria-label={`Hapus ${d.title}`}
              >
                [HAPUS]
              </button>
            </div>
          </PixelCard>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDelete != null}
        title="HAPUS DOKUMEN?"
        message={confirmDelete ? `${confirmDelete.title} akan dihapus permanen dari penyimpanan.` : ''}
        confirmLabel="HAPUS"
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete)}
      />
    </main>
  );
}
