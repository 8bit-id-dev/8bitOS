import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  createStudent,
  getClassById,
  listScheduleForClass,
  listSessionsForClass,
  listStudentsByClass,
  type StudentDraft,
} from '@/shared/db/queries';
import type { ScheduleSlot, Student, Subject } from '@/shared/db/types';
import { supabase } from '@/shared/db/supabase';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { StudentForm } from './StudentForm';
import { useSessionContext } from './sessionContext';

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
      const { data: subjectsData } = await supabase
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
  classId,
  className,
  schedule,
  students,
  sessions,
  subjectById,
  onStart,
  isStarting,
}: {
  classId: string;
  className: string;
  schedule: ScheduleSlot[];
  students: Student[];
  sessions: { id: string; topic: string; scheduled_for: string; status: string }[];
  subjectById: Map<string, string>;
  onStart: (subjectId: string) => void;
  isStarting: boolean;
}) => {
  return (
    <div className="space-y-3">
      <PixelCard title="ringkasan">
        <div className="grid grid-cols-3 gap-2 text-center font-sans">
          <div className="panel px-2 py-2">
            <p className="micro-pixel text-gray-300">SISWA</p>
            <p className="text-body font-bold text-fg">{students.length}</p>
          </div>
          <div className="panel px-2 py-2">
            <p className="micro-pixel text-gray-300">MAPEL</p>
            <p className="text-body font-bold text-fg">{schedule.length}</p>
          </div>
          <div className="panel px-2 py-2">
            <p className="micro-pixel text-gray-300">SESI</p>
            <p className="text-body font-bold text-fg">{sessions.length}</p>
          </div>
        </div>
      </PixelCard>

      <PixelCard title="mulai_sesi">
        {schedule.length === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">belum ada jadwal</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {Array.from(
              new Map(
                schedule.map((s) => [s.subject_id, subjectById.get(s.subject_id) ?? '']),
              ),
            ).map(([subjectId, name]) => (
              <PixelButton
                key={subjectId}
                onClick={() => onStart(subjectId)}
                disabled={isStarting}
              >
                {String(name).toUpperCase()}  
              </PixelButton>
            ))}
          </div>
        )}
      </PixelCard>

      <PixelCard title="jadwal">
        {schedule.length === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">belum ada slot</p>
        ) : (
          <ul className="flex flex-col">
            {schedule.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b border-line last:border-b-0 py-1.5 font-sans text-pixel-sm"
              >
                <span className="text-gray-300 w-16">{dayLabel(s.day_of_week)}</span>
                <span className="text-fg">
                  {s.start_time.slice(0, 5)}{s.end_time.slice(0, 5)}
                </span>
                <span className="flex-1 text-fg">{subjectById.get(s.subject_id) ?? ''}</span>
                <span className="text-gray-500">{s.room || ''}</span>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <p className="font-sans text-pixel-sm">
        <Link to="/classroom" className="text-gray-300 hover:text-fg">
            ~/classroom
        </Link>
        <Link
          to={`/classroom/${classId}/documents`}
          className="text-gray-300 hover:text-fg ml-3"
        >
          x dokumen kelas  
        </Link>
        <span className="text-gray-500 ml-2">{className}</span>
      </p>
    </div>
  );
};

