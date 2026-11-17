// Small display helpers shared across the dashboard.

export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  if (day < 30) return `${Math.round(day / 7)}w ago`;
  return formatDate(iso);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function payLabel(pay) {
  if (!pay || pay.min == null) return "—";
  const unit = pay.unit === "yr" ? "/yr" : "/hr";
  const fmt = (n) => (pay.unit === "yr" ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (pay.max && pay.max !== pay.min) return `${fmt(pay.min)}–${fmt(pay.max)}${unit}`;
  return `${fmt(pay.min)}${unit}`;
}

export function experienceLabel(job) {
  if (job.experienceYears === 0) return "New grad";
  return `${job.experienceYears}+ yrs`;
}

export function locationLabel(job) {
  if (job.workplace === "Remote") return "Remote";
  if (job.city && job.region) return `${job.city}, ${job.region} · ${job.workplace}`;
  return job.workplace;
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function slugify(s = "") {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const STATUS_META = {
  published: { label: "Published", badge: "badge-green" },
  draft: { label: "Draft", badge: "badge-amber" },
  closed: { label: "Closed", badge: "badge-slate" },
};

export const APP_STATUS_META = {
  new: { label: "New", badge: "badge-blue" },
  shortlisted: { label: "Shortlisted", badge: "badge-violet" },
  hired: { label: "Hired", badge: "badge-green" },
  rejected: { label: "Rejected", badge: "badge-slate" },
};
