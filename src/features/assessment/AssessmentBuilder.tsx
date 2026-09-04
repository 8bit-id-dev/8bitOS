import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  createAssessment,
  createQuestion,
  deleteAssessment,
  deleteQuestion,
  listAssessments,
  listClassesForUser,
  listQuestions,
  updateAssessment,
  updateQuestion,
  type AssessmentDraft,
  type QuestionDraft,
} from '@/shared/db/queries';
import type { AssessmentStatus, AssessmentType, Question, QuestionType } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { MathText } from '@/shared/components/math';
import { TYPE_OPTIONS } from './assessment.helpers';

const ASSESSMENT_TYPES: Array<{ value: AssessmentType; label: string }> = [
  { value: 'quiz', label: 'QUIZ' },
  { value: 'daily_test', label: 'ULANGAN HARIAN' },
  { value: 'assignment', label: 'TUGAS' },
  { value: 'midterm', label: 'PENILAIAN TENGAH' },
  { value: 'final', label: 'PENILAIAN AKHIR' },
  { value: 'practice', label: 'LATIHAN' },
];

const STATUS_OPTIONS: Array<{ value: AssessmentStatus; label: string }> = [
  { value: 'draft', label: 'DRAFT' },
  { value: 'published', label: 'TERBIT' },
  { value: 'closed', label: 'TUTUP' },
];

const TF_OPTIONS = ['BENAR', 'SALAH'];

