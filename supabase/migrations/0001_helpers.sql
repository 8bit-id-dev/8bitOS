-- 0001: Extensions + helper function
-- (Supabase already has auth schema; no extensions needed for Spec 1)

create or replace function public.is_owner(row_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select row_user_id = auth.uid()
$$;
