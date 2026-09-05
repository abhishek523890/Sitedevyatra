-- =====================================================================
-- DevYatra India :: 0003_storage.sql
-- Storage buckets + access policies.
--   public-media  : package/gallery/blog images (public read)
--   documents     : traveller IDs, invoices (PRIVATE - signed URLs only)
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Public media: world-readable, staff-writable.
create policy "public media read" on storage.objects
  for select using (bucket_id = 'public-media');

create policy "staff media write" on storage.objects
  for insert with check (bucket_id = 'public-media' and public.is_staff());

create policy "staff media update" on storage.objects
  for update using (bucket_id = 'public-media' and public.is_staff());

create policy "staff media delete" on storage.objects
  for delete using (bucket_id = 'public-media' and public.is_staff());

-- Private documents: only staff or the uploading owner can read.
-- Files are stored under "<user_id>/<filename>" so the first path segment = owner.
create policy "documents owner or staff read" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (public.is_staff() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "documents owner write" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "documents staff manage" on storage.objects
  for all using (bucket_id = 'documents' and public.is_staff())
  with check (bucket_id = 'documents' and public.is_staff());
