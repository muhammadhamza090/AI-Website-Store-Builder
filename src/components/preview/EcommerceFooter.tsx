"use client";

import { resolveFooterHref } from "@/components/preview/preview-links";
import { getThemeProfileByVariant, type ThemeVariant } from "@/components/preview/theme";
import type { GeneratedWebsite } from "@/lib/site-schema";

type FooterLink = string | { label?: string; href?: string };
type FooterGroup = {
  title: string;
  links?: FooterLink[];
};

export function EcommerceFooter({
  website,
  themeVariant,
  siteId,
  currentPageSlug
}: {
  website: GeneratedWebsite;
  themeVariant: ThemeVariant;
  siteId: string;
  currentPageSlug: string;
}) {
  const footer =
    website.site.pages
      .flatMap((page) => page.sections)
      .find((section) => section.type === "footer") ?? null;

  const blurb = footer?.content ?? "Made with AI Ecommerce Builder";
  const groups = (footer?.items as FooterGroup[] | undefined) ?? [];
  const theme = getThemeProfileByVariant(themeVariant);

  return (
    <footer className={`border-t ${theme.footerClass}`}>
      <div className={`mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 ${theme.footerGridClass}`}>
        <div className="md:col-span-2">
          <div className={`text-sm font-semibold uppercase ${theme.titleClass}`}>{website.site.businessName}</div>
          <p className="mt-2 max-w-md text-sm text-zinc-600">{blurb}</p>
          <div className={`mt-4 inline-flex border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${theme.chipClass}`}>
            {website.meta?.generationStyle ?? "Storefront experience"}
          </div>
          <div className="mt-4 flex items-center gap-2">
            {(groups.find((group) => group.title === "Social")?.links ?? []).slice(0, 4).map((link) => (
              <a
                key={typeof link === "string" ? link : link.href ?? link.label}
                className="text-sm text-zinc-700 hover:text-zinc-900"
                href={resolveFooterHref({
                  siteId,
                  currentPageSlug,
                  label: typeof link === "string" ? link : link.label,
                  href: typeof link === "string" ? undefined : link.href
                })}
              >
                {typeof link === "string" ? link : link.label ?? "Link"}
              </a>
            ))}
          </div>
        </div>

        {groups
          .filter((group) => group.title !== "Social")
          .slice(0, 2)
          .map((group) => (
            <div key={group.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{group.title}</div>
              <ul className="mt-3 space-y-2">
                {(group.links ?? []).slice(0, 6).map((link) => (
                  <li key={typeof link === "string" ? link : link.href ?? link.label ?? "link"}>
                    <a
                      className="text-sm text-zinc-700 hover:text-zinc-900"
                      href={resolveFooterHref({
                        siteId,
                        currentPageSlug,
                        label: typeof link === "string" ? link : link.label ?? link.href,
                        href: typeof link === "string" ? undefined : link.href
                      })}
                    >
                      {typeof link === "string" ? link : link.label ?? link.href ?? "Link"}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Newsletter</div>
          <p className="mt-3 text-sm text-zinc-600">Get product drops, offers, and stories.</p>
          <div className="mt-3 flex gap-2">
            <input
              className="h-10 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[var(--site-primary,#4f46e5)] focus:ring-2 focus:ring-[var(--site-primary,#4f46e5)]/20"
              placeholder="you@domain.com"
            />
            <button className={`h-10 bg-[var(--site-primary,#4f46e5)] px-4 text-sm font-medium text-white shadow hover:opacity-95 ${theme.productButtonClass}`}>
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">
        (c) {new Date().getFullYear()} {website.site.businessName}. Generated for demo purposes.
      </div>
    </footer>
  );
}
