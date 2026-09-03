-- 0006: Spec 3 — Assessment Engine + Gradebook

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  type text not null default 'quiz' check (type in ('quiz', 'daily_test', 'assignment', 'midterm', 'final', 'practice')),
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  position int not null default 0,
  type text not null default 'mc' check (type in ('mc', 'mc_multi', 'tf', 'short', 'essay')),
  prompt text not null default '',
  options jsonb not null default '[]',
  answer_key jsonb not null default 'null',
  points numeric not null default 1 check (points > 0)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score numeric,
  unique (assessment_id, student_id)
);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  response jsonb not null default 'null',
  is_correct boolean,
  score numeric not null default 0,
  unique (attempt_id, question_id)
);

create table if not exists public.grade_components (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  weight numeric not null default 100 check (weight >= 0 and weight <= 100),
  created_at timestamptz not null default now()
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  component_id uuid not null references public.grade_components(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score numeric not null check (score >= 0 and score <= 100),
  note text not null default '',
  recorded_at timestamptz not null default now(),
  unique (component_id, student_id)
);

create index if not exists idx_assessments_user on public.assessments (user_id, created_at desc);
create index if not exists idx_assessments_class on public.assessments (class_id);
create index if not exists idx_questions_assessment on public.questions (assessment_id, position);
create index if not exists idx_attempts_assessment on public.attempts (assessment_id);
create index if not exists idx_attempts_student on public.attempts (student_id);
create index if not exists idx_attempt_answers_attempt on public.attempt_answers (attempt_id);
create index if not exists idx_grade_components_class on public.grade_components (class_id);
create index if not exists idx_grades_component on public.grades (component_id);
create index if not exists idx_grades_student on public.grades (student_id);

alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.grade_components enable row level security;
alter table public.grades enable row level security;

create policy "owner all assessments" on public.assessments
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
create policy "owner all questions" on public.questions
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
create policy "owner all attempts" on public.attempts
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
create policy "owner all attempt_answers" on public.attempt_answers
  for all to authenticated using (
    public.is_owner((select user_id from public.attempts where id = attempt_id))
  ) with check (
    public.is_owner((select user_id from public.attempts where id = attempt_id))
  );
create policy "owner all grade_components" on public.grade_components
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
create policy "owner all grades" on public.grades
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
