import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNote,
  createSession,
  createStudent,
  getClassById,
  listNotes,
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

const TABS: Record<TabKey, { label: string }> = {
  overview: { label: 'OVERVIEW' },
  roster: { label: 'ROSTER' },
  attendance: { label: 'ATTENDANCE' },
  notes: { label: 'NOTES' },
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

      {/* Class History (Dok 07 §34): sesi bisa dibuka kembali */}
      <PixelCard title={`class_history (${sessions.length})`}>
        {sessions.length === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">belum ada riwayat sesi</p>
        ) : (
          <ul className="flex flex-col">
            {sessions.map((s) => (
              <li key={s.id} className="border-b border-line last:border-b-0">
                <Link
                  to={`/classroom/${classId}/session/${s.id}/report`}
                  className="flex items-center gap-3 py-1.5 font-sans text-pixel-sm hover:text-fg"
                >
                  <span
                    className={
                      s.status === 'done'
                        ? 'micro-pixel text-gray-500'
                        : s.status === 'active'
                          ? 'micro-pixel text-fg'
                          : 'micro-pixel text-gray-300'
                    }
                  >
                    {s.status === 'done' ? 'SELESAI' : s.status === 'active' ? 'AKTIF' : 'RENCANA'}
                  </span>
                  <span className="flex-1 text-fg">{s.topic || '(tanpa topik)'}</span>
                  <span className="text-gray-300">
                    {new Date(s.scheduled_for).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-gray-500" aria-hidden>
                    →
                  </span>
                </Link>
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

const AttendanceTab = ({
  classId,
  sessions,
}: {
  classId: string;
  sessions: { id: string; topic: string; scheduled_for: string; status: string }[];
}) => {
  // Sesi terakhir (aktif atau terbaru) — one-tap ke sheet absensi (Dok 06 §5)
  const latest = sessions.find((s) => s.status === 'active') ?? sessions[0];
  return (
    <div className="space-y-3">
      {latest ? (
        <PixelCard title="sesi_terakhir">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-pixel-sm text-fg truncate">
                {latest.topic || '(tanpa topik)'}
              </p>
              <p className="font-sans micro-pixel text-gray-300 mt-0.5">
                {new Date(latest.scheduled_for).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                })}{' '}
                ·{' '}
                <span className={latest.status === 'active' ? 'text-fg' : 'text-gray-500'}>
                  {latest.status === 'active' ? 'AKTIF' : latest.status === 'done' ? 'SELESAI' : 'RENCANA'}
                </span>
              </p>
            </div>
            <Link to={`/classroom/${classId}/attendance/${latest.id}`}>
              <PixelButton>BUKA ABSENSI →</PixelButton>
            </Link>
          </div>
        </PixelCard>
      ) : (
        <EmptyState
          title="BELUM ADA SESI"
          hint="Mulai sesi dari tab OVERVIEW untuk membuka absensi."
        />
      )}
      {sessions.length > 1 && (
        <PixelCard title={`riwayat_sesi (${sessions.length})`}>
          <ul className="flex flex-col">
            {sessions.map((s) => (
              <li key={s.id} className="border-b border-line last:border-b-0">
                <Link
                  to={`/classroom/${classId}/attendance/${s.id}`}
                  className="flex items-center gap-3 py-1.5 font-sans text-pixel-sm hover:text-fg"
                >
                  <span className="micro-pixel text-gray-500 w-14">
                    {s.status === 'active' ? 'AKTIF' : s.status === 'done' ? 'SELESAI' : 'RENCANA'}
                  </span>
                  <span className="flex-1 text-fg truncate">{s.topic || '(tanpa topik)'}</span>
                  <span className="text-gray-300">
                    {new Date(s.scheduled_for).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PixelCard>
      )}
    </div>
  );
};

const NotesTab = ({ classId, className }: { classId: string; className: string }) => {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saved, setSaved] = useState(false);

  const notesQ = useQuery({
    queryKey: ['notes-class', classId],
    queryFn: () => listNotes({ classId }),
    enabled: Boolean(user && classId),
    staleTime: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('NO_AUTH');
      return createNote(user.id, {
        kind: 'class',
        title: title.trim() || `Catatan ${className}`,
        body,
        class_id: classId,
      });
    },
    onSuccess: () => {
      setTitle('');
      setBody('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      void queryClient.invalidateQueries({ queryKey: ['notes-class', classId] });
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const notes = notesQ.data ?? [];

  return (
    <div className="space-y-3">
      <PixelCard title="catatan_baru" accent>
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`judul (default: Catatan ${className})…`}
            className="w-full bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-small focus-visible:border-fg"
            aria-label="Judul catatan kelas"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="catatan kelas…"
            className="w-full bg-bg text-fg border border-line-strong px-2 py-1.5 font-sans text-small focus-visible:border-fg resize-y"
            aria-label="Isi catatan kelas"
          />
          <div className="flex items-center justify-between">
            <span className="micro-pixel text-gray-500" aria-live="polite">
              {saved ? '● tersimpan' : ''}
            </span>
            <PixelButton
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !body.trim()}
            >
              {createMutation.isPending ? 'MENYIMPAN…' : '+ SIMPAN CATATAN KELAS'}
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      <PixelCard title={`catatan_kelas (${notes.length})`}>
        {notes.length === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">belum ada catatan kelas</p>
        ) : (
          <ul className="flex flex-col">
            {notes.map((n) => (
              <li key={n.id} className="border-b border-line last:border-b-0 py-1.5">
                <p className="font-sans text-pixel-sm text-fg">{n.title || '(tanpa judul)'}</p>
                <p className="font-sans text-small text-gray-500 line-clamp-2">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>
    </div>
  );
};

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
              className={`px-3 py-1 font-sans micro-pixel label-pixel border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'text-fg border-fg'
                  : 'text-gray-300 border-transparent hover:text-fg'
              }`}
            >
              {t.label}
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
      {tab === 'attendance' && (
        <AttendanceTab classId={classId} sessions={data.sessions} />
      )}
      {tab === 'notes' && (
        <NotesTab classId={classId} className={data.classRow.name} />
      )}

      <p className="font-sans text-pixel-sm text-gray-500">mapel: {subjectName}</p>
    </main>
  );
}
