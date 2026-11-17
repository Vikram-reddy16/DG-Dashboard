// Translate between the database (snake_case columns) and the UI shape the
// dashboard components use (camelCase, with a nested `pay` object). Keeping this
// in one place means the pages/drawers never touch raw DB rows.

// ---------- Jobs ----------
export function jobFromRow(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    categoryId: r.category_id ?? null,
    experienceYears: r.experience_years ?? 0,
    city: r.city ?? null,
    region: r.region ?? null,
    workplace: r.workplace,
    engagement: r.engagement ?? [],
    workAuth: r.work_auth ?? [],
    skills: r.skills ?? [],
    pay: { min: r.pay_min ?? null, max: r.pay_max ?? null, unit: r.pay_unit ?? "hr" },
    duration: r.duration ?? "",
    summary: r.summary ?? "",
    status: r.status,
    positionsTotal: r.positions_total ?? 1,
    positionsFilled: r.positions_filled ?? 0,
    postedAt: r.posted_at,
    // present only when read through jobs_with_counts
    applicantCount: r.applicant_count,
    newApplicantCount: r.new_applicant_count,
  };
}

// UI payload -> DB row. `categories` resolves category_id from the chosen name.
export function jobToRow(data, categories = []) {
  const cat = categories.find((c) => c.name === data.category);
  const row = {
    slug: data.slug,
    title: data.title,
    category: data.category,
    category_id: cat ? cat.id : null,
    experience_years: Number(data.experienceYears) || 0,
    city: data.city ?? null,
    region: data.region ?? null,
    workplace: data.workplace,
    engagement: data.engagement ?? [],
    work_auth: data.workAuth ?? [],
    skills: data.skills ?? [],
    pay_min: data.pay?.min ?? null,
    pay_max: data.pay?.max ?? null,
    pay_unit: data.pay?.unit ?? "hr",
    duration: data.duration ?? "",
    summary: data.summary ?? "",
    status: data.status,
    positions_total: Math.max(1, Number(data.positionsTotal) || 1),
    positions_filled: Math.max(0, Number(data.positionsFilled) || 0),
  };
  if (data.id) row.id = data.id;
  if (data.postedAt) row.posted_at = data.postedAt;
  return row;
}

// ---------- Categories ----------
export function categoryFromRow(r) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    sortOrder: r.sort_order ?? 0,
    active: r.active,
  };
}

// ---------- Applications ----------
export function applicationFromRow(r) {
  return {
    id: r.id,
    jobId: r.job_id ?? null,
    name: r.name,
    email: r.email,
    phone: r.phone,
    workAuth: r.work_auth,
    location: r.location ?? null,
    yearsExperience: r.years_experience ?? null,
    taxTerm: r.tax_term ?? null,
    link: r.link ?? "",
    note: r.note ?? "",
    resumeName: r.resume_name ?? null,
    resumePath: r.resume_path ?? null,
    status: r.status,
    internalNotes: r.internal_notes ?? null,
    createdAt: r.created_at,
  };
}
