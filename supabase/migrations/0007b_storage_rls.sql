-- Storage RLS: per-user folder in documents bucket (owner uuid = auth.uid())
drop policy if exists "owner storage documents" on storage.objects;
create policy "owner storage documents" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents' and owner = auth.uid())
  with check (bucket_id = 'documents' and owner = auth.uid());
