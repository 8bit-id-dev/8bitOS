import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';import {
  listAttemptAnswers,
  listAttempts,
  listQuestions,
  listStudentsByClass,
  saveAttempt,
} from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { attemptScore, gradeAnswer, isObjective, toPercent, TYPE_LABEL } from './assessment.helpers';

const TF_OPTIONS = ['BENAR', 'SALAH'];

export function AssessmentRun() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const questionsQ = useQuery({
    queryKey: ['questions', assessmentId],
    queryFn: () => listQuestions(assessmentId),
    enabled: Boolean(assessmentId),
  });

  const attemptsQ = useQuery({
    queryKey: ['attempts', assessmentId],
    queryFn: () => listAttempts(assessmentId),
    enabled: Boolean(assessmentId),
  });

  const studentsQ = useQuery({
    queryKey: ['run-students', assessmentId],
    queryFn: async () => {
      // Get assessment to find classId
      const { supabase } = await import('@/shared/db/supabase');
      const { data: a } = await supabase
        .from('assessments')
        .select('class_id')
        .eq('id', assessmentId)
        .maybeSingle();
      if (!a?.class_id) return [];
      return listStudentsByClass(a.class_id as string);
    },
    enabled: Boolean(assessmentId),
  });

  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<string>('');

  const questions = questionsQ.data ?? [];
  const attempts = attemptsQ.data ?? [];
  const students = studentsQ.data ?? [];
  const attemptByStudent = useMemo(
    () => new Map(attempts.map((a) => [a.student_id, a])),
    [attempts],
  );

  const activeStudent = students.find((s) => s.id === activeStudentId) ?? null;

  const pick = (studentId: string) => {
    setActiveStudentId(studentId);
    setSaveState('');
    // Pre-fill from saved attempt answers
    const attempt = attemptByStudent.get(studentId);
    if (!attempt) {
      setResponses({});
      return;
    }
    void (async () => {
      const answers = await listAttemptAnswers(attempt.id);
      const map: Record<string, string> = {};
      for (const ans of answers) {
        if (ans.response != null) map[ans.question_id] = String(ans.response);
      }
      setResponses(map);
    })();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!activeStudent || !user) throw new Error('NO_SELECTION');
      const scores: Record<string, { score: number; isCorrect: boolean }> = {};
      const storedResponses: Record<string, string | null> = {};
      for (const q of questions) {
        const resp = responses[q.id] ?? null;
        storedResponses[q.id] = resp;
        if (isObjective(q)) {
          scores[q.id] = gradeAnswer(q, resp);
        } else {
          // Manual score kept as-is from input; default 0
          scores[q.id] = { score: Number(responses[`${q.id}__score`] ?? 0) || 0, isCorrect: false };
        }
      }
      const { total } = attemptScore(questions, storedResponses);
      const manualTotal = Object.entries(storedResponses).reduce((acc, [qid, _]) => {
        const manual = Number(responses[`${qid}__score`] ?? 0) || 0;
        return acc + manual;
      }, 0);
      const finalTotal = total + manualTotal;
      const max = questions.reduce((acc, q) => acc + q.points, 0);

      await saveAttempt(user.id, {
        assessment_id: assessmentId,
        student_id: activeStudent.id,
        responses: storedResponses,
        scores,
        totalScore: toPercent(finalTotal, max),
        maxScore: max,
      });
    },
    onSuccess: () => {
      setSaveState('● tersimpan');
      void queryClient.invalidateQueries({ queryKey: ['attempts', assessmentId] });
    },
    onError: (e) => setSaveState(`ERROR: ${(e as Error).message}`),
  });

  if (questionsQ.isLoading) {
    return <p className="p-4 font-mono text-xs text-dim">loading…</p>;
  }
  if (questions.length === 0) {
    return (
      <main className="p-4 space-y-3">
        <EmptyState title="BELUM ADA SOAL" hint="Tambahkan soal di editor asesmen." />
        <Link to={`/assessment/${assessmentId}/edit`} className="font-mono text-xs text-accent">
          ← editor
        </Link>
      </main>
    );
  }

  const scoredCount = attempts.filter((a) => a.score != null).length;

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-mono font-bold text-lg text-accent text-glow label-term">
          ~/koreksi
        </h1>
        <span className="font-mono text-xs text-dim">
          {scoredCount}/{students.length} terkoreksi · {questions.length} soal
        </span>
      </header>

      <div className="flex gap-2">
        <Link to={`/assessment/${assessmentId}/edit`}>
          <PixelButton variant="secondary">← SOAL</PixelButton>
        </Link>
        <Link to={`/assessment/${assessmentId}/result`}>
          <PixelButton variant="secondary">HASIL →</PixelButton>
        </Link>
      </div>

      <PixelCard title="pilih_siswa">
        {students.length === 0 ? (
          <p className="font-mono text-xs text-dim">
            kelas belum dipilih di editor, atau belum ada siswa
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {students.map((s) => {
              const attempt = attemptByStudent.get(s.id);
              const isActive = s.id === activeStudentId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pick(s.id)}
                  className={`font-mono text-xs px-2 py-1 border ${
                    isActive
                      ? 'bg-accent text-bg border-accent'
                      : attempt?.score != null
                        ? 'text-accent border-accent-dim'
                        : 'text-dim border-line-strong'
                  }`}
                >
                  {s.full_name.split(' ')[0]}
                  {attempt?.score != null && ` · ${attempt.score}`}
                </button>
              );
            })}
          </div>
        )}
      </PixelCard>

      {activeStudent && (
        <PixelCard title={`jawaban — ${activeStudent.full_name}`} accent>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="space-y-1.5">
                <p className="font-mono text-xs text-fg">
                  <span className="text-dimmer">{i + 1}.</span> {q.prompt}
                </p>
                {q.type === 'tf' ? (
                  <div className="flex gap-1">
                    {TF_OPTIONS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setResponses({ ...responses, [q.id]: v })}
                        className={`font-mono text-xs px-3 py-1 border ${
                          responses[q.id] === v
                            ? 'bg-accent text-bg border-accent'
                            : 'text-dim border-line-strong'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : q.type === 'mc' ? (
                  <div className="flex flex-wrap gap-1">
                    {q.options.map((opt, oi) => {
                      const key = String.fromCharCode(65 + oi);
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => setResponses({ ...responses, [q.id]: key })}
                          className={`font-mono text-xs px-2 py-1 border ${
                            responses[q.id] === key
                              ? 'bg-accent text-bg border-accent'
                              : 'text-dim border-line-strong'
                          }`}
                        >
                          {key}. {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      value={responses[q.id] ?? ''}
                      onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                      placeholder={`jawaban ${TYPE_LABEL[q.type]}…`}
                      className="flex-1 bg-bg text-fg border border-line-strong px-2 py-1 font-mono text-xs"
                      aria-label={`Jawaban soal ${i + 1}`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={q.points}
                      step={0.5}
                      value={responses[`${q.id}__score`] ?? ''}
                      onChange={(e) =>
                        setResponses({ ...responses, [`${q.id}__score`]: e.target.value })
                      }
                      placeholder="0"
                      className="w-16 bg-bg text-fg border border-line-strong px-2 py-1 font-mono text-xs"
                      aria-label={`Skor manual soal ${i + 1}`}
                    />
                    <span className="font-mono text-xs text-dimmer">/{q.points}</span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-dim" aria-live="polite">
                {saveState}
              </span>
              <PixelButton
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'MENYIMPAN…' : 'SIMPAN KOREKSI'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}
    </main>
  );
}
