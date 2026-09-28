-- Storage for generated hero images (DAR-385).
-- OpenRouter returns images as base64, so they are stored here and posts keep
-- the public URL (WordPress publishing downloads it later). The bucket is
-- public because published hero images are public anyway; object names are
-- random UUIDs under the owner's folder, so they cannot be listed or guessed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-images',
  'hero-images',
  true,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Signed-in users may only write into their own folder: <auth.uid()>/<file>.
-- Plain (non-upsert) uploads need INSERT only; reads go through public URLs.
create policy "hero_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'hero-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
