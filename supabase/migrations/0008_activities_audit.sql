-- 0008: Doc 10 §17 activities timeline + §37 audit log

create table if not exists public.session_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  type text not null check (type in ('attendance', 'presentation', 'discussion', 'quiz', 'exercise', 'assessment', 'note', 'browser')),
  title text not null default '',
  started_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  action text not null check (action in ('create', 'update', 'delete')),
  old_value jsonb,
  new_value jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists idx_session_activities_session on public.session_activities (session_id, started_at);
create index if not exists idx_audit_user_time on public.audit_logs (user_id, timestamp desc);
create index if not exists idx_audit_entity on public.audit_logs (entity_type, entity_id);

alter table public.session_activities enable row level security;
alter table public.audit_logs enable row level security;

create policy "owner all session_activities" on public.session_activities
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));

create policy "owner all audit_logs" on public.audit_logs
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
