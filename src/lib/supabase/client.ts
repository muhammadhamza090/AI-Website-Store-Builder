import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client — for use in Client Components ("use client").
 * Uses the public anon key (safe to expose in browser).
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
