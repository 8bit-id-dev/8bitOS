import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listClassesForUser, type ClassSummary } from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
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
      className="block border-2 border-fg p-4 bg-bg hover:bg-grays transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-pixel text-lg">{c.name.toUpperCase()}</h3>
        <span className="text-xs text-gray-300 font-pixel">{c.academic_year}</span>
      </div>
      <p className="text-gray-300 text-sm mt-1">Wali: {c.homeroom || '—'}</p>
      <p className="text-gray-300 text-sm">{s.studentCount} siswa</p>
      {s.subjectNames.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {s.subjectNames.map((name) => (
            <span
              key={name}
              className="text-[10px] font-pixel px-1 border-2 border-fg text-gray-300"
            >
              {name.toUpperCase()}
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
    <main className="p-6 space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="font-pixel text-2xl">CLASSROOM</h1>
        <span className="text-xs text-gray-300 font-pixel">
          {user?.email ?? '—'}
        </span>
      </header>

      {isLoading && <p className="font-pixel text-sm text-gray-300">LOADING…</p>}

      {error && (
        <PixelCard>
          <p className="font-pixel text-sm">
            BACKEND TIDAK TERHUBUNG. TUNGGU ATAU PERIKSA JARINGAN.
          </p>
          <p className="text-gray-300 text-xs mt-2">{(error as Error).message}</p>
        </PixelCard>
      )}

      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <EmptyState
          title="BELUM ADA KELAS"
          hint="Tambahkan kelas di halaman ini setelah backend siap."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(data ?? []).map((s) => (
          <ClassRowView key={s.classRow.id} s={s} />
        ))}
      </div>

      <div>
        <PixelButton variant="secondary" disabled>
          + KELAS BARU <span className="ml-2 text-[10px]">[ SOON ]</span>
        </PixelButton>
      </div>
    </main>
  );
}
