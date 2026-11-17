-- DG-ALLEN: close the gaps between the dashboard UI and the schema so the app can
-- move from static dummy data to live Supabase data.
-- Run AFTER 0001_init.sql and 0002_categories.sql. Safe to re-run (idempotent).
--
-- What this adds:
--   1. categories.updated_at + touch trigger (parity with jobs; dashboard edits them).
--   2. Keep the denormalized jobs.category text in sync with the categories row, so
--      renaming / relinking a category from the dashboard propagates to its jobs
--      (the website and the jobs table filter on this text name).
--   3. applications.resume_name — the original file name to show next to the résumé
--      (resume_path stays the private storage key used to sign a download URL).
--   4. A staff-aware counts view so Overview / Jobs can read applicant totals in one
--      query instead of fetching every application row.

-- ---------- 1. categories.updated_at ----------
alter table public.categories
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

-- ---------- 2. Keep jobs.category (text) in sync with categories ----------
-- A) When a job is inserted or its category_id changes, stamp the current category name.
--    BEFORE trigger edits NEW in place, so there is no recursion.
create or replace function public.jobs_sync_category_name() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.category_id is not null then
    select name into new.category from public.categories where id = new.category_id;
  end if;
  return new;
end $$;

drop trigger if exists jobs_sync_category on public.jobs;
create trigger jobs_sync_category
  before insert or update of category_id on public.jobs
  for each row execute function public.jobs_sync_category_name();

-- B) When a category is renamed, push the new name onto every job that points at it.
--    Only touches the text column, not category_id, so trigger (A) does not re-fire.
create or replace function public.categories_propagate_rename() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.name is distinct from old.name then
    update public.jobs set category = new.name where category_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists categories_rename on public.categories;
create trigger categories_rename
  after update of name on public.categories
  for each row execute function public.categories_propagate_rename();

-- ---------- 3. Original résumé file name ----------
alter table public.applications
  add column if not exists resume_name text;

-- ---------- 4. Applicant counts view (RLS-aware) ----------
-- security_invoker = true => the underlying jobs/applications RLS applies to the caller:
--   * staff see true counts across all applications;
--   * the public/anon can read this view too, but the applications subquery returns 0
--     for them (they cannot read applications), so nothing leaks.
drop view if exists public.jobs_with_counts;
create view public.jobs_with_counts with (security_invoker = true) as
select
  j.*,
  (select count(*) from public.applications a where a.job_id = j.id) as applicant_count,
  (select count(*) from public.applications a where a.job_id = j.id and a.status = 'new') as new_applicant_count
from public.jobs j;

grant select on public.jobs_with_counts to anon, authenticated;
