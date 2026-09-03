import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/db/supabase';
import {
  createAiJob,
  finishAiJob,
  listAiJobs,
  listClassesForUser,
  saveAiResponseToNote,
  type AiJobDraft,
} from '@/shared/db/queries';
import type { AiJob } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { PixelButton } from '@/shared/components/PixelButton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  AI_TEMPLATES,
  KIND_LABEL,
  localFallbackResponse,
  type AiKind,
} from './ai.helpers';

const AI_ENDPOINT = 'https://nzamuxnrrqlqdtwdisrt.supabase.co/functions/v1/ai-generate';

export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<AiKind>('modul_ajar');
  const [input, setInput] = useState('');
  const [classContext, setClassContext] = useState<string>('');
  const [activeJob, setActiveJob] = useState<AiJob | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  const jobsQ = useQuery({
    queryKey: ['ai-jobs'],
    queryFn: () => listAiJobs(10),
    enabled: Boolean(user && open),
  });

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user && open),
    staleTime: 60_000,
  });

  const template = useMemo(
    () => AI_TEMPLATES.find((t) => t.kind === kind),
    [kind],
  );

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('NO_AUTH');
      const ctx = classContext || undefined;
      const prompt = template ? template.build(input, ctx) : input;
      const draft: AiJobDraft = {
        kind,
        prompt,
        linked_class_id: classContext || null,
      };
      const job = await createAiJob(user.id, draft);

      // Real AI gateway: Supabase edge function -> Gemini 3.6 Flash.
      // Falls back to local structured outline when unreachable.
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token ?? '';
        const res = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { response?: string };
        if (!data.response) throw new Error('EMPTY');
        return finishAiJob(job.id, data.response);
      } catch {
        // Gateway unreachable — local structured fallback, still audited.
        return finishAiJob(job.id, localFallbackResponse(kind, input));
      }
    },
    onSuccess: (job) => {
      setActiveJob(job);
      void queryClient.invalidateQueries({ queryKey: ['ai-jobs'] });
    },
    onError: (e) => {
      setActiveJob(null);
      setSavedMsg(`ERROR: ${(e as Error).message}`);
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: () => saveAiResponseToNote(user!.id, activeJob!),
    onSuccess: () => {
      setSavedMsg('● tersimpan ke notes');
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTimeout(() => setSavedMsg(''), 2500);
    },
  });

  useEffect(() => {
    if (!open) {
      setInput('');
      setActiveJob(null);
      setSavedMsg('');
    }
  }, [open]);

  if (!open) return null;

  const busy = generateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70" role="dialog" aria-label="AI Assistant">
      <div
        className="panel-accent w-[480px] max-w-[92vw] h-full flex flex-col shadow-glow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-header-h flex items-center justify-between px-3 border-b border-accent-dim">
          <h2 className="font-mono text-xs label-term text-accent text-glow">
            8bit AI · asisten guru
          </h2>
          <button
            type="button"
            onClick={() => (busy ? setConfirmClose(true) : onClose())}
            className="font-mono text-xs text-dim hover:text-accent"
            aria-label="Tutup panel AI"
          >
            [X]
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Templates */}
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setKind('free')}
              className={`font-mono text-micro-label px-1.5 py-1 border ${
                kind === 'free' ? 'bg-accent text-bg border-accent' : 'text-dim border-line-strong'
              }`}
            >
              {KIND_LABEL.free}
            </button>
            {AI_TEMPLATES.map((t) => (
              <button
                key={t.kind}
                type="button"
                onClick={() => setKind(t.kind)}
                className={`font-mono text-micro-label px-1.5 py-1 border ${
                  kind === t.kind ? 'bg-accent text-bg border-accent' : 'text-dim border-line-strong'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Context class */}
          <select
            value={classContext}
            onChange={(e) => setClassContext(e.target.value)}
            className="w-full bg-bg text-fg border border-line-strong px-2 py-1.5 font-mono text-xs"
            aria-label="Konteks kelas (opsional)"
          >
            <option value="">— tanpa konteks kelas —</option>
            {(classSummaries ?? []).map((s) => (
              <option key={s.classRow.id} value={s.classRow.name}>
                {s.classRow.name}
              </option>
            ))}
          </select>

          {/* Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder={template ? template.placeholder : 'tulis permintaan untuk AI…'}
            className="w-full bg-bg text-fg border border-line-strong px-2 py-1.5 font-mono text-xs focus-visible:border-accent resize-y"
            aria-label="Permintaan AI"
          />

          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-dim" aria-live="polite">
              {savedMsg}
            </span>
            <PixelButton
              onClick={() => generateMutation.mutate()}
              disabled={busy || !input.trim()}
            >
              {busy ? 'MEMPROSES…' : 'HASILKAN →'}
            </PixelButton>
          </div>

          {/* Active response */}
          {activeJob && (
            <div className="panel p-3">
              <p className="font-mono text-micro-label text-dim mb-1 label-term">
                {KIND_LABEL[(activeJob.kind as AiKind) ?? 'free'] ?? activeJob.kind} · jawaban
              </p>
              <pre className="font-mono text-xs text-fg whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">
                {activeJob.response}
              </pre>
              <div className="flex justify-end mt-2">
                <PixelButton
                  variant="secondary"
                  onClick={() => saveNoteMutation.mutate()}
                  disabled={saveNoteMutation.isPending}
                >
                  {saveNoteMutation.isPending ? 'MENYIMPAN…' : '+ SIMPAN KE NOTES'}
                </PixelButton>
              </div>
            </div>
          )}

          {/* History */}
          <div className="panel">
            <p className="font-mono text-micro-label text-dim px-2 py-1 border-b hairline label-term">
              riwayat
            </p>
            {(jobsQ.data ?? []).length === 0 ? (
              <p className="font-mono text-xs text-dimmer p-2">belum ada riwayat</p>
            ) : (
              <ul>
                {(jobsQ.data ?? []).map((j) => (
                  <li key={j.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setActiveJob(j)}
                      className="w-full text-left px-2 py-1.5 hover:bg-bg-raised"
                    >
                      <p className="font-mono text-xs text-fg truncate">
                        {j.prompt.slice(0, 70)}
                      </p>
                      <p className="font-mono text-micro-label text-dimmer">
                        {KIND_LABEL[(j.kind as AiKind) ?? 'free'] ?? j.kind} ·{' '}
                        {j.status === 'done' ? 'selesai' : j.status}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClose}
        title="TUTUP SAAT MEMPROSES?"
        message="Permintaan AI sedang berjalan. Jika ditutup, hasil mungkin tidak tersimpan."
        confirmLabel="TETAP TUTUP"
        destructive
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
      />
    </div>
  );
}
