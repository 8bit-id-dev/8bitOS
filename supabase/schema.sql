-- 8bitOS Spec 1 — Combined schema (paste once into Supabase SQL Editor)
-- = 0001 helpers + 0002 tables + 0003 indexes + 0004 RLS

create or replace function public.is_owner(row_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select row_user_id = auth.uid()
$$;

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color_token text not null default 'fg',
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  grade_level int not null,
  homeroom text not null default '',
  academic_year text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, subject_id)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  full_name text not null,
  nisn text not null default '',
  gender char(1) not null default 'L' check (gender in ('L', 'P')),
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text not null default '',
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now()
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  scheduled_for timestamptz not null,
  duration_minutes int not null default 45,
  topic text not null default '',
  status text not null default 'planned' check (status in ('planned', 'active', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null check (status in ('hadir', 'izin', 'sakit', 'alpha')),
  note text not null default '',
  recorded_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists idx_classes_user on public.classes (user_id);
create index if not exists idx_students_class on public.students (class_id);
create index if not exists idx_schedule_user_dow on public.schedule_slots (user_id, day_of_week);
create index if not exists idx_schedule_class on public.schedule_slots (class_id);
create index if not exists idx_sessions_class on public.class_sessions (class_id, scheduled_for desc);
create index if not exists idx_attendance_session on public.attendance_records (session_id);
create index if not exists idx_class_subjects_class on public.class_subjects (class_id);

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
