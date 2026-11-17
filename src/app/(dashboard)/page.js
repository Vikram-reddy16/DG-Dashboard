"use client";

import Link from "next/link";
import { useMemo } from "react";
import Icon from "@/components/Icon";
import { Pill } from "@/components/ui";
import { useStore } from "@/lib/store";
import { APP_STATUS_META, initials, locationLabel, payLabel, timeAgo } from "@/lib/format";

function Stat({ icon, label, value, sub, accent }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[0.82rem] font-medium text-muted">{label}</span>
        <span
          className="w-8 h-8 rounded-lg grid place-items-center"
          style={{ background: accent ? "var(--accent-soft)" : "var(--card-2)", color: accent ? "var(--accent-ink)" : "var(--muted)", border: "1px solid var(--border)" }}
        >
          <Icon name={icon} size={17} />
        </span>
      </div>
      <div className="mt-3 text-[1.9rem] font-semibold tracking-tight tabular-nums leading-none">{value}</div>
      {sub && <div className="mt-2 text-[0.78rem] text-faint">{sub}</div>}
    </div>
  );
}

export default function OverviewPage() {
  const { jobs, applications, applicantCount, loading } = useStore();

  const stats = useMemo(() => {
    const published = jobs.filter((j) => j.status === "published");
    const weekAgo = Date.now() - 7 * 864e5;
    const newThisWeek = applications.filter((a) => new Date(a.createdAt).getTime() >= weekAgo).length;
    const open = published.reduce((n, j) => n + Math.max(0, j.positionsTotal - j.positionsFilled), 0);
    return { total: jobs.length, live: published.length, applicants: applications.length, newThisWeek, open };
  }, [jobs, applications]);

  const livePostings = useMemo(
    () => jobs.filter((j) => j.status === "published").slice(0, 6),
    [jobs],
  );

  const recent = useMemo(
    () => [...applications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [applications],
  );

  const funnel = useMemo(() => {
    const by = (s) => applications.filter((a) => a.status === s).length;
    return [
      { key: "new", ...APP_STATUS_META.new, n: by("new") },
      { key: "shortlisted", ...APP_STATUS_META.shortlisted, n: by("shortlisted") },
      { key: "hired", ...APP_STATUS_META.hired, n: by("hired") },
      { key: "rejected", ...APP_STATUS_META.rejected, n: by("rejected") },
    ];
  }, [applications]);
  const funnelMax = Math.max(1, ...funnel.map((f) => f.n));

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="card p-5 h-[116px] animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card h-72 animate-pulse" />
          <div className="card h-72 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat icon="jobs" label="Total jobs" value={stats.total} sub={`${stats.open} open positions`} />
        <Stat icon="spark" label="Live postings" value={stats.live} sub="Visible on the website" accent />
        <Stat icon="applicants" label="Applicants" value={stats.applicants} sub="All time" />
        <Stat icon="clock" label="New this week" value={stats.newThisWeek} sub="Last 7 days" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Current postings */}
        <section className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-[0.98rem] font-semibold">Current job postings</h2>
              <p className="text-[0.8rem] text-muted mt-0.5">Live roles on the DG·ALLEN careers site</p>
            </div>
            <Link href="/jobs" className="btn btn-secondary btn-sm">Manage</Link>
          </div>

          {livePostings.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted">No published jobs yet.</div>
          ) : (
            <ul>
              {livePostings.map((job, i) => (
                <li key={job.id} className={`row-hover flex items-center gap-4 px-5 py-3.5 ${i ? "border-t border-border" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href="/jobs" className="font-medium truncate hover:text-accent-ink transition-colors">
                        {job.title}
                      </Link>
                      <span className="mono text-[0.72rem] text-faint font-[family-name:var(--font-mono)]">{job.id}</span>
                    </div>
                    <div className="text-[0.8rem] text-muted truncate mt-0.5">
                      {job.category} · {locationLabel(job)}
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-[0.82rem] font-medium tabular-nums">{payLabel(job.pay)}</div>
                    <div className="text-[0.72rem] text-faint">{job.positionsFilled}/{job.positionsTotal} filled</div>
                  </div>
                  <div className="w-[88px] text-right">
                    <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium">
                      <Icon name="applicants" size={15} className="text-faint" />
                      {applicantCount(job.id)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <section className="card p-5">
            <h2 className="text-[0.98rem] font-semibold">Applicant pipeline</h2>
            <div className="mt-4 flex flex-col gap-3.5">
              {funnel.map((f) => (
                <div key={f.key}>
                  <div className="flex items-center justify-between text-[0.82rem] mb-1.5">
                    <span className="text-muted">{f.label}</span>
                    <span className="font-semibold tabular-nums">{f.n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-card-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.badge}`}
                      style={{ width: `${(f.n / funnelMax) * 100}%`, filter: "saturate(1.4)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-[0.98rem] font-semibold">Recent applicants</h2>
              <Link href="/applicants" className="text-[0.8rem] font-medium text-accent-ink hover:underline">View all</Link>
            </div>
            <ul>
              {recent.map((a, i) => (
                  <li key={a.id} className={`flex items-center gap-3 px-5 py-3 ${i ? "border-t border-border" : ""}`}>
                    <span className="w-8 h-8 rounded-full grid place-items-center text-[0.72rem] font-semibold shrink-0"
                      style={{ background: "var(--card-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                      {initials(a.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.86rem] font-medium truncate">{a.name}</div>
                      <div className="text-[0.74rem] text-faint truncate">{timeAgo(a.createdAt)}</div>
                    </div>
                    <Pill meta={APP_STATUS_META[a.status]} />
                  </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
