"use client";

import { buildPreviewHref } from "@/components/preview/preview-links";
import { getThemeProfileByVariant, type ThemeVariant } from "@/components/preview/theme";
import type { Product } from "@/lib/site-schema";

export function ProductCard({
  product,
  themeVariant,
  siteId,
  onAddToCart
}: {
  product: Product;
  themeVariant: ThemeVariant;
  siteId: string;
  onAddToCart: (product: Product) => void;
}) {
  const theme = getThemeProfileByVariant(themeVariant);
  const productHref = buildPreviewHref(siteId, "product", { productId: product.id });

  const badgeClass =
    themeVariant === "brutalist"
      ? "rounded-none border border-black bg-white"
      : themeVariant === "campaign"
        ? "rounded-md bg-white text-zinc-800"
        : "rounded-full bg-white/80";

  return (
    <div className={`group overflow-hidden border shadow-sm transition duration-300 ${theme.productCardInteractiveClass} ${theme.productCardClass}`}>
      <a href={productHref} className={`relative block ${theme.productAspectClass} bg-gradient-to-br ${theme.productImageClass}`}>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <div className={`${badgeClass} px-2.5 py-1 text-xs text-zinc-700 backdrop-blur`}>
            {product.badge ?? product.category}
          </div>
          {product.rating ? (
            <div className={`${badgeClass} px-2.5 py-1 text-xs text-zinc-700 backdrop-blur`}>
              {product.rating.toFixed(1)} rated
            </div>
          ) : null}
        </div>
        <div className="flex h-full items-end p-4">
          <div className="w-full rounded-2xl border border-white/50 bg-white/70 p-3 opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Quick preview</div>
            <div className="mt-1 text-sm font-medium text-zinc-800">{product.category}</div>
          </div>
        </div>
      </a>
      <div className={theme.productContentClass}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <a href={productHref} className="truncate text-sm font-medium hover:underline">
              {product.name}
            </a>
            <div className={`mt-1 text-[11px] uppercase tracking-[0.14em] ${theme.productMetaClass}`}>{product.category}</div>
            <div className="mt-2 line-clamp-2 text-xs text-zinc-600">{product.description}</div>
          </div>
          <div className="shrink-0 text-sm font-semibold">${product.price.toFixed(0)}</div>
        </div>
        {product.variants.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.slice(0, 3).map((variant) => (
              <span key={variant.id} className={`border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${theme.chipClass}`}>
                {variant.name}
              </span>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className={`mt-4 inline-flex h-9 w-full items-center justify-center bg-[var(--site-primary,#4f46e5)] text-sm font-medium text-white shadow hover:opacity-95 ${theme.productButtonClass}`}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
