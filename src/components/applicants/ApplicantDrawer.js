"use client";

import { Drawer, Pill } from "@/components/ui";
import Icon from "@/components/Icon";
import { useStore } from "@/lib/store";
import { APP_STATUS_META, formatDateTime, initials, timeAgo } from "@/lib/format";

const STATUSES = ["new", "shortlisted", "hired", "rejected"];

function Row({ icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <Icon name={icon} size={16} className="text-faint mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[0.72rem] text-faint">{label}</div>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-[0.88rem] font-medium text-accent-ink hover:underline break-words">{value}</a>
        ) : (
          <div className="text-[0.88rem] font-medium break-words">{value}</div>
        )}
      </div>
    </div>
  );
}

export default function ApplicantDrawer({ open, applicant, onClose }) {
  const { jobById, setApplicationStatus, notify } = useStore();
  if (!applicant) return <Drawer open={open} onClose={onClose} title="" />;

  const job = applicant.jobId ? jobById(applicant.jobId) : null;

  return (
    <Drawer open={open} onClose={onClose} title={applicant.name} subtitle={<span>Applied {timeAgo(applicant.createdAt)}</span>} width={520}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-full grid place-items-center text-sm font-semibold shrink-0"
            style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
            {initials(applicant.name)}
          </span>
          <div className="min-w-0">
            <div className="font-semibold truncate">{applicant.name}</div>
            <div className="text-[0.82rem] text-muted truncate">{applicant.location || "—"}</div>
          </div>
          <div className="ml-auto"><Pill meta={APP_STATUS_META[applicant.status]} /></div>
        </div>

        {/* Applied for */}
        <div className="card p-4" style={{ background: "var(--card-2)" }}>
          <div className="text-[0.72rem] text-faint mb-1.5">Applied for</div>
          {job ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{job.title}</div>
                <div className="text-[0.78rem] text-muted font-[family-name:var(--font-mono)]">{job.id}</div>
              </div>
              <span className={`badge ${job.status === "published" ? "badge-green" : "badge-slate"}`}>{job.status}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="badge badge-violet">Talent network</span>
              <span className="text-[0.82rem] text-muted">General interest — no specific role</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[0.76rem] text-faint mt-2.5 pt-2.5 border-t border-border">
            <Icon name="clock" size={14} /> {formatDateTime(applicant.createdAt)}
          </div>
        </div>

        {/* Résumé */}
        <div>
          <div className="label">Résumé</div>
          <div className="flex items-center gap-3 p-3 rounded-[10px] border border-border">
            <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
              <Icon name="file" size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[0.84rem] font-medium truncate">{applicant.resumeName || "No résumé uploaded"}</div>
              <div className="text-[0.72rem] text-faint">PDF · private</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => notify("Résumé preview is wired to Storage once live")}>
              <Icon name="eye" size={15} /> View
            </button>
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="label">Details</div>
          <div className="card px-4 py-1">
            <Row icon="mail" label="Email" value={applicant.email} href={`mailto:${applicant.email}`} />
            <Row icon="phone" label="Phone" value={applicant.phone} href={`tel:${applicant.phone}`} />
            <Row icon="pin" label="Location" value={applicant.location} />
            <Row icon="briefcaseSmall" label="Experience" value={applicant.yearsExperience != null ? `${applicant.yearsExperience} years` : null} />
            <Row icon="check" label="Work authorization" value={applicant.workAuth} />
            <Row icon="jobs" label="Tax term" value={applicant.taxTerm} />
            <Row icon="external" label="Portfolio / link" value={applicant.link} href={applicant.link} />
          </div>
        </div>

        {applicant.note && (
          <div>
            <div className="label">Candidate note</div>
            <p className="text-[0.86rem] text-muted leading-relaxed p-3 rounded-[10px] bg-card-2 border border-border">{applicant.note}</p>
          </div>
        )}

        {/* Status control */}
        <div>
          <div className="label">Move candidate to</div>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => {
              const on = applicant.status === s;
              return (
                <button
                  key={s}
                  onClick={() => { setApplicationStatus(applicant.id, s); notify(`Marked ${APP_STATUS_META[s].label.toLowerCase()}`); }}
                  className="btn btn-sm justify-start"
                  style={on
                    ? { background: "var(--ink)", color: "#fff" }
                    : { background: "var(--card)", color: "var(--ink)", border: "1px solid var(--border-strong)" }}
                >
                  <span className={`badge ${APP_STATUS_META[s].badge} !bg-transparent !px-0`}><span className="dot" /></span>
                  {APP_STATUS_META[s].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
