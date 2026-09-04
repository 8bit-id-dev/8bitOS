import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/db/supabase';
import { listAttendanceForSession, listStudentsByClass, upsertAttendance } from '@/shared/db/queries';
import type { AttendanceStatus, ClassSession, Subject } from '@/shared/db/types';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { useSession } from '@/features/auth/useSession';

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  hadir: 'H',
  izin: 'I',
  sakit: 'S',
  alpha: 'A',
};

const STATUS_KEY: Record<AttendanceStatus, string> = {
  hadir: 'hadir',
  izin: 'izin',
  sakit: 'sakit',
  alpha: 'alpha',
};

const useSessionDetail = (sessionId: string) => {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ClassSession | null) ?? null;
    },
    enabled: Boolean(sessionId),
  });
};

export function AttendanceSheet() {
  const { sessionId = '', classId = '' } = useParams<{ sessionId: string; classId: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: session } = useSessionDetail(sessionId);
  const studentsQ = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => listStudentsByClass(classId),
    enabled: Boolean(classId),
  });
  const recordsQ = useQuery({
    queryKey: ['session-attendance', sessionId],
    queryFn: () => listAttendanceForSession(sessionId),
    enabled: Boolean(sessionId),
  });

  const [subjectName, setSubjectName] = useState<string>('');
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('id', session.subject_id)
        .maybeSingle();
      if (!cancelled && data) {
        setSubjectName(((data as unknown as Subject).name ?? '').toUpperCase());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const statusByStudent = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const r of recordsQ.data ?? []) map.set(r.student_id, r.status);
    return map;
  }, [recordsQ.data]);

  const handleSet = async (studentId: string, status: AttendanceStatus) => {
    if (!user || !sessionId) return;
    await upsertAttendance(sessionId, studentId, status);
    void queryClient.invalidateQueries({ queryKey: ['session-attendance', sessionId] });
    void queryClient.invalidateQueries({ queryKey: ['pending-count', user.id] });
  };

  const counts = useMemo(() => {
    const acc: Record<AttendanceStatus, number> = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
    for (const v of statusByStudent.values()) acc[v] += 1;
    return acc;
  }, [statusByStudent]);

  if (!session) {
    return (
      <main className="p-4 space-y-2">
        <p className="font-sans text-pixel-sm text-gray-300">sesi tidak ditemukan</p>
        <Link to="/classroom" className="font-sans text-pixel-sm text-fg">
          ← ~/classroom
        </Link>
      </main>
    );
  }

  const students = studentsQ.data ?? [];

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/absensi
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">{subjectName || '—'}</span>
      </header>

      <PixelCard title="rekap" accent>
        <div className="grid grid-cols-4 gap-2 text-center font-sans">
          {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((k) => (
            <div key={k} className="panel px-2 py-1.5">
              <p className="micro-pixel text-gray-300">{STATUS_KEY[k]}</p>
              <p className="text-body font-bold text-fg">{counts[k]}</p>
            </div>
          ))}
        </div>
        <p className="font-sans micro-pixel text-gray-500 mt-2">
          offline-first · disimpan ke outbox
        </p>
      </PixelCard>

      {studentsQ.isLoading && <p className="font-sans text-pixel-sm text-gray-300">loading…</p>}

      <PixelCard title={`daftar_siswa (${students.length})`}>
        <ul className="flex flex-col">
          {students.map((s, idx) => {
            const current = statusByStudent.get(s.id);
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b border-line last:border-b-0 py-1.5"
              >
                <span className="font-sans text-gray-500 w-8 text-right text-pixel-sm">{idx + 1}.</span>
                <span className="flex-1 font-sans text-pixel-sm text-fg">{s.full_name}</span>
                <div className="flex gap-1">
                  {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((k) => {
                    const isActive = current === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => void handleSet(s.id, k)}
                        aria-label={`${s.full_name} ${k}`}
                        className={`w-9 h-9 font-sans text-pixel-sm border transition-colors ${
                          isActive
                            ? 'bg-fg text-bg border-fg '
                            : 'bg-transparent text-gray-300 border-line-strong hover:border-line-strong'
                        }`}
                      >
                        {STATUS_LABEL[k]}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </PixelCard>

      <div className="flex gap-2">
        <Link to={`/classroom/${classId}`}>
          <PixelButton variant="secondary">← KEMBALI</PixelButton>
        </Link>
        <Link to={`/classroom/${classId}/session/${sessionId}/report`}>
          <PixelButton>SELESAIKAN SESI →</PixelButton>
        </Link>
      </div>
    </main>
  );
}
