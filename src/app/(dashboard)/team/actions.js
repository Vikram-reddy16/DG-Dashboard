"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Re-verify the caller is an active admin on every call. Render-time gating in the
// UI is not a security boundary (per Next.js Server Actions guidance).
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You're signed out. Please sign in again." };
  const { data: me } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();
  if (!me || !me.active || me.role !== "admin") return { error: "Admins only." };
  return { userId: user.id };
}

export async function inviteMember(_prev, formData) {
  const gate = await requireAdmin();
  if (gate.error) return { error: gate.error };

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "recruiter");
  const password = String(formData.get("password") || "");

  if (!fullName) return { error: "Enter the person's name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email." };
  if (!["admin", "recruiter"].includes(role)) return { error: "Pick a valid role." };
  if (password.length < 8) return { error: "Temporary password must be at least 8 characters." };

  const admin = createAdminClient();

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (cErr) {
    const msg = /already|registered|exists/i.test(cErr.message)
      ? "That email already has an account."
      : cErr.message;
    return { error: msg };
  }

  const { error: pErr } = await admin.from("profiles").insert({
    id: created.user.id,
    email,
    full_name: fullName,
    role,
    active: true,
  });
  if (pErr) {
    // Avoid an orphaned auth user if the profile insert fails.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Could not create the profile. " + pErr.message };
  }

  return { ok: true };
}

export async function setMemberActive(id, active) {
  const gate = await requireAdmin();
  if (gate.error) return { error: gate.error };
  if (id === gate.userId && !active) return { error: "You can't revoke your own access." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ active, revoked_at: active ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  // Also ban/unban the auth user so any live session dies immediately.
  try {
    await admin.auth.admin.updateUserById(id, { ban_duration: active ? "none" : "876000h" });
  } catch {
    // Non-fatal: RLS already blocks the revoked user on their next request.
  }

  return { ok: true };
}
