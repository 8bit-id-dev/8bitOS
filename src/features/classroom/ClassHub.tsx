import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  getClassById,
  listScheduleForClass,
  listSessionsForClass,
  listStudentsByClass,
} from '@/shared/db/queries';
import type { ScheduleSlot, Student, Subject } from '@/shared/db/types';
import { insforge } from '@/shared/db/insforge';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';

type TabKey = 'overview' | 'roster' | 'attendance' | 'notes';

const TAB_KEYS: TabKey[] = ['overview', 'roster', 'attendance', 'notes'];

const TABS: Record<TabKey, { label: string; soon?: boolean }> = {
  overview: { label: 'OVERVIEW' },
  roster: { label: 'ROSTER' },
  attendance: { label: 'ATTENDANCE', soon: true },
  notes: { label: 'NOTES', soon: true },
};

const dayLabel = (dow: number): string => {
  const map = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  return map[dow] ?? '?';
};

const useClassBundle = (classId: string) => {
  const { user } = useSession();
  return useQuery({
    queryKey: ['class-bundle', classId, user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return null;
      const [classRow, schedule, students, sessions] = await Promise.all([
        getClassById(user.id, classId),
        listScheduleForClass(classId),
        listStudentsByClass(classId),
        listSessionsForClass(classId),
      ]);

      const subjectIds = Array.from(new Set(schedule.map((s) => s.subject_id)));
      const { data: subjectsData } = await insforge.database
        .from('subjects')
        .select('id, name')
        .in('id', subjectIds.length > 0 ? subjectIds : ['00000000-0000-0000-0000-000000000000']);
      const subjects = (subjectsData ?? []) as unknown as Pick<Subject, 'id' | 'name'>[];
      const subjectById = new Map(subjects.map((s) => [s.id, s.name]));

      return { classRow, schedule, students, sessions, subjectById };
    },
    enabled: Boolean(user && classId),
    staleTime: 30_000,
  });
};

