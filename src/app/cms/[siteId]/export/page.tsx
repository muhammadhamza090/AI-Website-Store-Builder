"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function ExportPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadHTML() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/code`);
      const data = await res.json();
      const html = data.html || data.generatedHtml || "";
      
      if (!html) {
        alert("No HTML available for this site.");
        return;
      }

      // Create blob and download
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `site-${siteId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadJSON() {
    try {
      const res = await fetch(`/api/sites/${siteId}`);
      const data = await res.json();
      const json = JSON.stringify(data.site?.websiteJson ?? {}, null, 2);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `site-data-${siteId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download JSON.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Export</h1>
        <p className="mt-1 text-sm text-zinc-400">Download your site as HTML or JSON</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* HTML Export */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="text-3xl">📄</div>
          <h3 className="text-lg font-semibold text-white">HTML File</h3>
          <p className="text-sm text-zinc-400">
            Download a single-file HTML website. Ready to deploy anywhere — just upload the file.
          </p>
          <button
            onClick={handleDownloadHTML}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
          >
            {downloading ? "Preparing..." : "Download HTML"}
          </button>
        </div>

        {/* JSON Export */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="text-3xl">📋</div>
          <h3 className="text-lg font-semibold text-white">Site Data (JSON)</h3>
          <p className="text-sm text-zinc-400">
            Download the raw site data JSON. Useful for backups or importing into another system.
          </p>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Download JSON
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Preview</h3>
        <p className="text-sm text-zinc-400">Open the generated site preview in a new tab.</p>
        <a
          href={`/preview/${siteId}?view=design`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Open Preview
          <svg className="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}
