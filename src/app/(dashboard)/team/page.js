"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { Toggle, Drawer, EmptyState, StatCard, StatRow } from "@/components/ui";
import DataTable from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { inviteMember, setMemberActive } from "./actions";

export default function TeamPage() {
  const { user, notify } = useStore();
  const isAdmin = user?.role === "admin";

  const [members, setMembers] = useState(null); // null = loading
  const [inviteOpen, setInviteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, active, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      notify("Couldn't load the team", "danger");
      setMembers([]);
      return;
    }
    setMembers(data || []);
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const onInvite = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const res = await inviteMember(null, fd);
    setBusy(false);
    if (res?.error) return notify(res.error, "danger");
    notify("Teammate added");
    setInviteOpen(false);
    load();
  };

  const onToggle = async (m) => {
    setTogglingId(m.id);
    const res = await setMemberActive(m.id, !m.active);
    setTogglingId(null);
    if (res?.error) return notify(res.error, "danger");
    notify(m.active ? "Access revoked" : "Access restored", m.active ? "danger" : "default");
    load();
  };

  const columns = [
    {
      key: "name", header: "Name", width: 220,
      cell: (m) => (
        <span className="font-medium whitespace-nowrap">
          {m.full_name || "—"}
          {m.id === user?.id && <span className="text-faint font-normal"> · you</span>}
        </span>
      ),
    },
    { key: "email", header: "Email", className: "text-[0.84rem] text-muted whitespace-nowrap", cell: (m) => m.email },
    { key: "role", header: "Role", cell: (m) => <span className={`badge ${m.role === "admin" ? "badge-red" : "badge-slate"} capitalize`}>{m.role}</span> },
    { key: "added", header: "Added", className: "text-[0.84rem] text-muted whitespace-nowrap hidden sm:table-cell", cell: (m) => (m.created_at ? formatDate(m.created_at) : "—") },
    {
      key: "status", header: "Status",
      cell: (m) => <span className={`badge ${m.active ? "badge-green" : "badge-slate"}`}>{m.active ? "Active" : "Revoked"}</span>,
    },
    {
      key: "access", header: "Access", align: "right", width: 90,
      cell: (m) => (
        <div className="flex justify-end">
          <Toggle
            checked={m.active}
            onChange={() => isAdmin && togglingId !== m.id && onToggle(m)}
            label="Toggle access"
          />
        </div>
      ),
    },
  ];

  const list = members || [];
  const stats = {
    total: list.length,
    active: list.filter((m) => m.active).length,
    admins: list.filter((m) => m.role === "admin").length,
    revoked: list.filter((m) => !m.active).length,
  };

  return (
    <div className="flex flex-col gap-5">
      <StatRow>
        <StatCard icon="team" label="Team members" value={stats.total} sub="With dashboard access" />
        <StatCard icon="check" label="Active" value={stats.active} sub="Can sign in" accent />
        <StatCard icon="settings" label="Admins" value={stats.admins} sub="Manage the team" />
        <StatCard icon="x" label="Revoked" value={stats.revoked} sub="Access turned off" />
      </StatRow>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.86rem] text-muted">
          Staff who can sign in to this dashboard. Turning someone off revokes access on their next request.
        </p>
        <button className="btn btn-primary shrink-0" disabled={!isAdmin} onClick={() => setInviteOpen(true)}>
          <Icon name="plus" size={17} /> <span className="hidden sm:inline">Invite</span>
        </button>
      </div>

      {!isAdmin && user && (
        <div className="card p-3.5 text-[0.82rem] flex items-center gap-2" style={{ background: "var(--amber-soft)", borderColor: "#eadbb8", color: "var(--amber)" }}>
          <Icon name="settings" size={16} /> Only admins can invite teammates or change access.
        </div>
      )}

      <DataTable
        columns={columns}
        rows={members || []}
        rowKey={(m) => m.id}
        rowClassName={(m) => (!m.active ? "opacity-70" : "")}
        loading={members === null}
        loadingLabel="Loading team…"
        minWidth={760}
        height="calc(100vh - 460px)"
        empty={<EmptyState icon="team" title="No teammates yet" message="Invite someone to give them dashboard access." />}
      />

      <Drawer
        open={inviteOpen}
        onClose={() => !busy && setInviteOpen(false)}
        title="Invite a teammate"
        subtitle="Creates their sign-in and grants dashboard access."
        width={460}
      >
        <form onSubmit={onInvite} className="flex flex-col gap-4">
          <label className="block">
            <span className="label">Full name</span>
            <input className="input" name="fullName" placeholder="Jordan Lee" required />
          </label>
          <label className="block">
            <span className="label">Work email</span>
            <input className="input" type="email" name="email" placeholder="jordan@dgallen.com" required />
          </label>
          <label className="block">
            <span className="label">Role</span>
            <select className="select" name="role" defaultValue="recruiter">
              <option value="recruiter">Recruiter — manage jobs & applicants</option>
              <option value="admin">Admin — also manages the team</option>
            </select>
          </label>
          <label className="block">
            <span className="label">Temporary password</span>
            <input className="input" type="text" name="password" placeholder="At least 8 characters" minLength={8} required />
            <span className="hint mt-1 block">Share this with them securely. They sign in with it and can change it later.</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn btn-secondary" onClick={() => setInviteOpen(false)} disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Creating…" : (<><Icon name="plus" size={16} />Create teammate</>)}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
