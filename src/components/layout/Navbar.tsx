"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createSupabaseBrowser();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/orgs" className="font-semibold tracking-tight">
          AI Ecommerce Builder
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/orgs">Organizations</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {loggingOut ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
