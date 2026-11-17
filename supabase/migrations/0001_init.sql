-- DG-ALLEN initial schema. Run once in Supabase Dashboard > SQL Editor (or `supabase db push`).
-- Shared by the public website (anon key) and the admin dashboard (logged-in staff).

-- ---------- Staff (who may use the dashboard) ----------
-- One row per employee. Login/JWT is handled by Supabase Auth; this table decides who is
-- allowed in. To REVOKE access: set active = false (takes effect on the very next request,
-- because RLS checks this table, not the JWT). Also ban the auth user to kill the session.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'recruiter' check (role in ('admin', 'recruiter')),
  active boolean not null default true,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- Any active employee (admin or recruiter).
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

-- Active admins only (manage the team).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active and role = 'admin');
$$;

-- ---------- Jobs ----------
create table public.jobs (
  id text primary key,                       -- e.g. JAV-418
  slug text not null unique,
  title text not null,
  category text not null,
  experience_years int not null default 0,
  city text,
  region text,
  workplace text not null check (workplace in ('Remote', 'Hybrid', 'Onsite')),
  engagement text[] not null default '{}',  -- W2 / C2C / 1099 / Full-time
  pay_min numeric,
  pay_max numeric,
  pay_unit text check (pay_unit in ('hr', 'yr')),
  duration text,
  work_auth text[] not null default '{}',
  skills text[] not null default '{}',
  summary text not null default '',
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  positions_total int not null default 1 check (positions_total >= 0),
  positions_filled int not null default 0 check (positions_filled >= 0),
  posted_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (positions_filled <= positions_total)
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger jobs_touch before update on public.jobs
  for each row execute function public.touch_updated_at();

-- ---------- Applications ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id text references public.jobs (id) on delete set null,  -- null = talent-network sign-up
  name text not null,
  email text not null,
  phone text not null,
  work_auth text not null,
  location text,
  years_experience int,
  tax_term text,
  link text,
  note text,
  resume_path text,                          -- path inside the private `resumes` bucket
  status text not null default 'new' check (status in ('new', 'shortlisted', 'rejected', 'hired')),
  internal_notes text,
  created_at timestamptz not null default now()
);
create index applications_job_idx on public.applications (job_id);
create index applications_status_idx on public.applications (status);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- profiles: everyone sees their own row; active staff see the team; only admins change it.
create policy "own profile" on public.profiles for select using (id = auth.uid());
create policy "staff see team" on public.profiles for select using (public.is_staff());
create policy "admins manage team" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- jobs: public sees published only; staff do everything.
create policy "public reads published jobs" on public.jobs
  for select using (status = 'published');
create policy "staff manage jobs" on public.jobs
  for all using (public.is_staff()) with check (public.is_staff());

-- applications: public may insert (apply) but never read; staff do everything.
create policy "public can apply" on public.applications
  for insert to anon, authenticated
  with check (status = 'new' and internal_notes is null);
create policy "staff manage applications" on public.applications
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------- Storage: private résumé bucket ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('resumes', 'resumes', false, 5242880)
on conflict (id) do nothing;

-- Anyone may upload into resumes/ (signed-URL flow from the site); only staff may read/delete.
create policy "public uploads resumes" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'resumes');
create policy "staff read resumes" on storage.objects
  for select using (bucket_id = 'resumes' and public.is_staff());
create policy "staff delete resumes" on storage.objects
  for delete using (bucket_id = 'resumes' and public.is_staff());

-- ---------- After running: make yourself an admin ----------
-- 1. Authentication > Users > Add user (your email + password)
-- 2. insert into public.profiles (id, email, full_name, role)
--    select id, email, 'Your Name', 'admin' from auth.users where email = 'YOU@example.com';
-- Later, the dashboard's Team page (admins only) adds/revokes employees via the service-role key.
