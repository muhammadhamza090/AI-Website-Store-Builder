"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface SiteData {
  pages: { id: string; slug: string; title: string; type: string; sectionCount: number }[];
  products: { id: string; name: string; price: number; category: string }[];
  theme: {
    businessName: string;
    industry: string;
    layoutStyle: string;
    colorPalette: Record<string, string>;
  };
}

export default function CmsDashboard() {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pagesRes, productsRes, themeRes, siteRes] = await Promise.all([
          fetch(`/api/sites/${siteId}/pages`),
          fetch(`/api/sites/${siteId}/products`),
          fetch(`/api/sites/${siteId}/theme`),
          fetch(`/api/sites/${siteId}`),
        ]);

        const pages = await pagesRes.json();
        const products = await productsRes.json();
        const theme = await themeRes.json();
        const site = await siteRes.json();

        setPublished(site.site?.published ?? false);
        setData({
          pages: pages.pages ?? [],
          products: products.products ?? [],
          theme: theme.theme ?? {},
        });
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [siteId]);

  async function togglePublish() {
    setPublishing(true);
    try {
      await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      setPublished(!published);
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const colors = data?.theme?.colorPalette ?? {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{data?.theme?.businessName || "Site Dashboard"}</h1>
          <p className="mt-1 text-sm text-zinc-400">{data?.theme?.industry || "eCommerce"} • {data?.theme?.layoutStyle || "Standard"}</p>
        </div>
        <button
          onClick={togglePublish}
          disabled={publishing}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            published
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
          } disabled:opacity-50`}
        >
          <span className={`h-2 w-2 rounded-full ${published ? "bg-emerald-400" : "bg-amber-400"}`} />
          {publishing ? "Updating..." : published ? "Published" : "Draft — Click to Publish"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => router.push(`/cms/${siteId}/pages`)}
          className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-indigo-500/30 hover:bg-white/[0.07]"
        >
          <div className="text-2xl mb-2">📄</div>
          <div className="text-3xl font-bold text-white">{data?.pages?.length ?? 0}</div>
          <div className="mt-1 text-sm text-zinc-400 group-hover:text-indigo-400 transition">Pages →</div>
        </button>

        <button
          onClick={() => router.push(`/cms/${siteId}/products`)}
          className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-purple-500/30 hover:bg-white/[0.07]"
        >
          <div className="text-2xl mb-2">🛍️</div>
          <div className="text-3xl font-bold text-white">{data?.products?.length ?? 0}</div>
          <div className="mt-1 text-sm text-zinc-400 group-hover:text-purple-400 transition">Products →</div>
        </button>

        <button
          onClick={() => router.push(`/cms/${siteId}/theme`)}
          className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-pink-500/30 hover:bg-white/[0.07]"
        >
          <div className="text-2xl mb-2">🎨</div>
          <div className="flex gap-1.5 mt-1">
            {Object.entries(colors).slice(0, 4).map(([key, color]) => (
              <div
                key={key}
                className="h-6 w-6 rounded-full border border-white/20"
                style={{ backgroundColor: String(color) }}
                title={key}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-zinc-400 group-hover:text-pink-400 transition">Theme →</div>
        </button>

        <button
          onClick={() => router.push(`/cms/${siteId}/export`)}
          className="group rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-emerald-500/30 hover:bg-white/[0.07]"
        >
          <div className="text-2xl mb-2">📦</div>
          <div className="text-lg font-semibold text-white mt-1">HTML Export</div>
          <div className="mt-1 text-sm text-zinc-400 group-hover:text-emerald-400 transition">Download →</div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Pages */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Pages</h3>
          <div className="space-y-2">
            {data?.pages?.slice(0, 5).map((page) => (
              <button
                key={page.id}
                onClick={() => router.push(`/cms/${siteId}/pages/${page.slug}`)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">📄</span>
                  {page.title}
                </div>
                <span className="text-xs text-zinc-500">{page.sectionCount} sections</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Categories */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Products by Category</h3>
          <div className="space-y-2">
            {Object.entries(
              (data?.products ?? []).reduce<Record<string, number>>((acc, p) => {
                acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300"
              >
                <span>{cat}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
