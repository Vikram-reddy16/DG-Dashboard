"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Sign in, then confirm the user has an ACTIVE staff profile. A valid Supabase
// login is not enough — the profiles table is the dashboard access gate.
export async function login(_prev, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    return { error: "Invalid email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active")
    .eq("id", data.user.id)
    .single();

  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have dashboard access. Contact an admin." };
  }

  // Only redirect within the app (avoid open-redirect via ?next=).
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
