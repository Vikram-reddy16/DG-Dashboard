"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { Pill, EmptyState, StatCard, StatRow } from "@/components/ui";
import DataTable from "@/components/DataTable";
import ApplicantDrawer from "@/components/applicants/ApplicantDrawer";
import { useStore } from "@/lib/store";
import { APP_STATUS_META, timeAgo } from "@/lib/format";

export default function ApplicantsPage() {
  const { applications, jobs, jobById, loading } = useStore();
  const [status, setStatus] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  // Pre-filter by ?job=ID when arriving from the Jobs page.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("job");
    if (p) setJobFilter(p);
  }, []);

  const counts = useMemo(() => {
    const c = { all: applications.length, new: 0, shortlisted: 0, hired: 0, rejected: 0 };
    applications.forEach((a) => (c[a.status] += 1));
    return c;
  }, [applications]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return applications
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) => (jobFilter === "all" ? true : jobFilter === "none" ? a.jobId === null : a.jobId === jobFilter))
      .filter((a) => (!term ? true : (a.name + a.email + (a.location || "")).toLowerCase().includes(term)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [applications, status, jobFilter, q]);

  const columns = [
    {
      key: "applicant", header: "Applicant", width: 260,
      cell: (a) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{a.name}</div>
          <div className="text-[0.76rem] text-faint truncate">{a.email}</div>
        </div>
      ),
    },
    {
      key: "appliedFor", header: "Applied for", className: "whitespace-nowrap",
      cell: (a) => {
        const job = a.jobId ? jobById(a.jobId) : null;
        return job ? <span className="text-[0.84rem]">{job.title}</span> : <span className="badge badge-violet">Talent network</span>;
      },
    },
    { key: "location", header: "Location", className: "text-[0.84rem] text-muted whitespace-nowrap hidden lg:table-cell", cell: (a) => a.location || "—" },
    {
      key: "exp", header: "Exp", className: "text-[0.84rem] text-muted whitespace-nowrap hidden xl:table-cell",
      cell: (a) => (a.yearsExperience != null ? `${a.yearsExperience} yrs` : "—"),
    },
    { key: "workAuth", header: "Work auth", className: "hidden md:table-cell", cell: (a) => <span className="badge badge-slate">{a.workAuth}</span> },
    { key: "taxTerm", header: "Tax term", className: "text-[0.84rem] text-muted whitespace-nowrap hidden xl:table-cell", cell: (a) => a.taxTerm || "—" },
    { key: "applied", header: "Applied", className: "text-[0.84rem] text-muted whitespace-nowrap", cell: (a) => timeAgo(a.createdAt) },
    { key: "status", header: "Status", cell: (a) => <Pill meta={APP_STATUS_META[a.status]} /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatRow cols={5}>
        <StatCard icon="applicants" label="Total applicants" value={counts.all} sub="All time" onClick={() => setStatus("all")} active={status === "all"} />
        <StatCard icon="clock" label="New" value={counts.new} sub="Awaiting review" accent onClick={() => setStatus("new")} active={status === "new"} />
        <StatCard icon="check" label="Shortlisted" value={counts.shortlisted} sub="In consideration" onClick={() => setStatus("shortlisted")} active={status === "shortlisted"} />
        <StatCard icon="briefcaseSmall" label="Hired" value={counts.hired} sub="Joined" onClick={() => setStatus("hired")} active={status === "hired"} />
        <StatCard icon="x" label="Rejected" value={counts.rejected} sub="Not moving forward" onClick={() => setStatus("rejected")} active={status === "rejected"} />
      </StatRow>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative w-full lg:w-64">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input pl-9" placeholder="Search applicants…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select w-full lg:w-auto lg:min-w-[170px]" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
          <option value="all">All jobs</option>
          <option value="none">Talent network</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {/* Active job filter chip */}
      {jobFilter !== "all" && (
        <div className="flex items-center gap-2 text-[0.82rem] text-muted">
          <span>Filtered to</span>
          <span className="badge badge-slate">
            {jobFilter === "none" ? "Talent network" : jobById(jobFilter)?.title || jobFilter}
            <button onClick={() => setJobFilter("all")} aria-label="Clear"><Icon name="x" size={12} strokeWidth={2.4} /></button>
          </span>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => a.id}
        onRowClick={(a) => setSelected(a)}
        loading={loading}
        loadingLabel="Loading applicants…"
        minWidth={860}
        height={jobFilter !== "all" ? "calc(100vh - 440px)" : "calc(100vh - 400px)"}
        empty={<EmptyState icon="applicants" title="No applicants here" message="Nobody matches the current filters yet." />}
      />

      <ApplicantDrawer open={Boolean(selected)} applicant={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
