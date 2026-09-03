import { supabase } from './supabase';
import type {
  AiJob,
  Assessment,
  AssessmentStatus,
  AssessmentType,
  Attempt,
  AttemptAnswer,
  AttendanceRecord,
  AttendanceStatus,
  ClassRow,
  ClassSession,
  DocumentKind,
  DocumentRow,
  Grade,
  GradeComponent,
  Note,
  NoteKind,
  Plan,
  Question,
  QuestionType,
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
  const { data: classes, error: classesError } = await supabase
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
      supabase.from('students').select('id, class_id').in('class_id', classIds),
      supabase
        .from('class_subjects')
        .select('class_id, subject_id, subject:subjects(name)')
        .in('class_id', classIds),
      supabase.from('subjects').select('id, name').eq('user_id', userId),
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
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as ClassRow | null) ?? null;
};

export const listStudentsByClass = async (classId: string): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .order('full_name');

  if (error) throw error;
  return (data ?? []) as unknown as Student[];
};

export const listScheduleForClass = async (classId: string): Promise<ScheduleSlot[]> => {
  const { data, error } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('class_id', classId)
    .order('day_of_week')
    .order('start_time');

  if (error) throw error;
  return (data ?? []) as unknown as ScheduleSlot[];
};

export const listSessionsForClass = async (classId: string): Promise<ClassSession[]> => {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('class_id', classId)
    .order('scheduled_for', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as unknown as ClassSession[];
};

export const listAttendanceForSession = async (sessionId: string): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
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
  const { data, error } = await supabase.from('class_sessions').insert(row).select('*').single();
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

// ---------- Student CRUD (Spec 2) ----------

export interface StudentDraft {
  class_id: string;
  full_name: string;
  nisn: string;
  gender: 'L' | 'P';
}

export const createStudent = async (userId: string, draft: StudentDraft): Promise<Student> => {
  const { data, error } = await supabase
    .from('students')
    .insert({ user_id: userId, ...draft })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Student;
};

export const updateStudent = async (
  studentId: string,
  patch: Partial<StudentDraft>,
): Promise<Student> => {
  const { data, error } = await supabase
    .from('students')
    .update(patch)
    .eq('id', studentId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Student;
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  const { error } = await supabase.from('students').delete().eq('id', studentId);
  if (error) throw error;
};

export const getStudentById = async (studentId: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Student | null) ?? null;
};

// ---------- Session lifecycle (Spec 2) ----------

export const endSession = async (sessionId: string): Promise<ClassSession> => {
  const { data, error } = await supabase
    .from('class_sessions')
    .update({ status: 'done' })
    .eq('id', sessionId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as ClassSession;
};

export const getSessionReport = async (
  sessionId: string,
): Promise<{
  session: ClassSession;
  attendance: AttendanceRecord[];
  notes: Note[];
}> => {
  const { data: session, error: sessionError } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) throw new Error('SESSION_NOT_FOUND');

  const [attendance, notes] = await Promise.all([
    listAttendanceForSession(sessionId),
    supabase
      .from('notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false }),
  ]);

  return {
    session: session as unknown as ClassSession,
    attendance,
    notes: (notes.data ?? []) as unknown as Note[],
  };
};

// ---------- Notes (Spec 2) ----------

export const listNotes = async (
  filter?: { classId?: string; kind?: NoteKind },
): Promise<Note[]> => {
  let q = supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(100);
  if (filter?.classId) q = q.eq('class_id', filter.classId);
  if (filter?.kind) q = q.eq('kind', filter.kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Note[];
};

export interface NoteDraft {
  kind: NoteKind;
  title: string;
  body: string;
  class_id?: string | null;
  session_id?: string | null;
}

export const createNote = async (userId: string, draft: NoteDraft): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: userId, ...draft })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Note;
};

export const updateNote = async (
  noteId: string,
  patch: Partial<Pick<Note, 'title' | 'body' | 'kind'>>,
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Note;
};

export const deleteNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw error;
};

// ---------- Planner (Spec 2) ----------

export const listPlans = async (userId: string, weekStart?: string): Promise<Plan[]> => {
  let q = supabase
    .from('plans')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(50);
  q = q.eq('user_id', userId);
  if (weekStart) q = q.eq('week_start', weekStart);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Plan[];
};

