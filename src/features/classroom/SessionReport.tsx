import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  endSession,
  getClassById,
  getSessionReport,
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
import { formatJakartaDate, formatJakartaTime } from '@/shared/lib/time';

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

  const endMutation = useMutation({
    mutationFn: () => endSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['session-report', sessionId] });
      void queryClient.invalidateQueries({ queryKey: ['class-bundle', classId] });
      navigate(`/classroom/${classId}`);
    },
  });

  if (reportQ.isLoading) {
    return <p className="p-4 font-mono text-xs text-dim">loading…</p>;
  }
  if (reportQ.error || !reportQ.data) {
    return (
      <main className="p-4 space-y-2">
        <EmptyState title="SESI TIDAK DITEMUKAN" hint="Periksa tautan Anda." />
        <Link to={`/classroom/${classId}`} className="font-mono text-xs text-accent">
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
        <h1 className="font-mono font-bold text-lg text-accent text-glow label-term">
          ~/session_report
        </h1>
        <span className="font-mono text-xs text-dim">
          {formatJakartaDate(session.scheduled_for)} ·{' '}
          {formatJakartaTime(session.scheduled_for)}
        </span>
      </header>

      <PixelCard title="identitas" accent>
        <p className="font-mono text-md font-bold text-fg">
          {className} · {session.topic || 'tanpa topik'}
        </p>
        <p className="font-mono text-xs text-dim mt-1">
          durasi: {sessionDurationLabel(session.scheduled_for, isDone ? session.created_at : null)}{' '}
          · status: <span className={isDone ? 'text-accent' : 'text-fg'}>{session.status}</span>
        </p>
      </PixelCard>

      <PixelCard title={`absensi (${rosterSize} siswa)`}>
        <div className="grid grid-cols-5 gap-2 text-center font-mono">
          <div className="panel px-2 py-1.5">
            <p className="text-micro-label text-dim">HADIR</p>
            <p className="text-md font-bold text-accent">{counts.hadir}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="text-micro-label text-dim">IZIN</p>
            <p className="text-md font-bold text-fg">{counts.izin}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="text-micro-label text-dim">SAKIT</p>
            <p className="text-md font-bold text-fg">{counts.sakit}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="text-micro-label text-dim">ALPHA</p>
            <p className="text-md font-bold text-fg">{counts.alpha}</p>
          </div>
          <div className="panel px-2 py-1.5">
            <p className="text-micro-label text-dim">BELUM</p>
            <p className="text-md font-bold text-dim">{counts.unmarked}</p>
          </div>
        </div>
      </PixelCard>

      <PixelCard title={`catatan_sesi (${notes.length})`}>
        {notes.length === 0 ? (
          <p className="font-mono text-xs text-dim">
            belum ada catatan — buat dari tab NOTES di kelas
          </p>
        ) : (
          <ul className="flex flex-col">
            {notes.map((n) => (
              <li
                key={n.id}
                className="border-b border-line last:border-b-0 py-1.5 font-mono text-xs"
              >
                <p className="text-fg">{n.title || '(tanpa judul)'}</p>
                <p className="text-dimmer truncate">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <div className="flex gap-2">
        <Link to={`/classroom/${classId}/attendance/${sessionId}`}>
          <PixelButton variant="secondary">← ABSENSI</PixelButton>
        </Link>
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
