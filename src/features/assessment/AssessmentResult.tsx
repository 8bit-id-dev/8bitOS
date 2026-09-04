import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { listAttempts, listClassesForUser, listQuestions, listStudentsByClass } from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { classAverage } from '@/features/gradebook/gradebook.helpers';

export function AssessmentResult() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>();
  const { user } = useSession();

  const attemptsQ = useQuery({
    queryKey: ['attempts', assessmentId],
    queryFn: () => listAttempts(assessmentId),
    enabled: Boolean(assessmentId),
  });

  const questionsQ = useQuery({
    queryKey: ['questions', assessmentId],
    queryFn: () => listQuestions(assessmentId),
    enabled: Boolean(assessmentId),
  });

  const studentsQ = useQuery({
    queryKey: ['run-students', assessmentId],
    queryFn: async () => {
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

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });
  void classSummaries;

  const attempts = attemptsQ.data ?? [];
  const questions = questionsQ.data ?? [];
  void questions;
  const students = studentsQ.data ?? [];
  const studentById = new Map(students.map((s) => [s.id, s]));

  const scores = attempts.map((a) => a.score);
  const avg = classAverage(scores);
  const highest = scores.filter((s): s is number => s != null);
  const max = highest.length > 0 ? Math.max(...highest) : null;
  const min = highest.length > 0 ? Math.min(...highest) : null;

  const passCount = attempts.filter((a) => (a.score ?? 0) >= 70).length;

  if (attemptsQ.isLoading) {
    return <p className="p-4 font-sans text-pixel-sm text-gray-300">loading…</p>;
  }

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/hasil
        </h1>
        <Link to="/assessment" className="font-sans text-pixel-sm text-gray-300 hover:text-fg">
          ← daftar
        </Link>
      </header>

      <PixelCard title="statistik" accent>
        <div className="grid grid-cols-5 gap-2 text-center font-sans">
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">TERKOREKSI</p>
            <p className="text-body font-bold text-fg">
              {attempts.filter((a) => a.score != null).length}/{students.length || attempts.length}
            </p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">RATA²</p>
            <p className="text-body font-bold text-fg">{avg ?? '—'}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">TERTINGGI</p>
            <p className="text-body font-bold text-fg">{max ?? '—'}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">TERENDAH</p>
            <p className="text-body font-bold text-fg">{min ?? '—'}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">TUNTAS ≥70</p>
            <p className="text-body font-bold text-fg">
              {passCount}/{attempts.length}
            </p>
          </div>
        </div>
      </PixelCard>

      <PixelCard title={`peringkat (${attempts.length})`}>
        {attempts.length === 0 ? (
          <EmptyState title="BELUM ADA KOREKSI" hint="Koreksi jawaban siswa terlebih dahulu." />
        ) : (
          <ul className="flex flex-col">
            {[...attempts]
              .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
              .map((a, i) => {
                const s = studentById.get(a.student_id);
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 border-b border-line last:border-b-0 py-1.5 font-sans text-pixel-sm"
                  >
                    <span className="text-gray-500 w-8 text-right">{i + 1}.</span>
                    <span className="flex-1 text-fg">{s?.full_name ?? '—'}</span>
                    <span
                      className={(a.score ?? 0) >= 70 ? 'text-fg' : 'text-fg'}
                    >
                      {a.score ?? '—'}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </PixelCard>

      <div>
        <Link to={`/assessment/${assessmentId}/run`}>
          <PixelButton variant="secondary">← KOREKSI</PixelButton>
        </Link>
      </div>
    </main>
  );
}
