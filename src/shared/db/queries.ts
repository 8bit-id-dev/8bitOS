import { insforge } from './insforge';
import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassRow,
  ClassSession,
  ScheduleSlot,
  Student,
  Subject,
} from './types';
import { enqueueAttendance } from './outbox';

export interface ClassSummary {
  classRow: ClassRow;
  studentCount: number;
  subjectNames: string[];
}

const classListCacheKey = (userId: string): string => `8bithos:class-list:${userId}`;

const safeJson = (s: string | null): unknown => {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export const listClassesForUser = async (userId: string): Promise<ClassSummary[]> => {
  const { data: classes, error: classesError } = await insforge.database
    .from('classes')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (classesError) throw classesError;
  const classRows = (classes ?? []) as unknown as ClassRow[];

  if (classRows.length === 0) {
    const cached = safeJson(localStorage.getItem(classListCacheKey(userId))) as ClassSummary[] | null;
    return cached ?? [];
  }

  const classIds = classRows.map((c) => c.id);

  const [{ data: students, error: studentsError }, { data: links, error: linksError }, { data: subjects, error: subjectsError }] =
    await Promise.all([
      insforge.database.from('students').select('id, class_id').in('class_id', classIds),
      insforge.database.from('class_subjects').select('class_id, subject_id, subject:subjects(name)').in('class_id', classIds),
      insforge.database.from('subjects').select('id, name').eq('user_id', userId),
    ]);

  if (studentsError) throw studentsError;
  if (linksError) throw linksError;
  if (subjectsError) throw subjectsError;

  const studentRows = (students ?? []) as unknown as Array<Pick<Student, 'id' | 'class_id'>>;
  const subjectRows = (subjects ?? []) as unknown as Pick<Subject, 'id' | 'name'>[];
  const subjectById = new Map(subjectRows.map((s) => [s.id, s.name]));

  type LinkRow = { class_id: string; subject_id: string; subject: { name: string } | null };
  const linkRows = (links ?? []) as unknown as LinkRow[];

  const studentsByClass = new Map<string, number>();
  for (const s of studentRows) {
    studentsByClass.set(s.class_id, (studentsByClass.get(s.class_id) ?? 0) + 1);
  }
  const subjectsByClass = new Map<string, Set<string>>();
  for (const l of linkRows) {
    if (!subjectsByClass.has(l.class_id)) subjectsByClass.set(l.class_id, new Set());
    const name = l.subject?.name ?? subjectById.get(l.subject_id) ?? '';
    if (name) subjectsByClass.get(l.class_id)!.add(name);
  }

  const summaries: ClassSummary[] = classRows.map((c) => ({
    classRow: c,
    studentCount: studentsByClass.get(c.id) ?? 0,
    subjectNames: Array.from(subjectsByClass.get(c.id) ?? []).sort(),
  }));

  try {
    localStorage.setItem(classListCacheKey(userId), JSON.stringify(summaries));
  } catch {
    // storage may be full or disabled; cache is best-effort
  }
  return summaries;
};

export const getClassById = async (userId: string, classId: string): Promise<ClassRow | null> => {
  const { data, error } = await insforge.database
    .from('classes')
    .select('*')
    .eq('id', classId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as ClassRow | null) ?? null;
};

export const listStudentsByClass = async (classId: string): Promise<Student[]> => {
  const { data, error } = await insforge.database
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .order('full_name');

  if (error) throw error;
  return (data ?? []) as unknown as Student[];
};

export const listScheduleForClass = async (classId: string): Promise<ScheduleSlot[]> => {
  const { data, error } = await insforge.database
    .from('schedule_slots')
    .select('*')
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time');

  if (error) throw error;
  return (data ?? []) as unknown as ScheduleSlot[];
};

export const listSessionsForClass = async (classId: string): Promise<ClassSession[]> => {
  const { data, error } = await insforge.database
    .from('class_sessions')
    .select('*')
    .eq('class_id', classId)
    .order('scheduled_for', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as unknown as ClassSession[];
};

export const listAttendanceForSession = async (sessionId: string): Promise<AttendanceRecord[]> => {
  const { data, error } = await insforge.database
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId);

  if (error) throw error;
  return (data ?? []) as unknown as AttendanceRecord[];
};

export const createSession = async (
  userId: string,
  classId: string,
  subjectId: string,
  scheduledFor: Date,
  topic: string,
): Promise<ClassSession> => {
  const row = {
    user_id: userId,
    class_id: classId,
    subject_id: subjectId,
    scheduled_for: scheduledFor.toISOString(),
    duration_minutes: 45,
    topic,
    status: 'active' as const,
  };
  const { data, error } = await insforge.database.from('class_sessions').insert([row]).select('*').single();
  if (error) throw error;
  return data as unknown as ClassSession;
};

export const upsertAttendance = async (
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
  note?: string,
): Promise<void> => {
  await enqueueAttendance({ sessionId, studentId, status, note });
};
