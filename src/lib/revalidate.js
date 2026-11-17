"use server";

// Tells the public careers site to refresh its cached job/category pages. Called after
// the dashboard changes jobs or categories. Only signed-in, active staff can trigger it.
import { createClient } from "@/lib/supabase/server";

export async function revalidateCareers() {
  const base = process.env.CAREERS_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return { ok: false, skipped: true };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { data: me } = await supabase.from("profiles").select("active").eq("id", user.id).single();
  if (!me?.active) return { ok: false };

  try {
    const res = await fetch(new URL("/api/revalidate", base), {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