const OverviewTab = ({
  className,
  schedule,
  students,
  sessions,
  subjectById,
  onStart,
  isStarting,
}: {
  className: string;
  schedule: ScheduleSlot[];
  students: Student[];
  sessions: { id: string; topic: string; scheduled_for: string; status: string }[];
  subjectById: Map<string, string>;
  onStart: (subjectId: string) => void;
  isStarting: boolean;
}) => {
  return (
    <div className="space-y-4">
      <PixelCard>
        <h2 className="font-pixel text-sm mb-2">RINGKASAN</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border-2 border-fg p-3">
            <p className="text-gray-300 text-xs font-pixel">SISWA</p>
            <p className="text-2xl font-pixel mt-1">{students.length}</p>
          </div>
          <div className="border-2 border-fg p-3">
            <p className="text-gray-300 text-xs font-pixel">MAPEL</p>
            <p className="text-2xl font-pixel mt-1">{schedule.length}</p>
          </div>
          <div className="border-2 border-fg p-3">
            <p className="text-gray-300 text-xs font-pixel">SESI</p>
            <p className="text-2xl font-pixel mt-1">{sessions.length}</p>
          </div>
        </div>
      </PixelCard>

      <PixelCard>
        <h2 className="font-pixel text-sm mb-2">MULAI SESI</h2>
        {schedule.length === 0 ? (
          <p className="text-gray-300 text-xs font-pixel">BELUM ADA JADWAL</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {Array.from(
              new Map(
                schedule.map((s) => [s.subject_id, subjectById.get(s.subject_id) ?? '—']),
              ),
            ).map(([subjectId, name]) => (
              <PixelButton
                key={subjectId}
                onClick={() => onStart(subjectId)}
                disabled={isStarting}
              >
                {String(name).toUpperCase()}
              </PixelButton>
            ))}
          </div>
        )}
      </PixelCard>

      <PixelCard>
        <h2 className="font-pixel text-sm mb-2">JADWAL</h2>
        {schedule.length === 0 ? (
          <p className="text-gray-300 text-xs font-pixel">BELUM ADA SLOT</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {schedule.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-2 border-fg p-2 text-sm"
              >
                <span className="font-pixel w-16">{dayLabel(s.day_of_week)}</span>
                <span className="font-pixel">
                  {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                </span>
                <span className="flex-1">{subjectById.get(s.subject_id) ?? '—'}</span>
                <span className="text-gray-500 text-xs">{s.room || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <p className="text-gray-500 text-xs">
        <Link to="/classroom" className="underline">
          ← KEMBALI KE DAFTAR KELAS
        </Link>
      </p>
      <p className="text-gray-500 text-[10px] font-pixel">{className.toUpperCase()}</p>
    </div>
  );
};

const RosterTab = ({ students }: { students: Student[] }) => {
  if (students.length === 0) {
    return (
      <EmptyState
        title="BELUM ADA SISWA"
        hint="Tambahkan siswa di kelas ini."
      />
    );
  }
  return (
    <PixelCard>
      <h2 className="font-pixel text-sm mb-2">DAFTAR SISWA ({students.length})</h2>
      <ul className="flex flex-col">
        {students.map((s, idx) => (
          <li
            key={s.id}
            className="flex items-center gap-3 border-b-2 border-fg last:border-b-0 py-2 text-sm"
          >
            <span className="text-gray-500 font-pixel w-8 text-right">{idx + 1}</span>
            <span className="flex-1">{s.full_name}</span>
            <span className="text-gray-300 text-xs font-pixel">{s.nisn || '—'}</span>
            <span className="text-gray-300 text-xs font-pixel w-6 text-center">
              {s.gender}
            </span>
          </li>
        ))}
      </ul>
    </PixelCard>
  );
};

const SoonTab = ({ name }: { name: string }) => (
  <EmptyState title={`${name} COMING SOON`} hint="Akan tersedia di rilis berikutnya." />
);

export function ClassHub() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId ?? '';
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>('overview');
  const { data, isLoading, error } = useClassBundle(classId);

  const startMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      if (!user) throw new Error('NOT_AUTHED');
      const session = await createSession(
        user.id,
        classId,
        subjectId,
        new Date(),
        'Sesi baru',
      );
      return session;
    },
    onSuccess: (session) => {
      void queryClient.invalidateQueries({ queryKey: ['class-bundle', classId] });
      window.location.hash = `#/classroom/${classId}/attendance/${session.id}`;
    },
  });

  const subjectName = useMemo(() => {
    if (!data?.subjectById) return '—';
    return Array.from(data.subjectById.values()).join(', ') || '—';
  }, [data]);

  if (isLoading) {
    return <p className="p-6 font-pixel text-sm text-gray-300">LOADING…</p>;
  }
  if (error) {
    return (
      <main className="p-6">
        <PixelCard>
          <p className="font-pixel text-sm">GAGAL MEMUAT KELAS.</p>
          <p className="text-gray-300 text-xs mt-2">{(error as Error).message}</p>
          <Link to="/classroom" className="text-xs underline mt-3 inline-block">
            ← KEMBALI
          </Link>
        </PixelCard>
      </main>
    );
  }
  if (!data?.classRow) {
    return (
      <main className="p-6">
        <EmptyState title="KELAS TIDAK DITEMUKAN" hint="Periksa tautan Anda." />
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="font-pixel text-2xl">{data.classRow.name.toUpperCase()}</h1>
        <span className="text-xs text-gray-300 font-pixel">KELAS</span>
      </header>

      <nav className="flex gap-2 border-b-2 border-fg pb-2">
        {TAB_KEYS.map((k) => {
          const t = TABS[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-3 py-1 font-pixel text-xs border-2 border-fg ${
                tab === k ? 'bg-fg text-bg' : 'bg-bg text-fg'
              }`}
            >
              {t.label}
              {t.soon && <span className="ml-2 text-[10px]">[SOON]</span>}
            </button>
          );
        })}
      </nav>

      {tab === 'overview' && (
        <OverviewTab
          className={data.classRow.name}
          schedule={data.schedule}
          students={data.students}
          sessions={data.sessions}
          subjectById={data.subjectById}
          onStart={(sid) => startMutation.mutate(sid)}
          isStarting={startMutation.isPending}
        />
      )}
      {tab === 'roster' && <RosterTab students={data.students} />}
      {tab === 'attendance' && <SoonTab name="ATTENDANCE" />}
      {tab === 'notes' && <SoonTab name="NOTES" />}

      <p className="text-gray-500 text-[10px] font-pixel">MAPEL: {subjectName}</p>
    </main>
  );
}
