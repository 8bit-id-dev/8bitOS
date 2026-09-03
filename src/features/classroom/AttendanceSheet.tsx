import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { insforge } from '@/shared/db/insforge';
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

const STATUS_TONE: Record<AttendanceStatus, string> = {
  hadir: 'bg-fg text-bg',
  izin: 'bg-bg text-fg',
  sakit: 'bg-bg text-fg',
  alpha: 'bg-bg text-fg',
};

const useSessionDetail = (sessionId: string) => {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data, error } = await insforge.database
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
      const { data } = await insforge.database
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
      <main className="p-6">
        <p className="font-pixel text-sm text-gray-300">SESI TIDAK DITEMUKAN</p>
        <Link to="/classroom" className="text-xs underline mt-2 inline-block">
          ← KEMBALI
        </Link>
      </main>
    );
  }

  const students = studentsQ.data ?? [];

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="font-pixel text-2xl">ABSENSI</h1>
        <span className="text-xs text-gray-300 font-pixel">{subjectName || '—'}</span>
      </header>

      <PixelCard>
        <div className="grid grid-cols-4 gap-2 text-center">
          {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((k) => (
            <div key={k} className="border-2 border-fg p-2">
              <p className="text-gray-300 text-[10px] font-pixel">{STATUS_LABEL[k]}</p>
              <p className="text-xl font-pixel">{counts[k]}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-[10px] font-pixel mt-2">
          OFFLINE-FIRST · DISIMPAN KE OUTBOX
        </p>
      </PixelCard>

      {studentsQ.isLoading && <p className="font-pixel text-xs text-gray-300">LOADING…</p>}

      <PixelCard>
        <ul className="flex flex-col">
          {students.map((s, idx) => {
            const current = statusByStudent.get(s.id);
            return (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b-2 border-fg last:border-b-0 py-2"
              >
                <span className="text-gray-500 font-pixel w-8 text-right">{idx + 1}</span>
                <span className="flex-1 text-sm">{s.full_name}</span>
                <div className="flex gap-1">
                  {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((k) => {
                    const isActive = current === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => void handleSet(s.id, k)}
                        aria-label={`${s.full_name} ${k}`}
                        className={`w-9 h-9 font-pixel text-sm border-2 border-fg ${
                          isActive ? STATUS_TONE[k] : 'bg-bg text-gray-300'
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
          <PixelButton variant="secondary">KEMBALI</PixelButton>
        </Link>
      </div>
    </main>
  );
}
