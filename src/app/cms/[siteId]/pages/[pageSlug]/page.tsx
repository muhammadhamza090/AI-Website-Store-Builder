"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Section {
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  ctaLabel?: string;
  ctaHref?: string;
  [key: string]: unknown;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  type: string;
  sections: Section[];
}

const sectionTypeLabels: Record<string, string> = {
  hero: "🚀 Hero Banner",
  featured_products: "⭐ Featured Products",
  product_grid: "🛒 Product Grid",
  categories: "📂 Categories",
  testimonials: "💬 Testimonials",
  newsletter: "📧 Newsletter",
  brand_story: "📖 Brand Story",
  promo_banner: "🎯 Promo Banner",
  faq: "❓ FAQ",
  contact_form: "📞 Contact Form",
  about_hero: "ℹ️ About Hero",
  cart_detail: "🛍️ Cart Detail",
  checkout: "💳 Checkout",
};

export default function SectionEditor() {
  const { siteId, pageSlug } = useParams<{ siteId: string; pageSlug: string }>();
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/sites/${siteId}/pages/${pageSlug}`)
      .then(r => r.json())
      .then(data => setPage(data.page))
      .finally(() => setLoading(false));
  }, [siteId, pageSlug]);

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/sites/${siteId}/pages/${pageSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: page.sections, title: page.title }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function updateSection(idx: number, field: string, value: string) {
    if (!page) return;
    const updated = [...page.sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setPage({ ...page, sections: updated });
  }

  function removeSection(idx: number) {
    if (!page || !confirm("Remove this section?")) return;
    const updated = page.sections.filter((_, i) => i !== idx);
    setPage({ ...page, sections: updated });
  }

  function moveSection(idx: number, direction: -1 | 1) {
    if (!page) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= page.sections.length) return;
    const updated = [...page.sections];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setPage({ ...page, sections: updated });
    setExpandedIdx(newIdx);
  }

  if (loading || !page) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5 border border-white/10" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/cms/${siteId}/pages`)} className="text-zinc-400 hover:text-white transition">
            ← 
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{page.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">/{page.slug} • {page.sections.length} sections</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition ${
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500"
          } disabled:opacity-50`}
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Section List */}
      <div className="space-y-2">
        {page.sections.map((section, idx) => {
          const isExpanded = expandedIdx === idx;
          const label = sectionTypeLabels[section.type] || `📋 ${section.type}`;
          
          return (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition">
              {/* Section Header */}
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-mono w-6">{idx + 1}</span>
                  <span className="text-sm font-medium text-white">{label}</span>
                  {section.title && (
                    <span className="text-xs text-zinc-400">— {section.title}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(idx, -1); }}
                    disabled={idx === 0}
                    className="rounded p-1 text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(idx, 1); }}
                    disabled={idx === page.sections.length - 1}
                    className="rounded p-1 text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition"
                  >
                    ↓
                  </button>
                  <span className="text-zinc-500 text-sm">{isExpanded ? "▼" : "▶"}</span>
                </div>
              </button>

              {/* Section Editor */}
              {isExpanded && (
                <div className="border-t border-white/10 px-5 py-5 space-y-4 bg-white/[0.02]">
                  {section.title !== undefined && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
                      <input
                        value={section.title ?? ""}
                        onChange={(e) => updateSection(idx, "title", e.target.value)}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                  {section.subtitle !== undefined && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Subtitle</label>
                      <input
                        value={section.subtitle ?? ""}
                        onChange={(e) => updateSection(idx, "subtitle", e.target.value)}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                  {section.content !== undefined && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Content</label>
                      <textarea
                        value={section.content ?? ""}
                        onChange={(e) => updateSection(idx, "content", e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 resize-y"
                      />
                    </div>
                  )}
                  {section.ctaLabel !== undefined && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-400">CTA Label</label>
                        <input
                          value={section.ctaLabel ?? ""}
                          onChange={(e) => updateSection(idx, "ctaLabel", e.target.value)}
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-400">CTA Link</label>
                        <input
                          value={section.ctaHref ?? ""}
                          onChange={(e) => updateSection(idx, "ctaHref", e.target.value)}
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeSection(idx)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                    >
                      Remove Section
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
