-- DG-ALLEN: managed, editable job categories.
-- Run AFTER 0001_init.sql. Safe to re-run (idempotent).
-- Lets staff add / rename / reorder / disable categories from the dashboard instead of
-- editing code. Jobs point at a category row via category_id.

-- ---------- Categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Link jobs -> categories (kept nullable; the legacy text `jobs.category` stays during transition).
alter table public.jobs
  add column if not exists category_id uuid references public.categories (id) on delete set null;

create index if not exists jobs_category_idx on public.jobs (category_id);

-- ---------- Row Level Security ----------
alter table public.categories enable row level security;

-- Public site reads only active categories; staff manage everything.
drop policy if exists "public reads active categories" on public.categories;
create policy "public reads active categories" on public.categories
  for select using (active);

drop policy if exists "staff manage categories" on public.categories;
create policy "staff manage categories" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- Seed from any existing job categories ----------
-- No-op on a fresh DB (jobs empty). Fills the list from current jobs otherwise.
insert into public.categories (name, slug, sort_order)
select distinct
       category,
       lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')),
       0
from public.jobs
where category is not null and category <> ''
on conflict (name) do nothing;

-- Backfill category_id on existing jobs from the legacy text column.
update public.jobs j
set category_id = c.id
from public.categories c
where j.category_id is null and c.name = j.category;
