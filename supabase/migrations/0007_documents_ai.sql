-- 0007: Spec 4 — Document Center + AI Assistant

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  kind text not null default 'lainnya' check (kind in ('modul_ajar', 'rpp', 'lkpd', 'soal', 'nilai', 'surat', 'lainnya')),
  storage_key text not null,
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  tags text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'free',
  prompt text not null,
  response text,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'error')),
  error text,
  linked_class_id uuid references public.classes(id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_documents_user on public.documents (user_id, created_at desc);
create index if not exists idx_documents_class on public.documents (class_id);
create index if not exists idx_ai_jobs_user on public.ai_jobs (user_id, created_at desc);

alter table public.documents enable row level security;
alter table public.ai_jobs enable row level security;

create policy "owner all documents" on public.documents
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));

create policy "owner all ai_jobs" on public.ai_jobs
  for all to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id));
