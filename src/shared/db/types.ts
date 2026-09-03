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
