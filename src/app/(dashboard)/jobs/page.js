"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { Menu, Pill, ConfirmDialog, EmptyState, StatCard, StatRow } from "@/components/ui";
import DataTable from "@/components/DataTable";
import JobDrawer from "@/components/jobs/JobDrawer";
import { useStore } from "@/lib/store";
import { STATUS_META, experienceLabel, locationLabel, payLabel, timeAgo } from "@/lib/format";

export default function JobsPage() {
  const { jobs, categories, applicantCount, setJobStatus, deleteJob, notify, loading } = useStore();
  const [filter, setFilter] = useState("all");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState({ open: false, job: null });
  const [confirm, setConfirm] = useState(null);

  const counts = useMemo(() => {
    const c = { all: jobs.length, published: 0, draft: 0, closed: 0 };
    jobs.forEach((j) => (c[j.status] += 1));
    return c;
  }, [jobs]);

  const openPositions = useMemo(
    () => jobs.reduce((n, j) => n + (j.status === "published" ? Math.max(0, j.positionsTotal - j.positionsFilled) : 0), 0),
    [jobs],
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return jobs
      .filter((j) => (filter === "all" ? true : j.status === filter))
      .filter((j) => (cat === "all" ? true : j.category === cat))
      .filter((j) => (!term ? true : (j.title + j.id + j.category).toLowerCase().includes(term)))
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }, [jobs, filter, cat, q]);

  const onDelete = (job) =>
    setConfirm({
      title: "Remove this job?",
      message: `“${job.title}” (${job.id}) will be permanently removed. Applicants already linked to it are kept.`,
      confirmLabel: "Remove job",
      onConfirm: () => { deleteJob(job.id); notify("Job removed", "danger"); },
    });

  const columns = [
    {
      key: "role", header: "Role", width: 260,
      cell: (job) => (
        <>
          <button className="font-medium hover:text-accent-ink transition-colors text-left" onClick={() => setDrawer({ open: true, job })}>
            {job.title}
          </button>
          <div className="text-[0.72rem] text-faint font-[family-name:var(--font-mono)] mt-0.5">{job.id}</div>
        </>
      ),
    },
    { key: "category", header: "Category", className: "text-[0.84rem] text-muted whitespace-nowrap", cell: (job) => job.category },
    { key: "location", header: "Location", className: "text-[0.84rem] text-muted whitespace-nowrap hidden md:table-cell", cell: (job) => locationLabel(job) },
    {
      key: "engagement", header: "Engagement", className: "hidden 2xl:table-cell",
      cell: (job) => (
        <div className="flex flex-wrap gap-1">
          {(job.engagement || []).map((e) => <span key={e} className="badge badge-slate">{e}</span>)}
        </div>
      ),
    },
    { key: "exp", header: "Exp", className: "text-[0.84rem] text-muted whitespace-nowrap hidden xl:table-cell", cell: (job) => experienceLabel(job) },
    { key: "pay", header: "Pay", align: "right", className: "text-[0.84rem] font-medium tabular-nums whitespace-nowrap", cell: (job) => payLabel(job.pay) },
    {
      key: "positions", header: "Filled", align: "center", className: "hidden lg:table-cell",
      cell: (job) => <span className="text-[0.84rem] text-muted tabular-nums">{job.positionsFilled}/{job.positionsTotal}</span>,
    },
    {
      key: "applicants", header: "Applicants", align: "center",
      cell: (job) => (
        <Link href={`/applicants?job=${job.id}`} className="inline-flex items-center gap-1.5 text-[0.84rem] font-medium hover:text-accent-ink transition-colors">
          <Icon name="applicants" size={15} className="text-faint" />
          {applicantCount(job.id)}
        </Link>
      ),
    },
    { key: "posted", header: "Posted", className: "text-[0.82rem] text-faint whitespace-nowrap hidden xl:table-cell", cell: (job) => timeAgo(job.postedAt) },
    { key: "status", header: "Status", cell: (job) => <Pill meta={STATUS_META[job.status]} /> },
    {
      key: "menu", header: "", align: "right", width: 56,
      cell: (job) => (
        <Menu
          items={[
            { label: "Edit", icon: "edit", onClick: () => setDrawer({ open: true, job }) },
            { label: "View applicants", icon: "eye", onClick: () => (window.location.href = `/applicants?job=${job.id}`) },
            { divider: true },
            job.status === "published"
              ? { label: "Unpublish (pause)", icon: "pause", onClick: () => { setJobStatus(job.id, "draft"); notify("Job unpublished"); } }
              : { label: "Publish", icon: "play", onClick: () => { setJobStatus(job.id, "published"); notify("Job published"); } },
            job.status !== "closed"
              ? { label: "Mark as closed", icon: "check", onClick: () => { setJobStatus(job.id, "closed"); notify("Job closed"); } }
              : { label: "Reopen as draft", icon: "play", onClick: () => { setJobStatus(job.id, "draft"); notify("Job reopened"); } },
            { divider: true },
            { label: "Remove", icon: "trash", danger: true, onClick: () => onDelete(job) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatRow>
        <StatCard icon="jobs" label="Total jobs" value={counts.all} sub={`${openPositions} open positions`} onClick={() => setFilter("all")} active={filter === "all"} />
        <StatCard icon="spark" label="Published" value={counts.published} sub="Live on the website" accent onClick={() => setFilter("published")} active={filter === "published"} />
        <StatCard icon="edit" label="Drafts" value={counts.draft} sub="Not yet visible" onClick={() => setFilter("draft")} active={filter === "draft"} />
        <StatCard icon="check" label="Closed" value={counts.closed} sub="No longer hiring" onClick={() => setFilter("closed")} active={filter === "closed"} />
      </StatRow>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative w-full lg:w-64">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input pl-9" placeholder="Search jobs…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select w-full lg:w-auto lg:min-w-[160px]" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <button className="btn btn-primary shrink-0 lg:ml-auto" onClick={() => setDrawer({ open: true, job: null })}>
          <Icon name="plus" size={17} /> <span className="hidden sm:inline">New job</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(job) => job.id}
        loading={loading}
        loadingLabel="Loading jobs…"
        minWidth={920}
        empty={
          <EmptyState
            icon="jobs"
            title="No jobs match"
            message="Try a different filter, or create a new posting."
            action={<button className="btn btn-primary btn-sm" onClick={() => setDrawer({ open: true, job: null })}><Icon name="plus" size={16} />New job</button>}
          />
        }
      />

      <JobDrawer open={drawer.open} job={drawer.job} onClose={() => setDrawer({ open: false, job: null })} />
      <ConfirmDialog open={Boolean(confirm)} {...(confirm || {})} onClose={() => setConfirm(null)} />
    </div>
  );
}