export interface PlanDraft {
  class_id: string | null;
  subject_id: string | null;
  week_start: string;
  topic: string;
  goals: string;
  method: string;
  media: string;
  activities: string;
  reflection: string;
  status: 'draft' | 'ready' | 'done';
}

export const upsertPlan = async (userId: string, draft: PlanDraft): Promise<Plan> => {
  const { data, error } = await supabase
    .from('plans')
    .upsert(
      { user_id: userId, ...draft, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,class_id,subject_id,week_start' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Plan;
};

export const deletePlan = async (planId: string): Promise<void> => {
  const { error } = await supabase.from('plans').delete().eq('id', planId);
  if (error) throw error;
};

// ---------- Assessment (Spec 3) ----------

export const listAssessments = async (userId: string, classId?: string): Promise<Assessment[]> => {
  let q = supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (classId) q = q.eq('class_id', classId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Assessment[];
};

export interface AssessmentDraft {
  class_id: string | null;
  subject_id: string | null;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
}

export const createAssessment = async (userId: string, draft: AssessmentDraft): Promise<Assessment> => {
  const { data, error } = await supabase
    .from('assessments')
    .insert({ user_id: userId, ...draft })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Assessment;
};

export const updateAssessment = async (
  assessmentId: string,
  patch: Partial<AssessmentDraft>,
): Promise<Assessment> => {
  const { data, error } = await supabase
    .from('assessments')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', assessmentId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Assessment;
};

export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  const { error } = await supabase.from('assessments').delete().eq('id', assessmentId);
  if (error) throw error;
};

export const listQuestions = async (assessmentId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('position');
  if (error) throw error;
  return (data ?? []).map(
    (r) =>
      ({
        ...r,
        options: ((r as { options?: unknown }).options ?? []) as string[],
      }) as unknown as Question,
  );
};

export interface QuestionDraft {
  assessment_id: string;
  position: number;
  type: QuestionType;
  prompt: string;
  options: string[];
  answer_key: string | null;
  points: number;
}

export const createQuestion = async (userId: string, draft: QuestionDraft): Promise<Question> => {
  const { data, error } = await supabase
    .from('questions')
    .insert({ user_id: userId, ...draft })
    .select('*')
    .single();
  if (error) throw error;
  return (data ?? []) as unknown as Question;
};

export const updateQuestion = async (
  questionId: string,
  patch: Partial<Omit<QuestionDraft, 'assessment_id' | 'position'>>,
): Promise<Question> => {
  const { data, error } = await supabase
    .from('questions')
    .update(patch)
    .eq('id', questionId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Question;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  if (error) throw error;
};

export interface AttemptSubmission {
  assessment_id: string;
  student_id: string;
  responses: Record<string, string | null>;
  scores: Record<string, { score: number; isCorrect: boolean }>;
  totalScore: number | null;
  maxScore: number;
}

export const saveAttempt = async (
  userId: string,
  sub: AttemptSubmission,
): Promise<Attempt> => {
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .upsert(
      {
        user_id: userId,
        assessment_id: sub.assessment_id,
        student_id: sub.student_id,
        finished_at: new Date().toISOString(),
        score: sub.totalScore,
      },
      { onConflict: 'assessment_id,student_id' },
    )
    .select('*')
    .single();
  if (attemptError) throw attemptError;

  const rows = Object.entries(sub.responses).map(([questionId, response]) => ({
    attempt_id: (attempt as unknown as Attempt).id,
    question_id: questionId,
    response,
    is_correct: sub.scores[questionId]?.isCorrect ?? null,
    score: sub.scores[questionId]?.score ?? 0,
  }));
  if (rows.length > 0) {
    const { error: answersError } = await supabase
      .from('attempt_answers')
      .upsert(rows, { onConflict: 'attempt_id,question_id' });
    if (answersError) throw answersError;
  }
  return attempt as unknown as Attempt;
};

export const listAttempts = async (assessmentId: string): Promise<Attempt[]> => {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('score', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Attempt[];
};

export const listAttemptAnswers = async (attemptId: string): Promise<AttemptAnswer[]> => {
  const { data, error } = await supabase
    .from('attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId);
  if (error) throw error;
  return (data ?? []) as unknown as AttemptAnswer[];
};

// ---------- Gradebook (Spec 3) ----------

export const listGradeComponents = async (classId: string): Promise<GradeComponent[]> => {
  const { data, error } = await supabase
    .from('grade_components')
    .select('*')
    .eq('class_id', classId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as unknown as GradeComponent[];
};

export const createGradeComponents = async (
  userId: string,
  classId: string,
  comps: Array<{ name: string; weight: number }>,
): Promise<GradeComponent[]> => {
  const rows = comps.map((c) => ({ user_id: userId, class_id: classId, ...c }));
  const { data, error } = await supabase.from('grade_components').insert(rows).select('*');
  if (error) throw error;
  return (data ?? []) as unknown as GradeComponent[];
};

export const deleteGradeComponent = async (componentId: string): Promise<void> => {
  const { error } = await supabase.from('grade_components').delete().eq('id', componentId);
  if (error) throw error;
};

export const listGradesByClass = async (classId: string): Promise<Grade[]> => {
  const { data, error } = await supabase
    .from('grades')
    .select('*, component:grade_components!inner(id, class_id)')
    .eq('component.class_id', classId);
  if (error) throw error;
  return (data ?? []) as unknown as Grade[];
};

export const upsertGrade = async (
  userId: string,
  componentId: string,
  studentId: string,
  score: number,
  note?: string,
): Promise<Grade> => {
  const { data, error } = await supabase
    .from('grades')
    .upsert(
      {
        user_id: userId,
        component_id: componentId,
        student_id: studentId,
        score,
        note: note ?? '',
        recorded_at: new Date().toISOString(),
      },
      { onConflict: 'component_id,student_id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as Grade;
};

// ---------- Documents (Spec 4) ----------

export interface DocumentMetaDraft {
  class_id?: string | null;
  subject_id?: string | null;
  kind: DocumentKind;
  tags?: string;
}

export const uploadDocument = async (
  userId: string,
  file: File,
  meta: DocumentMetaDraft,
): Promise<DocumentRow> => {
  const storageKey = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
  const { error: upErr } = await supabase.storage
    .from('documents')
    .upload(storageKey, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      class_id: meta.class_id ?? null,
      subject_id: meta.subject_id ?? null,
      title: file.name,
      kind: meta.kind,
      storage_key: storageKey,
      mime_type: file.type,
      size_bytes: file.size,
      tags: meta.tags ?? '',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as DocumentRow;
};

export const listDocuments = async (
  filter?: { classId?: string; kind?: DocumentKind },
): Promise<DocumentRow[]> => {
  let q = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filter?.classId) q = q.eq('class_id', filter.classId);
  if (filter?.kind) q = q.eq('kind', filter.kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as DocumentRow[];
};

export const deleteDocument = async (doc: DocumentRow): Promise<void> => {
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([doc.storage_key]);
  if (storageError) throw storageError;
  const { error } = await supabase.from('documents').delete().eq('id', doc.id);
  if (error) throw error;
};

export const getDocumentUrl = async (doc: DocumentRow): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_key, 3600);
  if (error || !data) throw error ?? new Error('NO_URL');
  return (data as { signedUrl: string }).signedUrl;
};

// ---------- AI jobs (Spec 4) ----------

export interface AiJobDraft {
  kind: string;
  prompt: string;
  linked_class_id?: string | null;
}

export const createAiJob = async (userId: string, draft: AiJobDraft): Promise<AiJob> => {
  const { data, error } = await supabase
    .from('ai_jobs')
    .insert({ user_id: userId, ...draft, status: 'running' })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as AiJob;
};

export const finishAiJob = async (
  jobId: string,
  response: string,
): Promise<AiJob> => {
  const { data, error } = await supabase
    .from('ai_jobs')
    .update({ response, status: 'done', finished_at: new Date().toISOString() })
    .eq('id', jobId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as AiJob;
};

export const failAiJob = async (jobId: string, message: string): Promise<void> => {
  const { error } = await supabase
    .from('ai_jobs')
    .update({ status: 'error', error: message, finished_at: new Date().toISOString() })
    .eq('id', jobId);
  if (error) throw error;
};

export const listAiJobs = async (limit = 20): Promise<AiJob[]> => {
  const { data, error } = await supabase
    .from('ai_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as AiJob[];
};

export const saveAiResponseToNote = async (
  userId: string,
  job: AiJob,
): Promise<Note> => {
  return createNote(userId, {
    kind: 'personal',
    title: `AI: ${job.prompt.slice(0, 60)}`,
    body: job.response ?? '',
  });
};
