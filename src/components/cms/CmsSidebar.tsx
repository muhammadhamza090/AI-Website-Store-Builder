"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";

interface CmsSidebarProps {
  siteId: string;
  siteName: string;
  published: boolean;
}

const navItems = [
  { label: "Dashboard", icon: "📊", href: "" },
  { label: "Pages", icon: "📄", href: "/pages" },
  { label: "Products", icon: "🛍️", href: "/products" },
  { label: "Theme", icon: "🎨", href: "/theme" },
  { label: "Export", icon: "📦", href: "/export" },
];

export function CmsSidebar({ siteId, siteName, published }: CmsSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const basePath = `/cms/${siteId}`;

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-zinc-950">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
            {siteName?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-white">{siteName}</h2>
            <span className={`inline-flex items-center gap-1 text-xs ${published ? "text-emerald-400" : "text-amber-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-emerald-400" : "bg-amber-400"}`} />
              {published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Manage
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const fullHref = basePath + item.href;
            const isActive = item.href === ""
              ? pathname === basePath
              : pathname.startsWith(fullHref);

            return (
              <li key={item.href}>
                <Link
                  href={fullHref}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          View
        </div>
        <ul className="space-y-1">
          <li>
            <Link
              href={`/preview/${siteId}?view=design`}
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="text-base">👁️</span>
              Preview Site
              <svg className="ml-auto h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <Link
          href="/orgs"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <span className="text-base">←</span>
          Back to Orgs
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all disabled:opacity-50"
        >
          <span className="text-base">🚪</span>
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
