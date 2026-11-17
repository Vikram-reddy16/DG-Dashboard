// Server-side Supabase client (anon key + the request's auth cookies).
// Use inside Server Actions / Route Handlers. Reads and writes the session cookie
// so sign-in / sign-out persist. RLS still applies — this acts AS the signed-in user.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component (read-only cookies). The proxy
            // refreshes the session instead, so this can be safely ignored.
          }
        },
      },
    },
  );
}
