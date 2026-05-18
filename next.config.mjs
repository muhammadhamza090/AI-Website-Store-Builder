/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // NEXT_PUBLIC_* vars must be baked in at build time.
  // These are intentionally public (anon key + URL) — safe to commit.
  // They are overridden by env vars if present (Secret Manager / Cloud Run).
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://yqgzbjnpresiebblnxlf.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZ3piam5wcmVzaWViYmxueGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTkzNzksImV4cCI6MjA5NDI3NTM3OX0.LCW2biXwpY7hMJjRSiI1zkv9GQSbOjqka7K5OhGVxQE',
  },
};

export default nextConfig;
