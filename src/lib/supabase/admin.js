// Service-role Supabase client. BYPASSES Row Level Security — NEVER import this
// into a client component or expose the key. Only used inside "use server" action
// files for admin tasks (creating auth users, writing profiles).
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
