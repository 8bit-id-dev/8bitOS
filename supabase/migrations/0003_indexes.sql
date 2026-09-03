-- 0003: Indexes for hot paths

create index if not exists idx_classes_user on public.classes (user_id);
create index if not exists idx_students_class on public.students (class_id);
create index if not exists idx_schedule_user_dow on public.schedule_slots (user_id, day_of_week);
create index if not exists idx_schedule_class on public.schedule_slots (class_id);
create index if not exists idx_sessions_class on public.class_sessions (class_id, scheduled_for desc);
create index if not exists idx_attendance_session on public.attendance_records (session_id);
create index if not exists idx_class_subjects_class on public.class_subjects (class_id);
