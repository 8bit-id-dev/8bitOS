-- 0005: Spec 2 — Planner + Notes

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  week_start date not null,
  topic text not null default '',
  goals text not null default '',
  method text not null default '',
  media text not null default '',
  activities text not null default '',
  reflection text not null default '',
  status text not null default 'draft' check (status in ('draft', 'ready', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, class_id, subject_id, week_start)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  session_id uuid references public.class_sessions(id) on delete set null,
  kind text not null default 'personal' check (kind in ('personal', 'meeting', 'class', 'session')),
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_plans_user_week on public.plans (user_id, week_start desc);
create index if not exists idx_plans_class on public.plans (class_id);
create index if not exists idx_notes_user_updated on public.notes (user_id, updated_at desc);
create index if not exists idx_notes_class on public.notes (class_id);
create index if not exists idx_notes_session on public.notes (session_id);

alter table public.plans enable row level security;
alter table public.notes enable row level security;

create policy "owner all plans" on public.plans
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "owner all notes" on public.notes
  for all to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));
