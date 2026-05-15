"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  compareAtPrice?: number;
  sizes?: { label: string; priceDelta: number }[];
  colors?: { hex: string; name: string; priceDelta: number }[];
}

export default function ProductsManager() {
  const { siteId } = useParams<{ siteId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", description: "" });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [siteId]);

  async function loadProducts() {
    try {
      const res = await fetch(`/api/sites/${siteId}/products`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product: Product) {
    setEditing(product.id);
    setEditData({ name: product.name, price: product.price, category: product.category, description: product.description });
  }

  async function saveEdit(productId: string) {
    setSaving(true);
    try {
      await fetch(`/api/sites/${siteId}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      setEditing(null);
      loadProducts();
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    if (!newProduct.name.trim() || !newProduct.price) return;
    setAdding(true);
    try {
      await fetch(`/api/sites/${siteId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          category: newProduct.category || "General",
          description: newProduct.description,
        }),
      });
      setNewProduct({ name: "", price: "", category: "", description: "" });
      setShowAdd(false);
      loadProducts();
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(productId);
    try {
      await fetch(`/api/sites/${siteId}/products/${productId}`, { method: "DELETE" });
      loadProducts();
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5 border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="mt-1 text-sm text-zinc-400">{products.length} products in store</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-purple-500"
        >
          <span className="text-lg">+</span>
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">New Product</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Name</label>
              <input
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Premium Leather Boots"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                placeholder="99.99"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Category</label>
              <input
                value={newProduct.category}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Boots"
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Description</label>
              <input
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Handcrafted premium boots..."
                className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={adding || !newProduct.name.trim()}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition"
            >
              {adding ? "Adding..." : "Create Product"}
            </button>
            <button onClick={() => setShowAdd(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Price</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Rating</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.03] transition">
                <td className="px-5 py-4">
                  {editing === product.id ? (
                    <input
                      value={editData.name ?? ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-8 w-full rounded border border-white/10 bg-white/5 px-2 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-white">{product.name}</div>
                      {product.badge && (
                        <span className="mt-1 inline-block rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  {editing === product.id ? (
                    <input
                      value={editData.category ?? ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                      className="h-8 w-full rounded border border-white/10 bg-white/5 px-2 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <span className="text-sm text-zinc-400">{product.category}</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {editing === product.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.price ?? ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="h-8 w-24 rounded border border-white/10 bg-white/5 px-2 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <div>
                      <span className="text-sm font-semibold text-white">${product.price.toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="ml-2 text-xs text-zinc-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                    <span className="text-amber-400">★</span>
                    {product.rating?.toFixed(1) || "—"}
                    {product.reviewCount && <span className="text-xs text-zinc-500">({product.reviewCount})</span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  {editing === product.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => saveEdit(product.id)}
                        disabled={saving}
                        className="rounded px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-50"
                      >
                        {saving ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="rounded px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/5 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="rounded px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="rounded px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      >
                        {deleting === product.id ? "..." : "Delete"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Color Swatches Summary */}
      {products.some(p => p.colors && p.colors.length > 0) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Available Colors</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set(products.flatMap(p => p.colors?.map(c => JSON.stringify({ hex: c.hex, name: c.name })) ?? []))
            ).map((json) => {
              const c = JSON.parse(json);
              return (
                <div key={json} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  <div className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                  <span className="text-xs text-zinc-400">{c.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
