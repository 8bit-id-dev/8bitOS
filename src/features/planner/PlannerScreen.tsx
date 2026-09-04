import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listClassesForUser, listPlans, upsertPlan, type PlanDraft } from '@/shared/db/queries';
import type { Plan, PlanStatus } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { addWeeks, formatWeekRange, planProgress, planLabel, weekStartFor } from './planner.helpers';

const STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'DRAFT',
  ready: 'SIAP',
  done: 'SELESAI',
};

const FIELDS: Array<{ key: keyof Pick<PlanDraft, 'topic' | 'goals' | 'method' | 'media' | 'activities' | 'reflection'>; label: string }> = [
  { key: 'topic', label: 'TOPIK' },
  { key: 'goals', label: 'TUJUAN' },
  { key: 'method', label: 'METODE' },
  { key: 'media', label: 'MEDIA' },
  { key: 'activities', label: 'AKTIVITAS' },
  { key: 'reflection', label: 'REFLEKSI' },
];

const emptyDraft = (weekStart: string): PlanDraft => ({
  class_id: null,
  subject_id: null,
  week_start: weekStart,
  topic: '',
  goals: '',
  method: '',
  media: '',
  activities: '',
  reflection: '',
  status: 'draft',
});

export function PlannerScreen() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);

  const weekStart = useMemo(
    () => addWeeks(weekStartFor(new Date()), weekOffset),
    [weekOffset],
  );

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const plansQ = useQuery({
    queryKey: ['plans', user?.id ?? 'anon', weekStart],
    queryFn: () => listPlans(user!.id, weekStart),
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: () => upsertPlan(user!.id, draft!),
    onSuccess: () => {
      setDraft(null);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const plans = plansQ.data ?? [];
  const progress = planProgress(plans);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft(weekStart));
  };

  const openEdit = (p: Plan) => {
    setEditing(p);
    setDraft({
      class_id: p.class_id,
      subject_id: p.subject_id,
      week_start: p.week_start,
      topic: p.topic,
      goals: p.goals,
      method: p.method,
      media: p.media,
      activities: p.activities,
      reflection: p.reflection,
      status: p.status,
    });
  };

  const set = (key: keyof PlanDraft, value: string) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value } as PlanDraft);
  };

  const classOptions = (classSummaries ?? []).map((s) => s.classRow);

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/planner
        </h1>
        <div className="flex items-center gap-2 font-sans text-pixel-sm">
          <button
            type="button"
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="text-gray-300 hover:text-fg px-1"
            aria-label="Minggu sebelumnya"
          >
            ←
          </button>
          <span className="text-fg">{formatWeekRange(weekStart)}</span>
          <button
            type="button"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="text-gray-300 hover:text-fg px-1"
            aria-label="Minggu berikutnya"
          >
            →
          </button>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="text-gray-300 border border-line-strong px-1.5 hover:border-fg"
            >
              hari ini
            </button>
          )}
        </div>
      </header>

      <div className="flex items-center justify-between">
        <p className="font-sans text-pixel-sm text-gray-300">
          kesiapan: <span className="text-fg">{progress.ready}/{progress.total}</span> siap
        </p>
        <PixelButton onClick={openNew}>+ RENCANA</PixelButton>
      </div>

      {plansQ.isLoading && <p className="font-sans text-pixel-sm text-gray-300">loading…</p>}

      {!plansQ.isLoading && plans.length === 0 && (
        <EmptyState
          title="BELUM ADA RENCANA MINGGU INI"
          hint="Buat rencana pembelajaran: topik, tujuan, metode, aktivitas."
        />
      )}

      {draft && (
        <PixelCard title={editing ? 'edit_rencana' : 'rencana_baru'} accent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={draft.class_id ?? ''}
                onChange={(e) =>
                  setDraft({ ...draft, class_id: e.target.value || null })
                }
                className="bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm flex-1"
                aria-label="Kelas"
              >
                <option value="">— pilih kelas —</option>
                {classOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft({ ...draft, status: e.target.value as PlanStatus })
                }
                className="bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm"
                aria-label="Status"
              >
                {(Object.keys(STATUS_LABEL) as PlanStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            {FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="font-sans micro-pixel label-pixel text-gray-300">
                  {f.label}
                </span>
                <textarea
                  value={draft[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  rows={f.key === 'topic' ? 1 : 2}
                  className="w-full mt-1 bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm focus-visible:border-fg resize-y"
                />
              </label>
            ))}

            <div className="flex gap-2 justify-end">
              <PixelButton variant="secondary" onClick={() => setDraft(null)}>
                BATAL
              </PixelButton>
              <PixelButton
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'MENYIMPAN…' : 'SIMPAN'}
              </PixelButton>
            </div>
            {saveMutation.isError && (
              <p className="font-sans text-pixel-sm text-fg">
                ERROR: {(saveMutation.error as Error).message}
              </p>
            )}
          </div>
        </PixelCard>
      )}

      <div className="space-y-2">
        {plans.map((p) => {
          const cls = classOptions.find((c) => c.id === p.class_id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => openEdit(p)}
              className="panel w-full text-left px-3 py-2 hover:border-fg transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-pixel-sm text-fg truncate">
                  {planLabel(p)}
                </span>
                <span
                  className={`font-sans micro-pixel px-1 border ${
                    p.status === 'done'
                      ? 'text-fg border-line-strong'
                      : p.status === 'ready'
                        ? 'text-fg border-line-strong'
                        : 'text-gray-300 border-line-strong'
                  }`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              {cls && <p className="font-sans text-pixel-sm text-gray-300 mt-0.5">{cls.name}</p>}
              {p.goals && (
                <p className="font-sans text-pixel-sm text-gray-500 mt-0.5 truncate">{p.goals}</p>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
