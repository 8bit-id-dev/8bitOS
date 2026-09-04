import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteStudent,
  getStudentById,
  listAttendanceForSession,
  listSessionsForClass,
} from '@/shared/db/queries';
import type { AttendanceStatus } from '@/shared/db/types';
import { PixelCard } from '@/shared/components/PixelCard';
import { PixelButton } from '@/shared/components/PixelButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatJakartaDate } from '@/shared/lib/time';

export function StudentDetail() {
  const { classId = '', studentId = '' } = useParams<{ classId: string; studentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const studentQ = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudentById(studentId),
    enabled: Boolean(studentId),
  });

  const sessionsQ = useQuery({
    queryKey: ['class-sessions', classId],
    queryFn: () => listSessionsForClass(classId),
    enabled: Boolean(classId),
  });

  const attendanceBySession = useQuery({
    queryKey: ['student-attendance', studentId, sessionsQ.data?.map((s) => s.id).join(',') ?? ''],
    queryFn: async () => {
      const sessions = sessionsQ.data ?? [];
      const results = await Promise.all(
        sessions.map(async (s) => {
          const records = await listAttendanceForSession(s.id);
          return { sessionId: s.id, date: s.scheduled_for, record: records.find((r) => r.student_id === studentId) ?? null };
        }),
      );
      return results;
    },
    enabled: Boolean(sessionsQ.data?.length),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(studentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
      navigate(`/classroom/${classId}`);
    },
  });

  if (studentQ.isLoading) {
    return <p className="p-4 font-sans text-pixel-sm text-gray-300">loadingâ€¦</p>;
  }
  if (!studentQ.data) {
    return (
      <main className="p-4 space-y-2">
        <EmptyState title="SISWA TIDAK DITEMUKAN" hint="Periksa tautan Anda." />
        <Link to={`/classroom/${classId}`} className="font-sans text-pixel-sm text-fg">
          â† kembali
        </Link>
      </main>
    );
  }

  const s = studentQ.data;
  const attendanceRate = (() => {
    const rows = attendanceBySession.data ?? [];
    const marked = rows.filter((r) => r.record);
    if (marked.length === 0) return null;
    const hadir = marked.filter((r) => r.record!.status === 'hadir').length;
    return Math.round((hadir / marked.length) * 100);
  })();

  const STATUS_SHORT: Record<AttendanceStatus, string> = {
    hadir: 'H',
    izin: 'I',
    sakit: 'S',
    alpha: 'A',
  };

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/student
        </h1>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="font-sans text-pixel-sm text-gray-300 hover:text-fg"
        >
          [HAPUS]
        </button>
      </header>

      <PixelCard title="profil" accent>
        <p className="font-sans text-body font-bold text-fg">{s.full_name}</p>
        <p className="font-sans text-pixel-sm text-gray-300 mt-0.5">
          NISN: {s.nisn || 'â€”'} · {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
        </p>
        {attendanceRate !== null && (
          <p className="font-sans text-pixel-sm text-gray-300 mt-1">
            kehadiran: <span className="text-fg">{attendanceRate}%</span>
          </p>
        )}
      </PixelCard>

      <PixelCard title="riwayat_absensi">
        {!attendanceBySession.data || attendanceBySession.data.length === 0 ? (
          <p className="font-sans text-pixel-sm text-gray-300">belum ada sesi tercatat</p>
        ) : (
          <ul className="flex flex-col">
            {attendanceBySession.data.map((row) => (
              <li
                key={row.sessionId}
                className="flex items-center justify-between border-b border-line last:border-b-0 py-1.5 font-sans text-pixel-sm"
              >
                <span className="text-gray-300">{formatJakartaDate(row.date)}</span>
                <span
                  className={
                    row.record?.status === 'hadir'
                      ? 'text-fg'
                      : row.record
                        ? 'text-fg'
                        : 'text-gray-500'
                  }
                >
                  {row.record ? STATUS_SHORT[row.record.status] : 'â€”'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>

      <div className="flex gap-2">
        <Link to={`/classroom/${classId}`}>
          <PixelButton variant="secondary">â† KELAS</PixelButton>
        </Link>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="HAPUS SISWA?"
        message={`${s.full_name} akan dihapus dari kelas ini beserta data absensinya.`}
        confirmLabel="HAPUS"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </main>
  );
}
