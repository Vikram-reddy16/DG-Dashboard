"use client";

import { useEffect, useState } from "react";
import { Drawer, Field, ChipGroup, TagInput } from "@/components/ui";
import { useStore } from "@/lib/store";
import { ENGAGEMENTS, PAY_UNITS, WORKPLACES, WORK_AUTH } from "@/lib/data";

const empty = {
  title: "", category: "", status: "draft", experienceYears: 0,
  workplace: "Remote", city: "", region: "",
  engagement: [], workAuth: [], skills: [],
  pay: { min: "", max: "", unit: "hr" },
  duration: "", positionsTotal: 1, positionsFilled: 0, summary: "",
};

export default function JobDrawer({ open, job, onClose }) {
  const { categories, saveJob, notify } = useStore();
  const [form, setForm] = useState(empty);
  const isEdit = Boolean(job);
  const activeCats = categories.filter((c) => c.active);

  useEffect(() => {
    if (!open) return;
    setForm(job ? { ...empty, ...job, pay: { ...empty.pay, ...(job.pay || {}) } } : {
      ...empty,
      category: activeCats[0]?.name || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, job]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPay = (k, v) => setForm((f) => ({ ...f, pay: { ...f.pay, [k]: v } }));
  const isRemote = form.workplace === "Remote";

  const submit = (publish) => {
    if (!form.title.trim()) return notify("A job title is required", "danger");
    if (!form.category) return notify("Pick a category", "danger");
    const payload = {
      ...form,
      title: form.title.trim(),
      experienceYears: Number(form.experienceYears) || 0,
      positionsTotal: Math.max(1, Number(form.positionsTotal) || 1),
      positionsFilled: Math.max(0, Number(form.positionsFilled) || 0),
      city: isRemote ? null : form.city || null,
      region: isRemote ? null : form.region || null,
      pay: {
        min: form.pay.min === "" ? null : Number(form.pay.min),
        max: form.pay.max === "" ? null : Number(form.pay.max),
        unit: form.pay.unit,
      },
      status: publish ? "published" : form.status,
    };
    saveJob(payload);
    notify(isEdit ? "Job updated" : publish ? "Job published" : "Draft saved");
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit job" : "New job posting"}
      subtitle={isEdit ? job.id : "Fill in the details — save as draft or publish live"}
      width={560}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {!(isEdit && job.status === "published") && (
            <button className="btn btn-secondary" onClick={() => submit(false)}>Save draft</button>
          )}
          <button className="btn btn-primary" onClick={() => submit(true)}>
            {isEdit && job.status === "published" ? "Save changes" : "Publish"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Job title">
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Java Developer" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select className="select" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="" disabled>Select…</option>
              {activeCats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Experience (years)">
            <input type="number" min="0" className="input" value={form.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Workplace">
            <select className="select" value={form.workplace} onChange={(e) => set("workplace", e.target.value)}>
              {WORKPLACES.map((w) => <option key={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="City">
            <input className="input" disabled={isRemote} value={form.city || ""} onChange={(e) => set("city", e.target.value)} placeholder={isRemote ? "—" : "Dallas"} />
          </Field>
          <Field label="State">
            <input className="input" disabled={isRemote} value={form.region || ""} onChange={(e) => set("region", e.target.value)} placeholder={isRemote ? "—" : "TX"} />
          </Field>
        </div>

        <Field label="Engagement">
          <ChipGroup options={ENGAGEMENTS} value={form.engagement} onChange={(v) => set("engagement", v)} />
        </Field>

        <Field label="Work authorization">
          <ChipGroup options={WORK_AUTH} value={form.workAuth} onChange={(v) => set("workAuth", v)} />
        </Field>

        <div className="grid grid-cols-[1fr_1fr_90px] gap-4">
          <Field label="Pay min">
            <input type="number" className="input" value={form.pay.min} onChange={(e) => setPay("min", e.target.value)} placeholder="60" />
          </Field>
          <Field label="Pay max">
            <input type="number" className="input" value={form.pay.max} onChange={(e) => setPay("max", e.target.value)} placeholder="72" />
          </Field>
          <Field label="Unit">
            <select className="select" value={form.pay.unit} onChange={(e) => setPay("unit", e.target.value)}>
              {PAY_UNITS.map((u) => <option key={u} value={u}>/{u}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Duration">
          <input className="input" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="12-month contract" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Total positions">
            <input type="number" min="1" className="input" value={form.positionsTotal} onChange={(e) => set("positionsTotal", e.target.value)} />
          </Field>
          <Field label="Positions filled">
            <input type="number" min="0" className="input" value={form.positionsFilled} onChange={(e) => set("positionsFilled", e.target.value)} />
          </Field>
        </div>

        <Field label="Skills" hint="Press Enter to add each skill">
          <TagInput value={form.skills} onChange={(v) => set("skills", v)} placeholder="Java, Spring Boot, AWS…" />
        </Field>

        <Field label="Summary">
          <textarea className="textarea" value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Short overview shown on the job card and detail page." />
        </Field>
      </div>
    </Drawer>
  );
}
