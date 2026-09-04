import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listClassesForUser, type ClassSummary } from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { EmptyState } from '@/shared/components/EmptyState';
import { PixelButton } from '@/shared/components/PixelButton';

const useClassList = () => {
  const { user } = useSession();
  return useQuery({
    queryKey: ['classes', user?.id ?? 'anon'],
    queryFn: () => listClassesForUser(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
  });
};

const ClassRowView = ({ s }: { s: ClassSummary }) => {
  const c = s.classRow;
  return (
    <Link
      to={`/classroom/${c.id}`}
      className="block panel px-3 py-2 hover:border-fg hover: transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-sans font-bold text-base text-fg">{c.name}</h3>
        <span className="font-sans micro-pixel text-gray-500">{c.academic_year}</span>
      </div>
      <p className="font-sans text-pixel-sm text-gray-300 mt-0.5">
        homeroom: {c.homeroom || ''}  siswa: {s.studentCount}
      </p>
      {s.subjectNames.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1.5">
          {s.subjectNames.map((name) => (
            <span
              key={name}
              className="font-sans micro-pixel px-1 border border-line-strong text-gray-300"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};

export function ClassList() {
  const { user } = useSession();
  const { data, isLoading, error } = useClassList();

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/classroom
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">{user?.email ?? ''}</span>
      </header>

      {isLoading && <p className="font-sans text-pixel-sm text-gray-300">loading……</p>}

      {error && (
        <div className="panel-strong p-3">
          <p className="font-sans text-pixel-sm text-fg">BACKEND TIDAK TERHUBUNG.</p>
          <p className="font-sans text-pixel-sm text-gray-300 mt-1">{(error as Error).message}</p>
        </div>
      )}

      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <EmptyState title="BELUM ADA KELAS" hint="Tambahkan kelas setelah backend siap." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(data ?? []).map((s) => (
          <ClassRowView key={s.classRow.id} s={s} />
        ))}
      </div>

      <div>
        <PixelButton variant="ghost" disabled>
          + kelas baru [soon]
        </PixelButton>
      </div>
    </main>
  );
}
