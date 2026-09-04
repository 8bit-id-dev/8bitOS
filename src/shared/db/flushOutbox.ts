import { supabase } from './supabase';
import { incrementAttempts, peek, remove, type OutboxRow } from './outbox';
import type { ActivityInsert, AttendanceUpsert, GradeUpsert, NoteUpsert } from './outbox';

// Flush multi-entitas (Dok 10 §35): kirim semua antrian saat online.
// Urutan penting: activities dulu (timeline), lalu attendance, notes, grades.
const TABLE_ORDER: Record<OutboxRow['table'], number> = {
  session_activities: 0,
  attendance_records: 1,
  notes: 2,
  grades: 3,
};

const flushOne = async (row: OutboxRow): Promise<boolean> => {
  const p = row.payload;
  if (row.table === 'attendance_records') {
    const a = p as AttendanceUpsert;
    const { error } = await supabase.from('attendance_records').upsert(
      {
        session_id: a.sessionId,
        student_id: a.studentId,
        status: a.status,
        note: a.note ?? '',
        recorded_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,student_id' },
    );
    return !error;
  }
  if (row.table === 'notes') {
    const n = p as NoteUpsert;
    const { error } = await supabase.from('notes').upsert(
      {
        id: n.noteId,
        user_id: n.userId,
        title: n.title,
        body: n.body,
        kind: n.kind,
        class_id: n.classId ?? null,
        session_id: n.sessionId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    return !error;
  }
  if (row.table === 'grades') {
    const g = p as GradeUpsert;
    const { error } = await supabase.from('grades').upsert(
      {
        user_id: g.userId,
        component_id: g.componentId,
        student_id: g.studentId,
        score: g.score,
        note: g.note ?? '',
        recorded_at: new Date().toISOString(),
      },
      { onConflict: 'component_id,student_id' },
    );
    return !error;
  }
  if (row.table === 'session_activities') {
    const act = p as ActivityInsert;
    const { error } = await supabase.from('session_activities').insert({
      user_id: act.userId,
      session_id: act.sessionId,
      type: act.type,
      title: act.title,
      metadata: act.metadata ?? {},
    });
    return !error;
  }
  return false;
};

export const flushOutbox = async (): Promise<{ flushed: number; remaining: number }> => {
  const rows = await peek();
  // Urutkan per-entity agar dependency terjaga (activity → attendance → note → grade)
  const ordered = [...rows].sort((a, b) => TABLE_ORDER[a.table] - TABLE_ORDER[b.table]);
  let flushed = 0;
  for (const row of ordered) {
    let ok = false;
    try {
      ok = await flushOne(row);
    } catch {
      ok = false;
    }
    if (ok) {
      if (row.id !== undefined) await remove(row.id);
      flushed += 1;
    } else {
      if (row.id !== undefined) await incrementAttempts(row.id);
    }
  }
  const remaining = ordered.length - flushed;
  return { flushed, remaining };
};
