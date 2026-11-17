-- DG-ALLEN development seed data.
-- Mirrors the dashboard prototype (src/lib/data.js) so the UI can read live data.
-- Run AFTER migrations 0001/0002/0003. Idempotent: safe to re-run (upserts on id/name).
-- Apply with: supabase db push already done -> run this via the DB url:
--   psql "$DBURL" -f supabase/seed_dev.sql   (or the scratchpad runner used below)
-- NOTE: inserts run as the DB owner and bypass RLS. Does NOT touch profiles/auth.

begin;

-- ---------- Categories ----------
insert into public.categories (name, slug, sort_order, active) values
  ('Software Engineering', 'software-engineering', 0, true),
  ('Data & AI',            'data-ai',              1, true),
  ('Cloud & DevOps',       'cloud-devops',         2, true),
  ('Quality Assurance',    'quality-assurance',    3, true),
  ('Cybersecurity',        'cybersecurity',        4, true),
  ('ERP / SAP',            'erp-sap',              5, true),
  ('Business & PM',        'business-pm',          6, true),
  ('IT Support',           'it-support',           7, false)
on conflict (name) do update
  set slug = excluded.slug,
      sort_order = excluded.sort_order,
      active = excluded.active;

-- ---------- Jobs ----------
-- category_id is resolved from the category name; the 0003 trigger keeps jobs.category in sync.
insert into public.jobs
  (id, slug, title, category, category_id, experience_years, city, region, workplace,
   engagement, pay_min, pay_max, pay_unit, duration, work_auth, skills, summary,
   status, positions_total, positions_filled, posted_at)
values
  ('JAV-418', 'senior-java-developer-jav-418', 'Senior Java Developer',
     'Software Engineering', (select id from public.categories where name='Software Engineering'),
     8, 'Dallas', 'TX', 'Hybrid',
     '{C2C,W2}', 60, 72, 'hr', '12-month contract', '{USC,GC,GC-EAD,H1B,TN}',
     '{Java,"Spring Boot",Microservices,AWS,Kafka,REST}',
     'Build and scale backend services for a Fortune-500 financial platform. Own core microservices end-to-end and mentor two mid-level engineers.',
     'published', 2, 0, current_date - 2),

  ('DAT-512', 'data-engineer-dat-512', 'Data Engineer',
     'Data & AI', (select id from public.categories where name='Data & AI'),
     7, 'Charlotte', 'NC', 'Hybrid',
     '{C2C,W2}', 62, 75, 'hr', '12-month contract', '{USC,GC,GC-EAD,H1B}',
     '{Python,Spark,Snowflake,Airflow,SQL,dbt}',
     'Own the data platform powering analytics for a national retailer - batch and streaming pipelines into Snowflake.',
     'published', 1, 0, current_date - 1),

  ('RCT-307', 'react-front-end-developer-rct-307', 'React Front-End Developer',
     'Software Engineering', (select id from public.categories where name='Software Engineering'),
     4, null, null, 'Remote',
     '{W2,C2C}', 50, 62, 'hr', '6-month contract-to-hire', '{USC,GC,H1B,OPT/CPT}',
     '{React,TypeScript,Redux,Jest,Tailwind}',
     'Craft the candidate-facing UI for a healthcare scheduling product. Fully remote team with strong design partnership.',
     'published', 1, 0, current_date - 4),

  ('DVO-145', 'devops-engineer-dvo-145', 'DevOps Engineer',
     'Cloud & DevOps', (select id from public.categories where name='Cloud & DevOps'),
     5, 'Austin', 'TX', 'Hybrid',
     '{W2,C2C}', 58, 70, 'hr', '12-month contract', '{USC,GC,GC-EAD,H1B,TN}',
     '{AWS,Terraform,Kubernetes,CI/CD,Docker,Jenkins}',
     'Automate infrastructure and delivery for a SaaS company migrating to Kubernetes.',
     'published', 1, 0, current_date - 3),

  ('SEC-204', 'cybersecurity-analyst-federal-sec-204', 'Cybersecurity Analyst (Federal)',
     'Cybersecurity', (select id from public.categories where name='Cybersecurity'),
     4, 'Washington', 'DC', 'Onsite',
     '{W2}', 55, 65, 'hr', '12-month contract', '{USC}',
     '{SIEM,Splunk,"Incident Response",NIST,"Threat Hunting"}',
     'Monitor and defend a federal agency environment from a SOC. US citizenship required; clearance-eligible preferred.',
     'published', 3, 1, current_date - 3),

  ('SWE-100', 'software-engineer-new-grad-opt-swe-100', 'Software Engineer - New Grad / OPT',
     'Software Engineering', (select id from public.categories where name='Software Engineering'),
     0, null, null, 'Remote',
     '{Full-time}', 70000, 85000, 'yr', 'Full-time - permanent', '{OPT/CPT,USC,GC}',
     '{Java,Python,SQL,Git,"Data Structures"}',
     'Start your US career on a mentored engineering team. Structured onboarding, real projects, and OPT/CPT welcome.',
     'draft', 4, 0, current_date - 2),

  ('MLE-233', 'machine-learning-engineer-mle-233', 'Machine Learning Engineer',
     'Data & AI', (select id from public.categories where name='Data & AI'),
     6, null, null, 'Remote',
     '{C2C,W2,1099}', 70, 85, 'hr', '12-month contract', '{USC,GC,H1B}',
     '{Python,PyTorch,MLOps,SageMaker,Docker}',
     'Take models from notebook to production for a logistics forecasting team - own training, serving and monitoring.',
     'draft', 1, 0, current_date - 6),

  ('QAA-276', 'qa-automation-engineer-qaa-276', 'QA Automation Engineer',
     'Quality Assurance', (select id from public.categories where name='Quality Assurance'),
     4, 'Jersey City', 'NJ', 'Onsite',
     '{W2,C2C}', 48, 58, 'hr', '6-month contract', '{USC,GC,H1B,OPT/CPT,H4-EAD}',
     '{Selenium,Java,Cucumber,"API Testing",Postman}',
     'Own test automation for a banking web app - expand coverage and wire tests into the pipeline.',
     'closed', 1, 1, current_date - 20)
