export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpha';
export type SessionStatus = 'planned' | 'active' | 'done';
export type Gender = 'L' | 'P';

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color_token: string;
  created_at: string;
}

export interface ClassRow {
  id: string;
  user_id: string;
  name: string;
  grade_level: number;
  homeroom: string;
  academic_year: string;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  class_id: string;
  full_name: string;
  nisn: string;
  gender: Gender;
  created_at: string;
}

export interface ScheduleSlot {
  id: string;
  user_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface ClassSession {
  id: string;
  user_id: string;
  class_id: string;
  subject_id: string;
  scheduled_for: string;
  duration_minutes: number;
  topic: string;
  status: SessionStatus;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  note: string;
  recorded_at: string;
}

export type PlanStatus = 'draft' | 'ready' | 'done';

export interface Plan {
  id: string;
  user_id: string;
  class_id: string | null;
  subject_id: string | null;
  week_start: string;
  topic: string;
  goals: string;
  method: string;
  media: string;
  activities: string;
  reflection: string;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export type NoteKind = 'personal' | 'meeting' | 'class' | 'session';

export interface Note {
  id: string;
  user_id: string;
  class_id: string | null;
  session_id: string | null;
  kind: NoteKind;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

// ---------- Spec 3: Assessment ----------

export type AssessmentType = 'quiz' | 'daily_test' | 'assignment' | 'midterm' | 'final' | 'practice';
export type AssessmentStatus = 'draft' | 'published' | 'closed';
export type QuestionType = 'mc' | 'mc_multi' | 'tf' | 'short' | 'essay';

export interface Assessment {
  id: string;
  user_id: string;
  class_id: string | null;
  subject_id: string | null;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  assessment_id: string;
  position: number;
  type: QuestionType;
  prompt: string;
  options: string[];
  answer_key: string | null;
  points: number;
}

export interface Attempt {
  id: string;
  user_id: string;
  assessment_id: string;
  student_id: string;
  started_at: string;
  finished_at: string | null;
  score: number | null;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  response: string | null;
  is_correct: boolean | null;
  score: number;
}

// ---------- Spec 3: Gradebook ----------

export interface GradeComponent {
  id: string;
  user_id: string;
  class_id: string;
  name: string;
  weight: number;
  created_at: string;
}

export interface Grade {
  id: string;
  user_id: string;
  component_id: string;
  student_id: string;
  score: number;
  note: string;
  recorded_at: string;
}

// ---------- Spec 4: Document Center ----------

export type DocumentKind = 'modul_ajar' | 'rpp' | 'lkpd' | 'soal' | 'nilai' | 'surat' | 'lainnya';

export interface DocumentRow {
  id: string;
  user_id: string;
  class_id: string | null;
  subject_id: string | null;
  title: string;
  kind: DocumentKind;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  tags: string;
  created_at: string;
}

// ---------- Spec 4: AI Assistant ----------

export type AiJobStatus = 'pending' | 'running' | 'done' | 'error';

export interface AiJob {
  id: string;
  user_id: string;
  kind: string;
  prompt: string;
  response: string | null;
  status: AiJobStatus;
  error: string | null;
  linked_class_id: string | null;
  created_at: string;
  finished_at: string | null;
}

// ---------- Doc 10 §17: Session Activities (timeline KBM) ----------

export type ActivityType =
  | 'attendance'
  | 'presentation'
  | 'discussion'
  | 'quiz'
  | 'exercise'
  | 'assessment'
  | 'note'
  | 'browser';

export interface SessionActivity {
  id: string;
  user_id: string;
  session_id: string;
  type: ActivityType;
  title: string;
  started_at: string;
  metadata: Record<string, unknown>;
}

// ---------- Doc 10 §37: Audit Log ----------

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditLog {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  timestamp: string;
}
