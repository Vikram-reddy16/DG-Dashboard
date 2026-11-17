-- Applications now go through the website's Server Actions (service-role key), so anonymous
-- clients no longer need — or get — direct write access. This stops anyone hitting the
-- public anon key from spamming the table or the résumé bucket, bypassing Turnstile.
--
-- Deploy the new website code FIRST, then run this (the old code relied on these policies).

drop policy if exists "public can apply" on public.applications;
drop policy if exists "public uploads resumes" on storage.objects;

-- A résumé path can belong to only one application (the path doubles as a one-time ticket).
create unique index if not exists applications_resume_path_key
  on public.applications (resume_path) where resume_path is not null;