export function AssessmentBuilder() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const isEdit = Boolean(assessmentId);
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [meta, setMeta] = useState<AssessmentDraft>({
    class_id: null,
    subject_id: null,
    title: '',
    type: 'quiz',
    status: 'draft',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [qDraft, setQDraft] = useState<QuestionDraft | null>(null);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const assessmentsQ = useQuery({
    queryKey: ['assessments', user?.id ?? 'anon'],
    queryFn: () => listAssessments(user!.id),
    enabled: Boolean(user && isEdit),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isEdit || !assessmentsQ.data) return;
    const a = assessmentsQ.data.find((x) => x.id === assessmentId);
    if (a) {
      setMeta({
        class_id: a.class_id,
        subject_id: a.subject_id,
        title: a.title,
        type: a.type,
        status: a.status,
      });
    }
  }, [isEdit, assessmentsQ.data, assessmentId]);

  const questionsQ = useQuery({
    queryKey: ['questions', assessmentId],
    queryFn: () => listQuestions(assessmentId!),
    enabled: Boolean(assessmentId),
  });

  const saveMetaMutation = useMutation({
    mutationFn: async () => {
      if (isEdit && assessmentId) return updateAssessment(assessmentId, meta);
      return createAssessment(user!.id, meta);
    },
    onSuccess: (a) => {
      void queryClient.invalidateQueries({ queryKey: ['assessments'] });
      if (!isEdit) navigate(`/assessment/${a.id}/edit`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAssessment(assessmentId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['assessments'] });
      navigate('/assessment');
    },
  });

  const saveQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!qDraft) throw new Error('NO_DRAFT');
      if (editingQ) return updateQuestion(editingQ.id, qDraft);
      return createQuestion(user!.id, qDraft);
    },
    onSuccess: () => {
      setQDraft(null);
      setEditingQ(null);
      void queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (qid: string) => deleteQuestion(qid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] });
    },
  });

  const questions = questionsQ.data ?? [];
  const classOptions = (classSummaries ?? []).map((s) => s.classRow);

  const openNewQuestion = () => {
    setEditingQ(null);
    setQDraft({
      assessment_id: assessmentId ?? '',
      position: questions.length,
      type: 'mc',
      prompt: '',
      options: ['', '', '', ''],
      answer_key: null,
      points: 1,
    });
  };

  const openEditQuestion = (q: Question) => {
    setEditingQ(q);
    setQDraft({
      assessment_id: q.assessment_id,
      position: q.position,
      type: q.type,
      prompt: q.prompt,
      options: q.options?.length ? q.options : ['', '', '', ''],
      answer_key: q.answer_key,
      points: q.points,
    });
  };

  const isTf = qDraft?.type === 'tf';
  const needsOptions = qDraft?.type === 'mc' || qDraft?.type === 'mc_multi';

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          {isEdit ? '~/assessment/edit' : '~/assessment/new'}
        </h1>
        <Link to="/assessment" className="font-sans text-pixel-sm text-gray-300 hover:text-fg">
          ← daftar
        </Link>
      </header>

      <PixelCard title="identitas" accent>
        <div className="space-y-3">
          <input
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            placeholder="judul asesmen…"
            className="w-full bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-small focus-visible:border-fg"
            aria-label="Judul"
          />
          <div className="flex gap-2">
            <select
              value={meta.class_id ?? ''}
              onChange={(e) => setMeta({ ...meta, class_id: e.target.value || null })}
              className="flex-1 bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm"
              aria-label="Kelas"
            >
              <option value="">— kelas —</option>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={meta.type}
              onChange={(e) => setMeta({ ...meta, type: e.target.value as AssessmentType })}
              className="bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm"
              aria-label="Jenis"
            >
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={meta.status}
              onChange={(e) => setMeta({ ...meta, status: e.target.value as AssessmentStatus })}
              className="bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm"
              aria-label="Status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <PixelButton
              onClick={() => saveMetaMutation.mutate()}
              disabled={saveMetaMutation.isPending || (!isEdit && !meta.title.trim())}
            >
              {saveMetaMutation.isPending
                ? 'MENYIMPAN…'
                : isEdit
                  ? 'SIMPAN IDENTITAS'
                  : 'BUAT ASESMEN →'}
            </PixelButton>
          </div>
          {saveMetaMutation.isError && (
            <p className="font-sans text-pixel-sm text-fg">
              ERROR: {(saveMetaMutation.error as Error).message}
            </p>
          )}
        </div>
      </PixelCard>

      {isEdit && (
        <>
          <PixelCard title={`soal (${questions.length})`}>
            {questions.length === 0 && (
              <p className="font-sans text-pixel-sm text-gray-300">belum ada soal</p>
            )}
            <ul className="flex flex-col">
              {questions.map((q, i) => (
                <li
                  key={q.id}
                  className="flex items-start gap-2 border-b border-line last:border-b-0 py-1.5"
                >
                  <span className="font-sans text-pixel-sm text-gray-500 w-8 text-right pt-0.5">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* Prompt dirender dengan inline $latex$ (Dok 09 §17 MathText) */}
                    <MathText text={q.prompt || '(kosong)'} />
                    <p className="font-sans micro-pixel text-gray-500 mt-0.5">
                      {TYPE_OPTIONS.find((t) => t.value === q.type)?.label} · {q.points} poin
                      {q.answer_key != null && ` · kunci: ${q.answer_key}`}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditQuestion(q)}
                      className="font-sans text-pixel-sm text-gray-300 hover:text-fg"
                    >
                      [EDIT]
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestionMutation.mutate(q.id)}
                      className="font-sans text-pixel-sm text-gray-300 hover:text-fg"
                    >
                      [HAPUS]
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <PixelButton variant="secondary" onClick={openNewQuestion}>
                + SOAL
              </PixelButton>
            </div>
          </PixelCard>

          {qDraft && (
            <PixelCard title={editingQ ? 'edit_soal' : 'soal_baru'} accent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={qDraft.type}
                    onChange={(e) =>
                      setQDraft({ ...qDraft, type: e.target.value as QuestionType })
                    }
                    className="bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm"
                    aria-label="Tipe soal"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={qDraft.points}
                    onChange={(e) => setQDraft({ ...qDraft, points: Number(e.target.value) })}
                    className="w-20 bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm"
                    aria-label="Poin"
                  />
                </div>

                <textarea
                  value={qDraft.prompt}
                  onChange={(e) => setQDraft({ ...qDraft, prompt: e.target.value })}
                  rows={3}
                  placeholder="pertanyaan… (rumus: $latex$)"
                  className="w-full bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-pixel-sm focus-visible:border-fg"
                  aria-label="Pertanyaan"
                />

                {isTf ? (
                  <div>
                    <p className="font-sans micro-pixel text-gray-300 mb-1">KUNCI</p>
                    <div className="flex gap-1">
                      {TF_OPTIONS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQDraft({ ...qDraft, answer_key: v })}
                          className={`font-sans text-pixel-sm px-3 py-1 border ${
                            qDraft.answer_key === v
                              ? 'bg-fg text-bg border-fg'
                              : 'text-gray-300 border-line-strong'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : needsOptions ? (
                  <div className="space-y-2">
                    <p className="font-sans micro-pixel text-gray-300">OPSI</p>
                    {qDraft.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-sans text-pixel-sm text-fg w-5">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const next = [...qDraft.options];
                            next[i] = e.target.value;
                            setQDraft({ ...qDraft, options: next });
                          }}
                          className="flex-1 bg-bg text-fg border border-line-strong px-2 py-1 font-sans text-pixel-sm"
                          aria-label={`Opsi ${String.fromCharCode(65 + i)}`}
                        />
                        <button
                          type="button"
                          onClick={() => setQDraft({ ...qDraft, answer_key: String.fromCharCode(65 + i) })}
                          className={`font-sans text-pixel-sm px-1 border ${
                            qDraft.answer_key === String.fromCharCode(65 + i)
                              ? 'bg-fg text-bg border-fg'
                              : 'text-gray-300 border-line-strong'
                          }`}
                          aria-label={`Jadikan ${String.fromCharCode(65 + i)} kunci`}
                        >
                          KUNCI
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-sans text-pixel-sm text-gray-500">
                    tipe {qDraft.type} — koreksi manual di halaman KOREKSI
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <PixelButton variant="secondary" onClick={() => setQDraft(null)}>
                    BATAL
                  </PixelButton>
                  <PixelButton
                    onClick={() => saveQuestionMutation.mutate()}
                    disabled={saveQuestionMutation.isPending || !qDraft.prompt.trim()}
                  >
                    {saveQuestionMutation.isPending ? 'MENYIMPAN…' : 'SIMPAN SOAL'}
                  </PixelButton>
                </div>
                {saveQuestionMutation.isError && (
                  <p className="font-sans text-pixel-sm text-fg">
                    ERROR: {(saveQuestionMutation.error as Error).message}
                  </p>
                )}
              </div>
            </PixelCard>
          )}

          <div className="flex justify-between items-center">
            <Link to={`/assessment/${assessmentId}/run`}>
              <PixelButton>KOREKSI →</PixelButton>
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="font-sans text-pixel-sm text-gray-300 hover:text-fg"
            >
              [HAPUS ASESMEN]
            </button>
          </div>
        </>
      )}

      {!isEdit && (classSummaries ?? []).length === 0 && (
        <EmptyState title="BUAT KELAS DAHULU" hint="Asesmen membutuhkan kelas." />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="HAPUS ASESMEN?"
        message="Asesmen, soal, dan semua jawaban siswa akan dihapus permanen."
        confirmLabel="HAPUS"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </main>
  );
}
