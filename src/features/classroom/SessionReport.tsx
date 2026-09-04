import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  endSession,
  getClassById,
  getSessionReport,
  listSessionActivities,
  listStudentsByClass,
} from '@/shared/db/queries';
import { useSession } from '@/features/auth/useSession';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import {
  attendanceCounts,
  sessionDurationLabel,
  withUnmarked,
} from './sessionReport.helpers';
import { useSessionContext } from './sessionContext';
import { formatJakartaDate, formatJakartaTime } from '@/shared/lib/time';
import { exportAttendanceCsv } from '@/shared/lib/exportCsv';

export function SessionReport() {
  const { classId = '', sessionId = '' } = useParams<{ classId: string; sessionId: string }>();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const reportQ = useQuery({
    queryKey: ['session-report', sessionId],
    queryFn: () => getSessionReport(sessionId),
    enabled: Boolean(sessionId && user),
  });

  const classQ = useQuery({
    queryKey: ['class', classId],
    queryFn: () => getClassById(user!.id, classId),
    enabled: Boolean(user && classId),
  });

  const studentsQ = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => listStudentsByClass(classId),
    enabled: Boolean(classId),
  });

  // Timeline KBM (Doc 10 §17/§48): dibangun dari session_activities
  const activitiesQ = useQuery({
    queryKey: ['session-activities', sessionId],
    queryFn: () => listSessionActivities(sessionId),
    enabled: Boolean(sessionId),
  });

  const endMutation = useMutation({
    mutationFn: () => endSession(sessionId),
    onSuccess: () => {
      // END SESSION (Dok 06 §21): clear global session context
      useSessionContext.getState().end();
      void queryClient.invalidateQueries({ queryKey: ['session-report', sessionId] });
      void queryClient.invalidateQueries({ queryKey: ['class-bundle', classId] });
      navigate(`/classroom/${classId}`);
    },
  });

  if (reportQ.isLoading) {
    return <p className="p-4 font-sans text-pixel-sm text-gray-300">loading…</p>;
  }
  if (reportQ.error || !reportQ.data) {
    return (
      <main className="p-4 space-y-2">
        <EmptyState title="SESI TIDAK DITEMUKAN" hint="Periksa tautan Anda." />
        <Link to={`/classroom/${classId}`} className="font-sans text-pixel-sm text-fg">
          ← kembali
        </Link>
      </main>
    );
  }

  const { session, attendance, notes } = reportQ.data;
  const rosterSize = studentsQ.data?.length ?? 0;
  const counts = withUnmarked(attendanceCounts(attendance), rosterSize);
  const className = classQ.data?.name ?? '—';
  const isDone = session.status === 'done';

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/session_report
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">
          {formatJakartaDate(session.scheduled_for)} ·{' '}
          {formatJakartaTime(session.scheduled_for)}
        </span>
      </header>

      <PixelCard title="identitas" accent>
        <p className="font-sans text-body font-bold text-fg">
          {className} · {session.topic || 'tanpa topik'}
        </p>
        <p className="font-sans text-pixel-sm text-gray-300 mt-1">
          durasi: {sessionDurationLabel(session.scheduled_for, isDone ? session.created_at : null)}{' '}
          · status: <span className={isDone ? 'text-fg' : 'text-fg'}>{session.status}</span>
        </p>
      </PixelCard>

      <PixelCard title={`absensi (${rosterSize} siswa)`}>
        <div className="grid grid-cols-5 gap-2 text-center font-sans">
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">HADIR</p>
            <p className="text-body font-bold text-fg">{counts.hadir}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">IZIN</p>
            <p className="text-body font-bold text-fg">{counts.izin}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">SAKIT</p>
            <p className="text-body font-bold text-fg">{counts.sakit}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">ALPHA</p>
            <p className="text-body font-bold text-fg">{counts.alpha}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="micro-pixel text-gray-300">BELUM</p>
            <p className="text-body font-bold text-gray-300">{counts.unmarked}</p>
          </div>
        </div>
      </PixelCard>

      {/* Timeline KBM (Doc 10 §48 Learning Timeline) */}
      <PixelCard title={`timeline (${activitiesQ.data?.length ?? 0})`}>
        {(activitiesQ.data?.length ?? 0) === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">
            belum ada aktivitas tercatat
          </p>
        ) : (
          <ul className="flex flex-col">
            {(activitiesQ.data ?? []).map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 border-b border-line last:border-b-0 py-1.5 font-sans text-pixel-sm"
              >
                <span className="text-gray-500 w-12 tabular-nums">
                  {new Date(a.started_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="w-2 h-2 bg-fg" aria-hidden />
                <span className="micro-pixel text-gray-300 w-20 uppercase">{a.type}</span>
                <span className="flex-1 text-fg truncate">{a.title}</span>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <PixelCard title={`catatan_sesi (${notes.length})`}>
        {notes.length === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">
            belum ada catatan — buat dari tab NOTES di kelas
          </p>
        ) : (
          <ul className="flex flex-col">
            {notes.map((n) => (
              <li
                key={n.id}
                className="border-b border-line last:border-b-0 py-1.5 font-sans text-pixel-sm"
              >
                <p className="text-fg">{n.title || '(tanpa judul)'}</p>
                <p className="text-gray-500 truncate">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <div className="flex gap-2 flex-wrap">
        <Link to={`/classroom/${classId}/attendance/${sessionId}`}>
          <PixelButton variant="secondary">← ABSENSI</PixelButton>
        </Link>
        {/* Export (Doc 08 §42): absensi CSV */}
        <PixelButton
          variant="secondary"
          onClick={() =>
            exportAttendanceCsv(
              className,
              formatJakartaDate(session.scheduled_for),
              (studentsQ.data ?? []).map((s, i) => {
                const rec = attendance.find((a) => a.student_id === s.id);
                return {
                  no: i + 1,
                  name: s.full_name,
                  nisn: s.nisn,
                  status: rec?.status ?? null,
                };
              }),
            )
          }
        >
          CSV ↓
        </PixelButton>
        {!isDone && (
          <PixelButton onClick={() => endMutation.mutate()} disabled={endMutation.isPending}>
            {endMutation.isPending ? 'MENYIMPAN…' : 'SELESAIKAN SESI →'}
          </PixelButton>
        )}
        {isDone && (
          <Link to={`/classroom/${classId}`}>
            <PixelButton variant="secondary">← KELAS</PixelButton>
          </Link>
        )}
      </div>
    </main>
  );
}