on conflict (id) do update
  set slug = excluded.slug, title = excluded.title, category = excluded.category,
      category_id = excluded.category_id, experience_years = excluded.experience_years,
      city = excluded.city, region = excluded.region, workplace = excluded.workplace,
      engagement = excluded.engagement, pay_min = excluded.pay_min, pay_max = excluded.pay_max,
      pay_unit = excluded.pay_unit, duration = excluded.duration, work_auth = excluded.work_auth,
      skills = excluded.skills, summary = excluded.summary, status = excluded.status,
      positions_total = excluded.positions_total, positions_filled = excluded.positions_filled,
      posted_at = excluded.posted_at;

-- ---------- Applications ----------
-- Fixed UUIDs so re-running the seed is idempotent. created_at is relative to now().
insert into public.applications
  (id, job_id, name, email, phone, work_auth, location, years_experience, tax_term,
   link, note, resume_name, status, created_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'JAV-418', 'Jaideep Rao', 'jaideep.rao@example.com', '+1 (469) 555-0142', 'H1B', 'Dallas, TX', 9, 'C2C', 'https://linkedin.com/in/jaideeprao', 'Available in 2 weeks, open to hybrid in DFW.', 'Jaideep_Rao_Java.pdf', 'shortlisted', now() - interval '2 hours'),
  ('00000000-0000-0000-0000-0000000000a2', 'DAT-512', 'Priya Menon', 'priya.menon@example.com', '+1 (704) 555-0119', 'GC', 'Charlotte, NC', 8, 'W2', '', 'Strong Snowflake + dbt background.', 'Priya_Menon_DataEng.pdf', 'new', now() - interval '5 hours'),
  ('00000000-0000-0000-0000-0000000000a3', 'RCT-307', 'Daniel Okafor', 'daniel.okafor@example.com', '+1 (212) 555-0188', 'USC', 'Remote', 5, 'W2', 'https://danielok.dev', '', 'Daniel_Okafor_React.pdf', 'new', now() - interval '9 hours'),
  ('00000000-0000-0000-0000-0000000000a4', 'JAV-418', 'Sana Qureshi', 'sana.q@example.com', '+1 (646) 555-0170', 'GC-EAD', 'Irving, TX', 7, 'C2C', '', 'Kafka + Spring Boot, ex-fintech.', 'Sana_Qureshi.pdf', 'new', now() - interval '22 hours'),
  ('00000000-0000-0000-0000-0000000000a5', 'SEC-204', 'Marcus Bell', 'marcus.bell@example.com', '+1 (202) 555-0133', 'USC', 'Arlington, VA', 6, 'W2', '', 'Active Secret clearance.', 'Marcus_Bell_SOC.pdf', 'hired', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000a6', 'DVO-145', 'Wei Zhang', 'wei.zhang@example.com', '+1 (512) 555-0155', 'H1B', 'Austin, TX', 5, 'C2C', 'https://github.com/weizh', '', 'Wei_Zhang_DevOps.pdf', 'shortlisted', now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000a7', 'DAT-512', 'Laura Benitez', 'laura.benitez@example.com', '+1 (980) 555-0101', 'USC', 'Charlotte, NC', 6, 'W2', '', 'Airflow + Spark tuning experience.', 'Laura_Benitez.pdf', 'rejected', now() - interval '3 days'),
  ('00000000-0000-0000-0000-0000000000a8', 'RCT-307', 'Omar Haddad', 'omar.haddad@example.com', '+1 (347) 555-0167', 'OPT/CPT', 'Remote', 3, 'W2', '', 'Next.js + TS portfolio attached.', 'Omar_Haddad_FE.pdf', 'new', now() - interval '30 hours'),
  ('00000000-0000-0000-0000-0000000000a9', null, 'Nina Petrova', 'nina.petrova@example.com', '+1 (415) 555-0124', 'GC', 'San Jose, CA', 10, 'Any', 'https://linkedin.com/in/ninap', 'Talent network - open to Cloud Architect roles.', 'Nina_Petrova.pdf', 'new', now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000a10', 'JAV-418', 'Carlos Rivera', 'carlos.rivera@example.com', '+1 (972) 555-0196', 'USC', 'Plano, TX', 8, 'W2', '', '', 'Carlos_Rivera_Java.pdf', 'new', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000a11', 'DVO-145', 'Aisha Khan', 'aisha.khan@example.com', '+1 (737) 555-0148', 'H1B', 'Round Rock, TX', 6, 'C2C', '', 'EKS + ArgoCD.', 'Aisha_Khan_SRE.pdf', 'new', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000a12', 'SEC-204', 'Greg Thompson', 'greg.thompson@example.com', '+1 (703) 555-0111', 'USC', 'Washington, DC', 4, 'W2', '', 'Security+ and CySA+.', 'Greg_Thompson.pdf', 'shortlisted', now() - interval '1 day')
on conflict (id) do update
  set job_id = excluded.job_id, name = excluded.name, email = excluded.email, phone = excluded.phone,
      work_auth = excluded.work_auth, location = excluded.location, years_experience = excluded.years_experience,
      tax_term = excluded.tax_term, link = excluded.link, note = excluded.note,
      resume_name = excluded.resume_name, status = excluded.status, created_at = excluded.created_at;

commit;
