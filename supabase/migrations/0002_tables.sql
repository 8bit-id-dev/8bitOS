-- 0002: Core tables for Spec 1

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
