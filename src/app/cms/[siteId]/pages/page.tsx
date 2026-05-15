"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Page {
  id: string;
  slug: string;
  title: string;
  type: string;
  sectionCount: number;
}

const pageTypeIcons: Record<string, string> = {
  home: "🏠",
  shop: "🛒",
  product_detail: "📦",
  cart: "🛍️",
  checkout: "💳",
  about: "ℹ️",
  contact: "📞",
  custom: "📝",
};

export default function PagesManager() {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newType, setNewType] = useState("custom");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, [siteId]);

  async function loadPages() {
    try {
      const res = await fetch(`/api/sites/${siteId}/pages`);
      const data = await res.json();
      setPages(data.pages ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newSlug.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, slug: newSlug, type: newType }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewSlug("");
        setNewType("custom");
        setShowAdd(false);
        loadPages();
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      await fetch(`/api/sites/${siteId}/pages/${slug}`, { method: "DELETE" });
      loadPages();
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5 border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pages</h1>
          <p className="mt-1 text-sm text-zinc-400">{pages.length} pages in this site</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-purple-500"
        >
          <span className="text-lg">+</span>
          Add Page
        </button>
      </div>

      {/* Add Page Form */}
      {showAdd && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">New Page</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
              <input
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                placeholder="Blog"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Slug</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="blog"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="custom">Custom</option>
                <option value="home">Home</option>
                <option value="shop">Shop</option>
                <option value="about">About</option>
                <option value="contact">Contact</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={adding || !newTitle.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {adding ? "Adding..." : "Create Page"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <button
              onClick={() => router.push(`/cms/${siteId}/pages/${page.slug}`)}
              className="flex items-center gap-4 text-left flex-1"
            >
              <span className="text-xl">{pageTypeIcons[page.type] || "📄"}</span>
              <div>
                <div className="text-sm font-medium text-white">{page.title}</div>
                <div className="text-xs text-zinc-500">/{page.slug} • {page.sectionCount} sections</div>
              </div>
            </button>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => router.push(`/cms/${siteId}/pages/${page.slug}`)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(page.slug)}
                disabled={deleting === page.slug}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
              >
                {deleting === page.slug ? "..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
