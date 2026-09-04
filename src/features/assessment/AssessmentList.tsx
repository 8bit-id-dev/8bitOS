import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listAssessments, listClassesForUser } from '@/shared/db/queries';
import type { AssessmentType } from '@/shared/db/types';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';

const TYPE_LABEL: Record<AssessmentType, string> = {
  quiz: 'QUIZ',
  daily_test: 'UH',
  assignment: 'TUGAS',
  midterm: 'PTS',
  final: 'PAS',
  practice: 'LATIHAN',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'DRAFT',
  published: 'TERBIT',
  closed: 'TUTUP',
};

export function AssessmentList() {
  const { user } = useSession();

  const { data: classSummaries } = useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', user?.id ?? 'anon'],
    queryFn: () => listAssessments(user!.id),
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const classById = new Map((classSummaries ?? []).map((s) => [s.classRow.id, s.classRow]));

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/assessment
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">
          {assessments?.length ?? 0} asesmen
        </span>
      </header>

      {isLoading && <p className="font-sans text-pixel-sm text-gray-300">loading…</p>}

      {!isLoading && (assessments?.length ?? 0) === 0 && (
        <div className="space-y-3">
          <EmptyState
            title="BELUM ADA ASESMEN"
            hint="Buat quiz, ulangan, atau tugas pertama."
          />
          <div>
            <Link to="/assessment/new">
              <PixelButton>+ ASESMEN BARU</PixelButton>
            </Link>
          </div>
        </div>
      )}

      {(assessments?.length ?? 0) > 0 && (
        <div>
          <Link to="/assessment/new">
            <PixelButton variant="secondary">+ ASESMEN BARU</PixelButton>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {(assessments ?? []).map((a) => {
          const cls = a.class_id ? classById.get(a.class_id) : null;
          return (
            <PixelCard key={a.id} className="hover:border-fg transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-sans text-small text-fg truncate">{a.title}</p>
                  <p className="font-sans text-pixel-sm text-gray-300 mt-0.5">
                    {TYPE_LABEL[a.type]} · {cls?.name ?? 'tanpa kelas'} ·{' '}
                    <span className={a.status === 'published' ? 'text-fg' : 'text-gray-300'}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/assessment/${a.id}/run`}>
                    <PixelButton variant="secondary">KOREKSI</PixelButton>
                  </Link>
                  <Link to={`/assessment/${a.id}/result`}>
                    <PixelButton variant="secondary">HASIL</PixelButton>
                  </Link>
                  <Link to={`/assessment/${a.id}/edit`}>
                    <PixelButton variant="ghost">EDIT</PixelButton>
                  </Link>
                </div>
              </div>
            </PixelCard>
          );
        })}
      </div>
    </main>
  );
}
