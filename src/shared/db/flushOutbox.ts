import { insforge } from './insforge';
import {
  incrementAttempts,
  peek,
  remove,
  type AttendanceUpsert,
  type OutboxRow,
} from './outbox';

const flushAttendance = async (row: OutboxRow): Promise<boolean> => {
  const payload = row.payload as AttendanceUpsert;
  const { error } = await insforge.database
    .from('attendance_records')
    .upsert(
      [
        {
          session_id: payload.sessionId,
          student_id: payload.studentId,
          status: payload.status,
          note: payload.note ?? '',
          recorded_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'session_id,student_id' },
    );
  return !error;
};

export const flushOutbox = async (): Promise<{ flushed: number; remaining: number }> => {
  const rows = await peek();
  let flushed = 0;
  for (const row of rows) {
    let ok = false;
    try {
      ok = row.table === 'attendance_records' ? await flushAttendance(row) : false;
    } catch {
      ok = false;
    }
    if (ok) {
      await remove(row.id);
      flushed += 1;
    } else {
      await incrementAttempts(row.id);
    }
  }
  const remaining = rows.length - flushed;
  return { flushed, remaining };
};
