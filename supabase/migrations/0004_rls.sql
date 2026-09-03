-- 0004: Row Level Security — all tables owner-only

alter table public.subjects enable row level security;
alter table public.classes enable row level security;
alter table public.class_subjects enable row level security;
alter table public.students enable row level security;
alter table public.schedule_slots enable row level security;
alter table public.class_sessions enable row level security;
alter table public.attendance_records enable row level security;

create policy "owner all subjects" on public.subjects
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "owner all classes" on public.classes
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "owner all class_subjects" on public.class_subjects
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "owner all students" on public.students
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "owner all schedule_slots" on public.schedule_slots
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "owner all class_sessions" on public.class_sessions
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- attendance_records has no user_id; check via session owner
create policy "owner all attendance_records" on public.attendance_records
  for all to authenticated
  using (
    public.is_owner(
      (select user_id from public.class_sessions where id = session_id)
    )
  )
  with check (
    public.is_owner(
      (select user_id from public.class_sessions where id = session_id)
    )
  );
