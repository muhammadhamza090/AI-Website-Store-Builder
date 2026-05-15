import Link from "next/link";
import { cn } from "@/lib/utils";

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("hidden w-60 shrink-0 border-r border-zinc-200 bg-white md:block", className)}>
      <div className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Workspace</div>
        <nav className="mt-3 space-y-1">
          <Link className="block rounded-md px-3 py-2 text-sm hover:bg-zinc-100" href="/generate">
            Generate
          </Link>
          <Link className="block rounded-md px-3 py-2 text-sm hover:bg-zinc-100" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </div>
    </aside>
  );
}

