"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HtmlPreviewIframe } from "@/components/preview/HtmlPreviewIframe";

type CachedSite = {
  website: unknown;
  generatedHtml: string | null;
  savedToDb: boolean;
  createdAt: number;
};

export function LocalSitePreview({ siteId }: { siteId: string }) {
  const [cached, setCached] = React.useState<CachedSite | null>(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`generatedWebsite:${siteId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as CachedSite;
        setCached(parsed);
      }
    } catch {
      // ignore
    }
    setChecked(true);
  }, [siteId]);

  if (!checked) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Loading preview…
      </div>
    );
  }

  if (!cached) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
        <div className="text-2xl">😕</div>
        <div className="text-base font-semibold text-rose-800">Preview not found</div>
        <p className="max-w-sm text-sm text-rose-700">
          This site was generated but could not be saved to the database, and the session data has expired.
          Generate a new site to get a fresh preview.
        </p>
        <Button asChild>
          <Link href="/generate">Generate new site</Link>
        </Button>
      </div>
    );
  }

  if (cached.generatedHtml) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="rounded-md border border-zinc-200 bg-white px-3 py-0.5 text-xs text-zinc-500">
            AI-generated • session preview (not saved)
          </div>
          <div className="text-xs text-zinc-400">Live Preview</div>
        </div>
        <HtmlPreviewIframe html={cached.generatedHtml} className="h-[80vh]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center">
      <div className="text-base font-semibold text-amber-800">Site generated but not saved to database</div>
      <p className="max-w-sm text-sm text-amber-700">
        The website was generated successfully but could not be saved. The preview data is available in your session.
      </p>
      <Button asChild>
        <Link href="/generate">Generate new site</Link>
      </Button>
    </div>
  );
}
