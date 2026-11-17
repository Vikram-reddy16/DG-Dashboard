"use client";

// Live store backed by Supabase. Reads jobs / categories / applications for the
// signed-in staff member (RLS "staff manage ..." policies) and every action is a
// real DB write. The UI keeps its camelCase shape via src/lib/mappers.js, so the
// pages and drawers didn't need to change. Writes update local state immediately
// and re-sync that collection from the DB if the write fails.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { revalidateCareers } from "@/lib/revalidate";
import { applicationFromRow, categoryFromRow, jobFromRow, jobToRow } from "@/lib/mappers";

const StoreContext = createContext(null);

// Fire-and-forget: refresh the public careers site after a jobs/categories change.
const publish = () => { revalidateCareers().catch(() => {}); };

const bySortOrder = (a, b) => a.sortOrder - b.sortOrder;

export function StoreProvider({ children }) {
  const [supabase] = useState(() => createClient());
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null); // signed-in profile
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "default") => {
    const t = { id: Math.random().toString(36).slice(2), message, tone };
    setToast(t);
    setTimeout(() => setToast((cur) => (cur && cur.id === t.id ? null : cur)), 2600);
  }, []);

  // ---- Re-sync helpers (used on write errors) ----
  const reloadJobs = useCallback(async () => {
    const { data } = await supabase.from("jobs").select("*").order("posted_at", { ascending: false });
    setJobs((data || []).map(jobFromRow));
  }, [supabase]);

  const reloadCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    setCategories((data || []).map(categoryFromRow));
  }, [supabase]);

  const reloadApplications = useCallback(async () => {
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    setApplications((data || []).map(applicationFromRow));
  }, [supabase]);

  // ---- Initial load ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (cancelled) return;

      const [profileRes, jobsRes, catsRes, appsRes] = await Promise.all([
        authUser
          ? supabase.from("profiles").select("id, email, full_name, role, active").eq("id", authUser.id).single()
          : Promise.resolve({ data: null }),
        supabase.from("jobs").select("*").order("posted_at", { ascending: false }),
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      const p = profileRes.data;
      if (p) setUser({ id: p.id, email: p.email, fullName: p.full_name, role: p.role, active: p.active });
      setJobs((jobsRes.data || []).map(jobFromRow));
      setCategories((catsRes.data || []).map(categoryFromRow));
      setApplications((appsRes.data || []).map(applicationFromRow));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  // ---- Jobs ----
  const saveJob = useCallback(async (data) => {
    const isEdit = Boolean(data.id && jobs.some((j) => j.id === data.id));
    const id = data.id || `JOB-${Math.floor(100 + Math.random() * 900)}`;
    const slug = `${slugify(data.title)}-${id.toLowerCase()}`;
    const row = jobToRow({ ...data, id, slug }, categories);

    const { data: saved, error } = await supabase.from("jobs").upsert(row).select().single();
    if (error) { notify(`Couldn't save the job: ${error.message}`, "danger"); return { error }; }

    publish();
    const job = jobFromRow(saved);
    setJobs((prev) => (isEdit ? prev.map((j) => (j.id === job.id ? job : j)) : [job, ...prev]));
    return { data: job };
  }, [supabase, jobs, categories, notify]);

  const setJobStatus = useCallback(async (id, status) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j))); // optimistic
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (error) { notify("Couldn't update the job", "danger"); reloadJobs(); return; }
    publish();
  }, [supabase, notify, reloadJobs]);

  const deleteJob = useCallback(async (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id)); // optimistic
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) { notify("Couldn't remove the job", "danger"); reloadJobs(); return; }
    publish();
    // FK is ON DELETE SET NULL: linked applicants become talent-network.
    setApplications((prev) => prev.map((a) => (a.jobId === id ? { ...a, jobId: null } : a)));
  }, [supabase, notify, reloadJobs]);

  // ---- Categories ----
  const addCategory = useCallback(async (name) => {
    const row = { name: name.trim(), slug: slugify(name), sort_order: categories.length, active: true };
    const { data: saved, error } = await supabase.from("categories").insert(row).select().single();
    if (error) { notify("Couldn't add the category", "danger"); return { error }; }
    publish();
    setCategories((prev) => [...prev, categoryFromRow(saved)]);
    return { data: categoryFromRow(saved) };
  }, [supabase, categories, notify]);

  const renameCategory = useCallback(async (id, name) => {
    const trimmed = name.trim();
    const slug = slugify(trimmed);
    const prevName = categories.find((c) => c.id === id)?.name;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed, slug } : c))); // optimistic
    const { error } = await supabase.from("categories").update({ name: trimmed, slug }).eq("id", id);
    if (error) { notify("Couldn't rename the category", "danger"); reloadCategories(); return; }
    publish();
    // DB trigger propagates the new name onto jobs.category; mirror it locally.
    if (prevName) setJobs((prev) => prev.map((j) => (j.category === prevName ? { ...j, category: trimmed } : j)));
  }, [supabase, categories, notify, reloadCategories]);

  const toggleCategory = useCallback(async (id) => {
    const current = categories.find((c) => c.id === id)?.active;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))); // optimistic
    const { error } = await supabase.from("categories").update({ active: !current }).eq("id", id);
    if (error) { notify("Couldn't update the category", "danger"); reloadCategories(); return; }
    publish();
  }, [supabase, categories, notify, reloadCategories]);

  const deleteCategory = useCallback(async (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id)); // optimistic
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { notify("Couldn't delete the category", "danger"); reloadCategories(); return; }
    publish();
  }, [supabase, notify, reloadCategories]);

  const moveCategory = useCallback(async (id, dir) => {
    const list = [...categories].sort(bySortOrder);
    const i = list.findIndex((c) => c.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    // swap their sort_order values
    setCategories((prev) => prev.map((c) =>
      c.id === a.id ? { ...c, sortOrder: b.sortOrder } : c.id === b.id ? { ...c, sortOrder: a.sortOrder } : c,
    )); // optimistic
    const [r1, r2] = await Promise.all([
      supabase.from("categories").update({ sort_order: b.sortOrder }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: a.sortOrder }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) { notify("Couldn't reorder categories", "danger"); reloadCategories(); return; }
    publish();
  }, [supabase, categories, notify, reloadCategories]);

  // ---- Applications ----
  const setApplicationStatus = useCallback(async (id, status) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a))); // optimistic
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) { notify("Couldn't update the applicant", "danger"); reloadApplications(); }
  }, [supabase, notify, reloadApplications]);

  const value = useMemo(
    () => ({
      jobs, categories, applications, user, loading,
      toast, notify,
      saveJob, setJobStatus, deleteJob,
      addCategory, renameCategory, toggleCategory, deleteCategory, moveCategory,
      setApplicationStatus,
      // derived helpers
      jobById: (id) => jobs.find((j) => j.id === id) || null,
      applicantCount: (jobId) => applications.filter((a) => a.jobId === jobId).length,
    }),
    [jobs, categories, applications, user, loading, toast, notify,
     saveJob, setJobStatus, deleteJob,
     addCategory, renameCategory, toggleCategory, deleteCategory, moveCategory, setApplicationStatus],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
