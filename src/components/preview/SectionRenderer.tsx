"use client";

import { buildPreviewHref, resolvePreviewHref } from "@/components/preview/preview-links";
import { getSectionLayoutClass, getThemeProfileByVariant, type ThemeVariant } from "@/components/preview/theme";
import type { GeneratedWebsite, Product, Section } from "@/lib/site-schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProductCard } from "@/components/preview/ProductCard";

type HeroMeta = {
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  intent?: string;
  brandVoice?: string;
  heroStyle?: string;
};

type CategoryItem = {
  id?: string;
  title?: string;
  href?: string;
};

type BadgeItem = {
  label?: string;
};

type TestimonialItem = {
  name?: string;
  quote?: string;
};

type FaqItem = {
  q: string;
  a: string;
};

export function SectionRenderer({
  section,
  website,
  themeVariant,
  siteId,
  currentPageSlug,
  onAddToCart
}: {
  section: Section;
  website: GeneratedWebsite;
  themeVariant: ThemeVariant;
  siteId: string;
  currentPageSlug: string;
  onAddToCart: (product: Product) => void;
}) {
  const theme = getThemeProfileByVariant(themeVariant);
  const panelClass = theme.panelClass;
  const softPanelClass = theme.softPanelClass;
  const shopHref = resolvePreviewHref({
    siteId,
    currentPageSlug,
    href: "/shop"
  });

  const primaryLinkClass =
    themeVariant === "modern" || themeVariant === "campaign"
      ? "text-sky-700 hover:text-sky-800"
      : "text-[var(--site-primary,#4f46e5)] hover:opacity-80";

  const heroTitleClass =
    themeVariant === "campaign"
      ? "text-5xl md:text-6xl leading-none uppercase"
      : themeVariant === "brutalist"
        ? "text-5xl md:text-6xl leading-[0.92] uppercase"
        : themeVariant === "retro"
          ? "text-4xl md:text-6xl leading-tight"
          : "text-4xl md:text-5xl";

  switch (section.type) {
    case "banner":
      return (
        <div className={`border bg-gradient-to-r from-[var(--site-primary,#4f46e5)] to-[var(--site-accent,#ec4899)] px-6 py-5 text-white shadow-sm ${theme.panelClass}`}>
          <div className="text-sm font-medium opacity-90">Announcement</div>
          <div className="mt-1 text-xl font-semibold">{section.title}</div>
        </div>
      );

    case "hero": {
      const heroMeta = (section.items as HeroMeta[] | undefined)?.[0];
      const heroHighlights = buildHeroHighlights(website);
      const heroSpotlightProducts = website.products.slice(0, 3);
      const heroMetrics = buildHeroMetrics(website);
      return (
        <div className={`overflow-hidden border shadow-sm ${theme.heroClass}`}>
          <div className={`grid gap-6 md:items-center ${theme.heroInnerClass} ${getSectionLayoutClass(section.layout, themeVariant)}`}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 ${theme.chipClass}`}>
                  {website.site.industry}
                </div>
                <div className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 ${theme.chipClass}`}>
                  {heroMeta?.brandVoice ?? "Premium storefront"}
                </div>
              </div>
              <h3
                className={`mt-3 text-balance ${theme.titleClass} ${heroTitleClass}`}
                style={{ fontFamily: "var(--site-heading-font)" }}
              >
                {section.title}
              </h3>
              {section.subtitle ? (
                <p className="mt-4 max-w-2xl text-pretty text-zinc-600">{section.subtitle}</p>
              ) : null}
              {heroMeta?.intent ? (
                <p className="mt-4 max-w-xl text-sm uppercase tracking-[0.18em] text-zinc-500">{heroMeta.intent}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {heroHighlights.map((highlight) => (
                  <span key={highlight} className={`border px-3 py-1.5 text-xs font-medium ${theme.chipClass}`}>
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className={`inline-flex h-11 items-center justify-center px-5 text-sm font-medium shadow hover:opacity-95 ${theme.buttonPrimaryClass}`}
                  href={resolvePreviewHref({
                    siteId,
                    currentPageSlug,
                    href: section.cta?.href
                  })}
                >
                  {section.cta?.label ?? "Shop now"}
                </a>
                <a
                  className={`inline-flex h-11 items-center justify-center border px-5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 ${theme.buttonSecondaryClass}`}
                  href={resolvePreviewHref({
                    siteId,
                    currentPageSlug,
                    href: heroMeta?.secondaryCtaHref
                  })}
                >
                  {heroMeta?.secondaryCtaLabel ?? "Explore collections"}
                </a>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className={`border ${theme.heroSupportClass}`}>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{metric.label}</div>
                    <div className="mt-2 text-lg font-semibold">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative overflow-hidden border ${theme.heroVisualClass}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Storefront direction</div>
                  <div className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--site-heading-font)" }}>
                    {heroMeta?.heroStyle ?? website.meta?.generationStyle ?? "Premium ecommerce design"}
                  </div>
                </div>
                <div className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${theme.chipClass}`}>
                  {website.products.length} items
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {heroSpotlightProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`grid items-center gap-3 border p-3 transition duration-300 hover:-translate-y-0.5 ${index === 0 ? softPanelClass : theme.heroSupportClass} md:grid-cols-[88px_1fr_auto]`}
                  >
                    <a
                      href={buildProductHref(siteId, product.id)}
                      className={`block ${index === 0 ? "h-20" : "h-16"} rounded-2xl bg-gradient-to-br ${theme.productImageClass}`}
                    />
                    <div className="min-w-0">
                      <a href={buildProductHref(siteId, product.id)} className="text-sm font-semibold hover:underline">
                        {product.name}
                      </a>
                      <div className={`mt-1 text-xs ${theme.productMetaClass}`}>{product.category}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-zinc-600">{product.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${product.price.toFixed(0)}</div>
                      <div className={`mt-2 inline-flex border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${theme.chipClass}`}>
                        {product.badge ?? "Top pick"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {Object.values(website.site.colorPalette).map((color) => (
                  <div
                    key={color}
                    className="h-10 rounded-xl border border-black/5"
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "category_grid": {
      const items = (section.items as CategoryItem[] | undefined) ?? [];
      return (
        <div>
          <div className="mb-4">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "Categories"}</div>
            {section.subtitle ? <div className="mt-1 text-sm text-zinc-600">{section.subtitle}</div> : null}
          </div>
          <div className={`grid gap-3 ${getSectionLayoutClass(section.layout, themeVariant)}`}>
            {items.slice(0, 8).map((category, index) => (
              <a
                key={category.href ?? category.title}
                id={category.id}
                className={`group border p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${theme.categoryCardClass} ${getFeaturedCategoryClass(themeVariant, index)}`}
                href={resolvePreviewHref({
                  siteId,
                  currentPageSlug,
                  href: category.href
                })}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{category.title ?? "Category"}</div>
                    <div className="mt-2 text-xs text-zinc-600">
                      {buildCategoryDescription(category.title ?? "Category", index)}
                    </div>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.categoryAccentClass}`}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className={`text-xs ${theme.productMetaClass}`}>{countProductsByCategory(website, category.title)}</div>
                  <div className={`text-xs font-medium ${primaryLinkClass}`}>Explore -&gt;</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
    }

    case "featured_products":
    case "product_grid":
    case "best_sellers":
    case "new_arrivals": {
      const items = (section.items as GeneratedWebsite["products"] | undefined) ?? [];
      return (
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-xl font-semibold tracking-tight">{section.title ?? "Products"}</div>
              {section.subtitle ? <div className="mt-1 text-sm text-zinc-600">{section.subtitle}</div> : null}
            </div>
            <a className={`text-sm font-medium ${primaryLinkClass}`} href={shopHref}>
              View all
            </a>
          </div>
          <div className={`grid gap-4 ${getSectionLayoutClass(section.layout, themeVariant)}`}>
            {items.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id ?? product.name}
                product={product}
                themeVariant={themeVariant}
                siteId={siteId}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      );
    }

    case "brand_story":
      return (
        <Card className={panelClass}>
          <CardHeader className="border-zinc-200">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "Our story"}</div>
            {section.subtitle ? <div className="mt-1 text-sm text-zinc-600">{section.subtitle}</div> : null}
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-6 text-zinc-700">{section.content}</div>
          </CardContent>
        </Card>
      );

    case "trust_badges": {
      const items = (section.items as BadgeItem[] | undefined) ?? [];
      return (
        <div className={`border px-6 py-6 shadow-sm ${panelClass}`}>
          <div className="text-xl font-semibold tracking-tight">{section.title ?? "Trust"}</div>
          <div className={`mt-4 grid gap-3 ${getSectionLayoutClass(section.layout, themeVariant)}`}>
            {items.slice(0, 8).map((badge) => (
              <div key={badge.label} className={`border px-4 py-3 text-sm ${softPanelClass}`}>
                {badge.label ?? "Badge"}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "testimonials": {
      const items = (section.items as TestimonialItem[] | undefined) ?? [];
      return (
        <div>
          <div className="mb-4">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "Testimonials"}</div>
          </div>
          <div className={`grid gap-4 ${getSectionLayoutClass(section.layout, themeVariant)}`}>
            {items.slice(0, 6).map((testimonial) => (
              <div
                key={testimonial.name ?? testimonial.quote}
                className={`border p-5 shadow-sm transition duration-300 hover:-translate-y-1 ${panelClass}`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Verified customer</div>
                <div className="mt-3 text-sm text-zinc-700">
                  <span>&ldquo;</span>
                  {testimonial.quote ?? "Great products!"}
                  <span>&rdquo;</span>
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {testimonial.name ?? "Customer"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "newsletter":
      return (
        <div className={`border p-6 shadow-sm ${softPanelClass}`}>
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="text-xl font-semibold tracking-tight">{section.title ?? "Newsletter"}</div>
              {section.subtitle ? <div className="mt-1 max-w-xl text-sm text-zinc-600">{section.subtitle}</div> : null}
            </div>
            <div className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${theme.chipClass}`}>
              Early access offers
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="h-10 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[var(--site-primary,#4f46e5)] focus:ring-2 focus:ring-[var(--site-primary,#4f46e5)]/20"
              placeholder="you@domain.com"
            />
            <button className={`h-10 px-4 text-sm font-medium text-white shadow hover:opacity-95 ${theme.buttonPrimaryClass}`}>
              Subscribe
            </button>
          </div>
        </div>
      );

    case "contact_panel":
      return (
        <Card className={panelClass}>
          <CardHeader className="border-zinc-200">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "Contact"}</div>
            {section.subtitle ? <div className="mt-1 text-sm text-zinc-600">{section.subtitle}</div> : null}
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-zinc-700">
              <div>{section.content ?? "Reach out for product help, shipping support, and order questions."}</div>
              <div>Email: support@preview-store.demo</div>
              <div>Phone: +1 (555) 010-2026</div>
            </div>
          </CardContent>
        </Card>
      );

    case "cart_summary":
      return (
        <Card className={panelClass}>
          <CardHeader className="border-zinc-200">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "Cart overview"}</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-700">
              {section.content ?? "Review your items, quantities, and savings before checkout."}
            </div>
          </CardContent>
        </Card>
      );

    case "checkout_flow":
      return (
        <Card className={panelClass}>
          <CardHeader className="border-zinc-200">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "Checkout"}</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-700">
              {section.content ?? "A clean, low-friction checkout with clear shipping and payment steps."}
            </div>
          </CardContent>
        </Card>
      );

    case "faq": {
      const items = (section.items as FaqItem[] | undefined) ?? [];
      return (
        <Card className={panelClass}>
          <CardHeader className="border-zinc-200">
            <div className="text-xl font-semibold tracking-tight">{section.title ?? "FAQ"}</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.slice(0, 6).map((qa) => (
                <div key={qa.q} className={`border p-4 ${softPanelClass}`}>
                  <div className="text-sm font-medium">{qa.q}</div>
                  <div className="mt-1 text-sm text-zinc-600">{qa.a}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    default:
      return (
        <Card className={panelClass}>
          <CardHeader className="border-zinc-200">
            <div className="text-sm font-medium">Unsupported section: {section.type}</div>
            <div className="mt-1 text-sm text-zinc-600">Rendering a safe fallback.</div>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded-md bg-zinc-50 p-3 text-xs text-zinc-700">
              {JSON.stringify(section, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
  }
}

function buildHeroHighlights(website: GeneratedWebsite) {
  const categories = Array.from(new Set(website.products.map((product) => product.category))).slice(0, 3);
  return [
    "High-trust checkout",
    `${website.products.length}+ curated items`,
    ...categories
  ].slice(0, 4);
}

function buildHeroMetrics(website: GeneratedWebsite) {
  const categories = new Set(website.products.map((product) => product.category)).size;
  return [
    { label: "Curated", value: `${website.products.length} products` },
    { label: "Collections", value: `${categories} categories` },
    { label: "Experience", value: "Mobile-first UX" }
  ];
}

function getFeaturedCategoryClass(themeVariant: ThemeVariant, index: number) {
  if ((themeVariant === "editorial" || themeVariant === "campaign") && index === 0) {
    return "sm:col-span-2";
  }

  if (themeVariant === "modern" && index % 5 === 0) {
    return "lg:col-span-2";
  }

  return "";
}

function buildCategoryDescription(category: string, index: number) {
  const descriptors = [
    "Signature assortment with premium merchandising.",
    "Designed for quick comparison and easy browsing.",
    "Curated for gifting, styling, and discovery.",
    "Best-performing edits for returning shoppers."
  ];

  return `${category} ${descriptors[index % descriptors.length]}`;
}

function countProductsByCategory(website: GeneratedWebsite, category?: string) {
  const count = website.products.filter((product) => product.category === category).length;
  return `${count || 0} items`;
}

function buildProductHref(siteId: string, productId: string) {
  return buildPreviewHref(siteId, "product", { productId });
}
