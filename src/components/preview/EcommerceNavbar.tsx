"use client";

import { Search, ShoppingCart, User } from "lucide-react";
import { buildPreviewHref } from "@/components/preview/preview-links";
import { getThemeProfileByVariant, type ThemeVariant } from "@/components/preview/theme";
import type { GeneratedWebsite } from "@/lib/site-schema";

export function EcommerceNavbar({
  website,
  themeVariant,
  siteId,
  currentPageSlug,
  cartItemCount
}: {
  website: GeneratedWebsite;
  themeVariant: ThemeVariant;
  siteId: string;
  currentPageSlug: string;
  cartItemCount: number;
}) {
  const businessName = website.site.businessName;
  const hasShopPage = website.site.pages.some((page) => page.slug === "shop");
  const hasAboutPage = website.site.pages.some((page) => page.slug === "about");
  const hasContactPage = website.site.pages.some((page) => page.slug === "contact");
  const categories = Array.from(new Set(website.products.map((product) => product.category))).slice(0, 4);
  const theme = getThemeProfileByVariant(themeVariant);

  const brandClass =
    themeVariant === "brutalist"
      ? "text-base font-black tracking-[0.18em]"
      : themeVariant === "retro"
        ? "text-base font-black tracking-[0.08em]"
        : themeVariant === "campaign"
          ? "text-sm font-bold tracking-[0.18em]"
          : "text-sm font-semibold tracking-[0.12em]";

  const iconButtonClass =
    themeVariant === "brutalist"
      ? "rounded-none border-black bg-white"
      : themeVariant === "retro"
        ? "rounded-[14px] border-violet-200 bg-white"
        : themeVariant === "campaign"
          ? "rounded-md border-orange-200 bg-white"
          : "rounded-md border-zinc-200 bg-white";

  const promoMessage =
    themeVariant === "campaign"
      ? "Free shipping on curated drops this week"
      : themeVariant === "editorial"
        ? "New seasonal editorial collection now live"
        : themeVariant === "modern"
          ? "Fast delivery, easy returns, secure checkout"
          : themeVariant === "organic"
            ? "Thoughtful materials, calm browsing, trusted delivery"
            : "Curated ecommerce preview experience";

  return (
    <div className={`sticky top-0 z-20 border-b backdrop-blur ${theme.navClass}`}>
      <div className={`px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] md:px-6 ${theme.promoBarClass}`}>
        {promoMessage}
      </div>
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 ${theme.navInnerClass}`}>
        <div className="flex min-w-0 items-center gap-6">
          <a href={buildPreviewHref(siteId, "home")} className={`truncate uppercase ${brandClass}`}>
            {businessName}
          </a>
          <nav className="hidden items-center gap-4 md:flex">
            {hasShopPage ? (
              <a className={theme.navLinkClass} href={buildPreviewHref(siteId, "shop")}>
                Shop
              </a>
            ) : null}
            {hasAboutPage ? (
              <a className={theme.navLinkClass} href={buildPreviewHref(siteId, "about")}>
                About
              </a>
            ) : null}
            {hasContactPage ? (
              <a className={theme.navLinkClass} href={buildPreviewHref(siteId, "contact")}>
                Contact
              </a>
            ) : null}
            {categories.map((category) => (
              <a
                key={category}
                className={theme.navLinkClass}
                href={buildPreviewHref(siteId, "shop", { hash: `cat-${slugify(category)}` })}
              >
                {category}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={buildPreviewHref(siteId, "shop")}
            className={`grid h-9 w-9 place-items-center border hover:bg-zinc-50 ${iconButtonClass} ${theme.navUtilityClass}`}
          >
            <Search className="h-4 w-4 text-zinc-700" />
          </a>
          <a
            href={buildPreviewHref(siteId, currentPageSlug === "about" ? "contact" : "about")}
            className={`grid h-9 w-9 place-items-center border hover:bg-zinc-50 ${iconButtonClass} ${theme.navUtilityClass}`}
          >
            <User className="h-4 w-4 text-zinc-700" />
          </a>
          <a
            href={buildPreviewHref(siteId, "cart")}
            className={`relative grid h-9 w-9 place-items-center bg-[var(--site-primary,#4f46e5)] text-white shadow hover:opacity-95 ${theme.productButtonClass}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-zinc-900 shadow">
                {cartItemCount}
              </span>
            ) : null}
          </a>
        </div>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
