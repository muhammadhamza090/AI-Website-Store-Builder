"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { buildPreviewHref } from "@/components/preview/preview-links";
import { EcommerceNavbar } from "@/components/preview/EcommerceNavbar";
import { EcommerceFooter } from "@/components/preview/EcommerceFooter";
import { SectionRenderer } from "@/components/preview/SectionRenderer";
import { getFontStacks, getThemeProfile, getThemeProfileByVariant } from "@/components/preview/theme";
import type { GeneratedWebsite, Product } from "@/lib/site-schema";

type CartLine = {
  productId: string;
  quantity: number;
};

export function WebsiteRenderer({
  website,
  pageSlug,
  siteId,
  selectedProductId
}: {
  website: GeneratedWebsite;
  pageSlug: string;
  siteId: string;
  selectedProductId?: string;
}) {
  const palette = website.site.colorPalette;
  const page = website.site.pages.find((candidate) => candidate.slug === pageSlug) ?? website.site.pages[0];
  const [cart, setCart] = React.useState<CartLine[]>(() => readCartFromStorage(siteId));

  const selectedProduct =
    website.products.find((product) => product.id === selectedProductId) ??
    website.products[0] ??
    null;

  React.useEffect(() => {
    setCart(readCartFromStorage(siteId));
  }, [siteId]);

  function addToCart(product: Product) {
    setCart((current) => {
      const nextCart = current.some((entry) => entry.productId === product.id)
        ? current.map((entry) =>
          entry.productId === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        )
        : [...current, { productId: product.id, quantity: 1 }];
      writeCartToStorage(siteId, nextCart);
      return nextCart;
    });
  }

  function updateCartQuantity(productId: string, quantity: number) {
    setCart((current) => {
      const nextCart =
        quantity <= 0
          ? current.filter((entry) => entry.productId !== productId)
          : current.map((entry) =>
              entry.productId === productId
                ? { ...entry, quantity }
                : entry
            );
      writeCartToStorage(siteId, nextCart);
      return nextCart;
    });
  }

  const cartLines = cart
    .map((entry) => {
      const product = website.products.find((candidate) => candidate.id === entry.productId);
      if (!product) return null;
      return {
        product,
        quantity: entry.quantity,
        lineTotal: product.price * entry.quantity
      };
    })
    .filter((entry): entry is { product: Product; quantity: number; lineTotal: number } => Boolean(entry));
  const cartItemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const cartSubtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);

  const theme = getThemeProfile(website);
  const fonts = getFontStacks(website);
  const style = {
    "--site-primary": palette.primary,
    "--site-secondary": palette.secondary,
    "--site-accent": palette.accent,
    "--site-bg": palette.background,
    "--site-text": palette.text,
    "--site-heading-font": fonts.heading,
    "--site-body-font": fonts.body
  } as CSSProperties;

  return (
    <div
      style={style}
      className={`overflow-hidden border ${theme.frameClass}`}
    >
      <EcommerceNavbar
        website={website}
        themeVariant={theme.variant}
        siteId={siteId}
        currentPageSlug={page.slug}
        cartItemCount={cartItemCount}
      />
      <div
        className={`${theme.shellClass} text-[var(--site-text,#111827)]`}
        style={{ fontFamily: "var(--site-body-font)" }}
      >
        <div className={`mx-auto ${theme.contentWidthClass} ${theme.pagePaddingClass}`}>
          {page.slug !== "home" ? (
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{page.type}</div>
                <h2
                  className={`mt-2 text-3xl md:text-4xl ${theme.titleClass}`}
                  style={{ fontFamily: "var(--site-heading-font)" }}
                >
                  {page.title}
                </h2>
              </div>
              <div className={`border px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-500 backdrop-blur ${theme.chipClass}`}>
                {website.meta?.generationStyle ?? website.site.layoutStyle}
              </div>
            </div>
          ) : (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className={`border px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500 ${theme.chipClass}`}>
                {website.meta?.generationStyle ?? "Professional storefront"}
              </div>
              <div className="text-xs text-zinc-500">
                Crafted for {website.site.industry.toLowerCase()} conversion and discovery
              </div>
            </div>
          )}

          <div className={theme.sectionGapClass}>
            {page.slug === "product" && selectedProduct ? (
              <ProductDetailPanel
                product={selectedProduct}
                siteId={siteId}
                themeVariant={theme.variant}
                onAddToCart={addToCart}
              />
            ) : null}
            {page.slug === "cart" ? (
              <CartDetailPanel
                cartLines={cartLines}
                subtotal={cartSubtotal}
                siteId={siteId}
                themeVariant={theme.variant}
                onUpdateQuantity={updateCartQuantity}
              />
            ) : null}
            {page.slug === "checkout" ? (
              <CheckoutDetailPanel
                cartLines={cartLines}
                subtotal={cartSubtotal}
                siteId={siteId}
                businessName={website.site.businessName}
                themeVariant={theme.variant}
              />
            ) : null}
            {page.sections
              .filter((section) => section.type !== "navbar" && section.type !== "footer")
              .map((section) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  themeVariant={theme.variant}
                  website={website}
                  siteId={siteId}
                  currentPageSlug={page.slug}
                  onAddToCart={addToCart}
                />
              ))}
          </div>
        </div>
      </div>
      <EcommerceFooter website={website} themeVariant={theme.variant} siteId={siteId} currentPageSlug={page.slug} />
    </div>
  );
}