const RosterTab = ({
  classId,
  students,
}: {
  classId: string;
  students: Student[];
}) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState(false);
  const [addError, setAddError] = useState('');

  const handleAdd = async (draft: StudentDraft) => {
    if (!user) return;
    setPendingAdd(true);
    setAddError('');
    try {
      await createStudent(user.id, { ...draft, class_id: classId });
      setFormOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
      void queryClient.invalidateQueries({ queryKey: ['class-bundle', classId] });
    } catch (e) {
      setAddError((e as Error).message);
    } finally {
      setPendingAdd(false);
    }
  };

  if (students.length === 0 && !formOpen) {
    return (
      <div className="space-y-3">
        <EmptyState title="BELUM ADA SISWA" hint="Tambahkan siswa di kelas ini." />
        <div>
          <PixelButton onClick={() => setFormOpen(true)}>+ SISWA</PixelButton>
        </div>
      </div>
    );
  }
  return (
    <PixelCard
      title={`daftar_siswa (${students.length})`}
    >
      <div className="mb-2">
        <PixelButton variant="secondary" onClick={() => setFormOpen(true)}>
          + SISWA
        </PixelButton>
      </div>
      <ul className="flex flex-col">
        {students.map((s, idx) => (
          <li
            key={s.id}
            className="flex items-center gap-3 border-b border-line last:border-b-0 py-1.5 font-sans text-pixel-sm"
          >
            <span className="text-gray-500 w-8 text-right">{idx + 1}.</span>
            <Link
              to={`/classroom/${classId}/students/${s.id}`}
              className="flex-1 text-fg hover:text-fg"
            >
              {s.full_name}
            </Link>
            <span className="text-gray-300">{s.nisn || ''}</span>
            <span className="text-gray-300 w-6 text-center">{s.gender}</span>
          </li>
        ))}
      </ul>
      <StudentForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleAdd}
        pending={pendingAdd}
      />
      {addError && (
        <p className="font-sans text-pixel-sm text-fg mt-2">ERROR: {addError}</p>
      )}
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
      return createSession(user.id, classId, subjectId, new Date(), 'Sesi baru');
    },
    onSuccess: (session) => {
      // Session-Based Teaching (Dok 06 §3): session aktif global
      useSessionContext.getState().start({
        sessionId: session.id,
        classId,
        className: data?.classRow?.name ?? '',
        subjectName:
          data?.subjectById?.get(session.subject_id) ?? '',
        startedAtIso: new Date().toISOString(),
      });
      void queryClient.invalidateQueries({ queryKey: ['class-bundle', classId] });
      window.location.hash = `#/classroom/${classId}/attendance/${session.id}`;
    },
  });

  const subjectName = useMemo(() => {
    if (!data?.subjectById) return '';
    return Array.from(data.subjectById.values()).join(', ') || '';
  }, [data]);

  if (isLoading) {
    return <p className="p-4 font-sans text-pixel-sm text-gray-300">loading……</p>;
  }
  if (error) {
    return (
      <main className="p-4">
        <div className="panel-strong p-3 space-y-2">
          <p className="font-sans text-pixel-sm text-fg">GAGAL MEMUAT KELAS.</p>
          <p className="font-sans text-pixel-sm text-gray-300">{(error as Error).message}</p>
          <Link to="/classroom" className="font-sans text-pixel-sm text-fg inline-block">
              kembali
          </Link>
        </div>
      </main>
    );
  }
  if (!data?.classRow) {
    return (
      <main className="p-4">
        <EmptyState title="KELAS TIDAK DITEMUKAN" hint="Periksa tautan Anda." />
      </main>
    );
  }

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/classroom/{data.classRow.name.toLowerCase().replace(/\s+/g, '-')}
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">mapel: {subjectName}</span>
      </header>

      <nav className="flex gap-1 border-b border-line-strong" aria-label="Class tabs">
        {TAB_KEYS.map((k) => {
          const t = TABS[k];
          const isActive = tab === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              disabled={t.soon}
              className={`px-3 py-1 font-sans micro-pixel label-pixel border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'text-fg border-fg'
                  : t.soon
                    ? 'text-gray-500 border-transparent cursor-not-allowed'
                    : 'text-gray-300 border-transparent hover:text-fg'
              }`}
            >
              {t.label}
              {t.soon && <span className="ml-1 text-gray-500">[soon]</span>}
            </button>
          );
        })}
      </nav>

      {tab === 'overview' && (
        <OverviewTab
          classId={classId}
          className={data.classRow.name}
          schedule={data.schedule}
          students={data.students}
          sessions={data.sessions}
          subjectById={data.subjectById}
          onStart={(sid) => startMutation.mutate(sid)}
          isStarting={startMutation.isPending}
        />
      )}
      {tab === 'roster' && <RosterTab classId={classId} students={data.students} />}
      {tab === 'attendance' && <SoonTab name="ATTENDANCE" />}
      {tab === 'notes' && <SoonTab name="NOTES" />}

      <p className="font-sans text-pixel-sm text-gray-500">mapel: {subjectName}</p>
    </main>
  );
}
