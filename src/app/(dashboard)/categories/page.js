"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { Toggle, ConfirmDialog, EmptyState, StatCard, StatRow } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function CategoriesPage() {
  const { categories, jobs, addCategory, renameCategory, toggleCategory, deleteCategory, moveCategory, notify, loading } = useStore();
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(null); // { id, value }
  const [confirm, setConfirm] = useState(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const all = useMemo(() => [...categories].sort((a, b) => a.sortOrder - b.sortOrder), [categories]);
  const counts = useMemo(() => ({ all: all.length, active: all.filter((c) => c.active).length, hidden: all.filter((c) => !c.active).length }), [all]);
  const sorted = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((c) => (filter === "all" ? true : filter === "active" ? c.active : !c.active))
      .filter((c) => (!term ? true : (c.name + c.slug).toLowerCase().includes(term)));
  }, [all, q, filter]);
  const jobCount = (name) => jobs.filter((j) => j.category === name).length;

  const submitAdd = () => {
    const v = draft.trim();
    if (!v) return;
    if (categories.some((c) => c.name.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return notify("That category already exists", "danger");
    }
    addCategory(v);
    setDraft("");
    notify("Category added");
  };

  const saveRename = () => {
    if (editing?.value.trim()) { renameCategory(editing.id, editing.value); notify("Category renamed"); }
    setEditing(null);
  };

  const onDelete = (c) => {
    const n = jobCount(c.name);
    setConfirm({
      title: "Delete category?",
      message: n > 0
        ? `“${c.name}” is used by ${n} job${n > 1 ? "s" : ""}. Those jobs keep their label but lose the category link.`
        : `“${c.name}” will be removed.`,
      confirmLabel: "Delete",
      onConfirm: () => { deleteCategory(c.id); notify("Category deleted", "danger"); },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <StatRow>
        <StatCard icon="categories" label="Categories" value={categories.length} sub="Total" />
        <StatCard icon="check" label="Active" value={categories.filter((c) => c.active).length} sub="Shown on the website" accent />
        <StatCard icon="eye" label="Hidden" value={categories.filter((c) => !c.active).length} sub="Disabled" />
        <StatCard icon="jobs" label="Jobs categorised" value={jobs.filter((j) => categories.some((c) => c.name === j.category)).length} sub={`of ${jobs.length} jobs`} />
      </StatRow>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative w-full lg:w-64">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input pl-9" placeholder="Search categories…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-[10px] bg-card border border-border w-full lg:w-auto overflow-x-auto">
          {[["all", "All"], ["active", "Active"], ["hidden", "Hidden"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="px-3 h-8 rounded-lg text-[0.82rem] font-medium whitespace-nowrap transition-colors"
              style={filter === k ? { background: "var(--ink)", color: "#fff" } : { color: "var(--muted)" }}
            >
              {label}
              <span className="ml-1.5 tabular-nums opacity-70">{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 lg:ml-auto w-full lg:w-auto">
          <input
            className="input lg:w-60"
            placeholder="New category, e.g. Product & Design"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
          />
          <button className="btn btn-primary shrink-0" onClick={submitAdd}><Icon name="plus" size={17} />Add</button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="card p-10 text-center text-[0.84rem] text-faint">Loading categories…</div>
      ) : sorted.length === 0 ? (
        <div className="card"><EmptyState icon="categories" title="No categories" message="Nothing matches — add a category with the field above." /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {sorted.map((c, i) => {
            const n = jobCount(c.name);
            const isEditing = editing?.id === c.id;
            return (
              <div key={c.id} className={`card p-4 flex flex-col gap-3 transition-shadow hover:shadow-[var(--shadow-md)] ${!c.active ? "opacity-70" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        autoFocus
                        className="input h-9"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setEditing(null); }}
                        onBlur={saveRename}
                      />
                    ) : (
                      <>
                        <div className="font-semibold truncate">{c.name}</div>
                        <div className="text-[0.74rem] text-faint font-[family-name:var(--font-mono)] truncate mt-0.5">{c.slug}</div>
                      </>
                    )}
                  </div>
                  <Toggle checked={c.active} onChange={() => toggleCategory(c.id)} label="Toggle active" />
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${c.active ? "badge-green" : "badge-slate"}`}>{c.active ? "Active" : "Hidden"}</span>
                  <span className="badge badge-slate">{n} job{n === 1 ? "" : "s"}</span>
                </div>

                <div className="flex items-center gap-1 pt-3 mt-auto border-t border-border -mx-1">
                  <button className="btn btn-ghost btn-icon disabled:opacity-30" onClick={() => moveCategory(c.id, "up")} disabled={i === 0} aria-label="Move earlier">
                    <Icon name="arrowUp" size={16} />
                  </button>
                  <button className="btn btn-ghost btn-icon disabled:opacity-30" onClick={() => moveCategory(c.id, "down")} disabled={i === sorted.length - 1} aria-label="Move later">
                    <Icon name="arrowDown" size={16} />
                  </button>
                  <span className="flex-1" />
                  <button className="btn btn-ghost btn-icon" onClick={() => setEditing({ id: c.id, value: c.name })} aria-label="Rename">
                    <Icon name="edit" size={16} />
                  </button>
                  <button className="btn btn-ghost btn-icon" style={{ color: "var(--accent-ink)" }} onClick={() => onDelete(c)} aria-label="Delete">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog open={Boolean(confirm)} {...(confirm || {})} onClose={() => setConfirm(null)} />
    </div>
  );
}