function ProductDetailPanel({
  product,
  siteId,
  themeVariant,
  onAddToCart
}: {
  product: Product;
  siteId: string;
  themeVariant: ReturnType<typeof getThemeProfile>["variant"];
  onAddToCart: (product: Product) => void;
}) {
  const theme = getThemeProfileByVariant(themeVariant);

  return (
    <div className={`grid gap-6 border p-6 shadow-sm md:grid-cols-[1.1fr_.9fr] ${theme.panelClass}`}>
      <div className={`min-h-[260px] rounded-2xl bg-gradient-to-br ${theme.productImageClass}`} />
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{product.category}</div>
        <h3 className={`mt-3 text-3xl ${theme.titleClass}`} style={{ fontFamily: "var(--site-heading-font)" }}>
          {product.name}
        </h3>
        <div className="mt-4 text-lg font-semibold">${product.price.toFixed(2)}</div>
        <p className="mt-4 text-sm leading-6 text-zinc-600">{product.description}</p>
        {product.badge ? (
          <div className={`mt-4 inline-flex border px-3 py-1 text-xs uppercase tracking-[0.16em] ${theme.chipClass}`}>
            {product.badge}
          </div>
        ) : null}
        {product.variants.length > 0 ? (
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Options</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <span key={variant.id} className={`border px-3 py-2 text-sm ${theme.softPanelClass}`}>
                  {variant.name}
                  {variant.priceDelta ? ` (+$${variant.priceDelta})` : ""}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={`inline-flex h-11 items-center justify-center px-5 text-sm font-medium shadow hover:opacity-95 ${theme.buttonPrimaryClass}`}
          >
            Add to cart
          </button>
          <a
            href={buildPreviewHref(siteId, "cart")}
            className={`inline-flex h-11 items-center justify-center border px-5 text-sm font-medium ${theme.buttonSecondaryClass}`}
          >
            View cart
          </a>
        </div>
      </div>
    </div>
  );
}

function CartDetailPanel({
  cartLines,
  subtotal,
  siteId,
  themeVariant,
  onUpdateQuantity
}: {
  cartLines: Array<{ product: Product; quantity: number; lineTotal: number }>;
  subtotal: number;
  siteId: string;
  themeVariant: ReturnType<typeof getThemeProfile>["variant"];
  onUpdateQuantity: (productId: string, quantity: number) => void;
}) {
  const theme = getThemeProfileByVariant(themeVariant);

  return (
    <div className={`border p-6 shadow-sm ${theme.panelClass}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Cart</div>
          <h3 className={`mt-2 text-2xl ${theme.titleClass}`} style={{ fontFamily: "var(--site-heading-font)" }}>
            Your selected items
          </h3>
        </div>
        <a href={buildPreviewHref(siteId, "checkout")} className={`inline-flex h-10 items-center px-4 text-sm font-medium ${theme.buttonPrimaryClass}`}>
          Continue to checkout
        </a>
      </div>

      {cartLines.length === 0 ? (
        <div className={`mt-6 border px-5 py-8 text-sm text-zinc-600 ${theme.softPanelClass}`}>
          Your cart is empty. Browse the shop and add products to see them here.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {cartLines.map((line) => (
            <div key={line.product.id} className={`flex flex-wrap items-center justify-between gap-4 border p-4 ${theme.softPanelClass}`}>
              <div>
                <a href={buildPreviewHref(siteId, "product", { productId: line.product.id })} className="text-sm font-medium hover:underline">
                  {line.product.name}
                </a>
                <div className="mt-1 text-xs text-zinc-500">{line.product.category}</div>
                <div className="mt-1 text-sm text-zinc-600">${line.product.price.toFixed(2)} each</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className={`h-9 w-9 border text-sm ${theme.buttonSecondaryClass}`} onClick={() => onUpdateQuantity(line.product.id, line.quantity - 1)}>
                  -
                </button>
                <div className="min-w-10 text-center text-sm font-medium">{line.quantity}</div>
                <button type="button" className={`h-9 w-9 border text-sm ${theme.buttonSecondaryClass}`} onClick={() => onUpdateQuantity(line.product.id, line.quantity + 1)}>
                  +
                </button>
              </div>
              <div className="text-sm font-semibold">${line.lineTotal.toFixed(2)}</div>
            </div>
          ))}
          <div className="flex justify-end">
            <div className={`min-w-[240px] border p-4 ${theme.softPanelClass}`}>
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutDetailPanel({
  cartLines,
  subtotal,
  siteId,
  businessName,
  themeVariant
}: {
  cartLines: Array<{ product: Product; quantity: number; lineTotal: number }>;
  subtotal: number;
  siteId: string;
  businessName: string;
  themeVariant: ReturnType<typeof getThemeProfile>["variant"];
}) {
  const theme = getThemeProfileByVariant(themeVariant);

  return (
    <div className={`grid gap-6 border p-6 shadow-sm lg:grid-cols-[1.1fr_.9fr] ${theme.panelClass}`}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Checkout</div>
        <h3 className={`mt-2 text-2xl ${theme.titleClass}`} style={{ fontFamily: "var(--site-heading-font)" }}>
          Secure checkout for {businessName}
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm" placeholder="Full name" />
          <input className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm" placeholder="Email address" />
          <input className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm md:col-span-2" placeholder="Shipping address" />
          <input className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm" placeholder="City" />
          <input className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm" placeholder="Postal code" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className={`inline-flex h-11 items-center justify-center px-5 text-sm font-medium shadow ${theme.buttonPrimaryClass}`}>
            Place demo order
          </button>
          <a href={buildPreviewHref(siteId, "cart")} className={`inline-flex h-11 items-center justify-center border px-5 text-sm font-medium ${theme.buttonSecondaryClass}`}>
            Back to cart
          </a>
        </div>
      </div>
      <div className={`border p-5 ${theme.softPanelClass}`}>
        <div className="text-sm font-semibold">Order summary</div>
        <div className="mt-4 space-y-3">
          {cartLines.length === 0 ? (
            <div className="text-sm text-zinc-600">Your cart is empty. Add items before checkout.</div>
          ) : (
            cartLines.map((line) => (
              <div key={line.product.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{line.product.name}</div>
                  <div className="text-zinc-500">Qty {line.quantity}</div>
                </div>
                <div className="font-medium">${line.lineTotal.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 border-t border-zinc-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span>{cartLines.length > 0 ? "$12.00" : "$0.00"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>${(subtotal + (cartLines.length > 0 ? 12 : 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCartStorageKey(siteId: string) {
  return `previewCart:${siteId}`;
}

function readCartFromStorage(siteId: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getCartStorageKey(siteId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry) => typeof entry?.productId === "string" && typeof entry?.quantity === "number")
      .map((entry) => ({
        productId: entry.productId,
        quantity: Math.max(1, Math.floor(entry.quantity))
      }));
  } catch {
    return [];
  }
}

function writeCartToStorage(siteId: string, cart: CartLine[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getCartStorageKey(siteId), JSON.stringify(cart));
  } catch {
    // Ignore storage failures in preview mode.
  }
}
