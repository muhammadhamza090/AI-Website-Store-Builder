"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ThemeData {
  businessName: string;
  industry: string;
  layoutStyle: string;
  colorPalette: Record<string, string>;
  typography: { headingFont?: string; bodyFont?: string; style?: string };
  generationStyle: string;
}

const layoutStyles = [
  { id: "luxury editorial", label: "Luxury Editorial", emoji: "💎" },
  { id: "modern minimalist", label: "Modern Minimalist", emoji: "⬜" },
  { id: "editorial showcase", label: "Editorial Showcase", emoji: "📰" },
  { id: "bold & vibrant", label: "Bold & Vibrant", emoji: "🎨" },
  { id: "clean professional", label: "Clean Professional", emoji: "💼" },
  { id: "organic natural", label: "Organic Natural", emoji: "🌿" },
];

export default function ThemeEditor() {
  const { siteId } = useParams<{ siteId: string }>();
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/sites/${siteId}/theme`)
      .then(r => r.json())
      .then(data => setTheme(data.theme))
      .finally(() => setLoading(false));
  }, [siteId]);

  async function handleSave() {
    if (!theme) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/sites/${siteId}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colorPalette: theme.colorPalette,
          typography: theme.typography,
          layoutStyle: theme.layoutStyle,
          businessName: theme.businessName,
          industry: theme.industry,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function updateColor(key: string, value: string) {
    if (!theme) return;
    setTheme({
      ...theme,
      colorPalette: { ...theme.colorPalette, [key]: value },
    });
  }

  if (loading || !theme) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-64 animate-pulse rounded-xl bg-white/5 border border-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Theme</h1>
          <p className="mt-1 text-sm text-zinc-400">Customize colors, fonts, and layout</p>
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

      {/* Brand Info */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Brand</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Business Name</label>
            <input
              value={theme.businessName}
              onChange={(e) => setTheme({ ...theme, businessName: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Industry</label>
            <input
              value={theme.industry}
              onChange={(e) => setTheme({ ...theme, industry: e.target.value })}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Color Palette</h3>
        
        {/* Preview Bar */}
        <div className="flex h-14 overflow-hidden rounded-lg border border-white/10">
          {Object.entries(theme.colorPalette).map(([key, color]) => (
            <div
              key={key}
              className="flex-1 flex items-end justify-center pb-1"
              style={{ backgroundColor: String(color) }}
            >
              <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-black/30 text-white/80 capitalize">{key}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(theme.colorPalette).map(([key, color]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium capitalize text-zinc-400">{key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={String(color)}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
                <input
                  value={String(color)}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-mono text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Typography</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Heading Font</label>
            <input
              value={theme.typography?.headingFont ?? ""}
              onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, headingFont: e.target.value } })}
              placeholder="Playfair Display"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Body Font</label>
            <input
              value={theme.typography?.bodyFont ?? ""}
              onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, bodyFont: e.target.value } })}
              placeholder="Inter"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Style</label>
            <input
              value={theme.typography?.style ?? ""}
              onChange={(e) => setTheme({ ...theme, typography: { ...theme.typography, style: e.target.value } })}
              placeholder="high-contrast serif"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Layout Style */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Layout Style</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {layoutStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setTheme({ ...theme, layoutStyle: style.id })}
              className={`rounded-xl border p-4 text-left transition ${
                theme.layoutStyle === style.id
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <span className="text-2xl">{style.emoji}</span>
              <div className="mt-2 text-sm font-medium text-white">{style.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
