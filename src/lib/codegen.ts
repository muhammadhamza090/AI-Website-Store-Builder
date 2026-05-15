import type { GeneratedWebsite, Section } from "@/lib/site-schema";

export type CodeFile = {
  filename: string;
  language: string;
  content: string;
};

export type CodeBundle = {
  files: CodeFile[];
};

export function generateCodeBundle(website: GeneratedWebsite): CodeBundle {
  const homePage = website.site.pages.find((page) => page.slug === "home") ?? website.site.pages[0];

  return {
    files: [
      {
        filename: "index.html",
        language: "html",
        content: buildHtmlDocument(website, homePage?.slug ?? "home")
      },
      {
        filename: "styles.css",
        language: "css",
        content: buildStylesheet(website)
      },
      {
        filename: "site-data.json",
        language: "json",
        content: JSON.stringify(website, null, 2)
      },
      {
        filename: "README.md",
        language: "markdown",
        content: buildReadme(website)
      }
    ]
  };
}

function buildHtmlDocument(website: GeneratedWebsite, pageSlug: string) {
  const page = website.site.pages.find((candidate) => candidate.slug === pageSlug) ?? website.site.pages[0];
  const sections = (page?.sections ?? []).filter((section) => section.type !== "navbar" && section.type !== "footer");
  const footer = page?.sections.find((section) => section.type === "footer");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(website.site.businessName)}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="site-shell">
      <header class="site-header">
        <div class="site-header__inner">
          <div class="site-brand">${escapeHtml(website.site.businessName)}</div>
          <nav class="site-nav">
            ${website.site.pages
              .map(
                (navPage) =>
                  `<a href="#${escapeHtmlAttr(navPage.slug)}" class="site-nav__link">${escapeHtml(navPage.title)}</a>`
              )
              .join("\n            ")}
          </nav>
        </div>
      </header>

      <main class="page">
        <section class="page-intro">
          <p class="eyebrow">${escapeHtml(page?.type ?? "page")}</p>
          <h1>${escapeHtml(page?.title ?? website.site.businessName)}</h1>
          <p class="page-intro__meta">${escapeHtml(website.site.layoutStyle)} · ${escapeHtml(
            website.meta?.generationStyle ?? "custom ecommerce theme"
          )}</p>
        </section>

        ${sections.map((section) => renderSection(section)).join("\n\n        ")}
      </main>

      <footer class="site-footer">
        <p>${escapeHtml(footer?.content ?? `${website.site.businessName} ecommerce preview`)}</p>
      </footer>
    </div>
  </body>
</html>`;
}

function buildStylesheet(website: GeneratedWebsite) {
  const palette = website.site.colorPalette;
  const typography = website.site.typography;

  return `:root {
  --site-primary: ${palette.primary};
  --site-secondary: ${palette.secondary};
  --site-accent: ${palette.accent};
  --site-bg: ${palette.background};
  --site-text: ${palette.text};
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(180deg, var(--site-bg), #ffffff);
  color: var(--site-text);
}

.site-shell {
  min-height: 100vh;
}

.site-header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.site-header__inner,
.page,
.site-footer {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
}

.site-header__inner {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 16px 0;
}

.site-brand {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.site-nav__link {
  color: inherit;
  text-decoration: none;
  font-size: 0.92rem;
}

.page {
  padding: 48px 0 72px;
}

.page-intro {
  margin-bottom: 32px;
}

.page-intro h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-family: Georgia, serif;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #6b7280;
  font-size: 0.75rem;
}

.page-intro__meta {
  margin-top: 10px;
  color: #6b7280;
}

.section-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
}

.section-card h2 {
  margin: 0 0 10px;
  font-size: 1.45rem;
  font-family: Georgia, serif;
}

.section-card p {
  margin: 0;
  line-height: 1.6;
}

.hero {
  background: linear-gradient(135deg, rgba(255,255,255,0.96), ${palette.secondary});
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}

.button--primary {
  background: var(--site-primary);
  color: white;
}

.button--secondary {
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: var(--site-text);
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.item-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 16px;
  background: rgba(255,255,255,0.94);
}

.item-card__meta {
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.92rem;
}

.site-footer {
  padding-bottom: 48px;
  color: #6b7280;
}

/* Theme reference:
   layout: ${website.site.layoutStyle}
   generation style: ${website.meta?.generationStyle ?? "custom"}
   heading font hint: ${typography.headingFont}
   body font hint: ${typography.bodyFont}
*/
`;
}

function buildReadme(website: GeneratedWebsite) {
  return `# ${website.site.businessName}

This code bundle was generated from the saved website JSON.

## Files

- \`index.html\`: standalone preview markup
- \`styles.css\`: generated theme styles
- \`site-data.json\`: raw generated website data

## Theme summary

- Layout style: ${website.site.layoutStyle}
- Generation style: ${website.meta?.generationStyle ?? "custom ecommerce theme"}
- Pages: ${website.site.pages.map((page) => page.slug).join(", ")}
`;
}

function renderSection(section: Section) {
  if (section.type === "hero") {
    const secondary = Array.isArray(section.items) ? (section.items[0] as Record<string, unknown> | undefined) : undefined;
    return `<section class="section-card hero" id="${escapeHtmlAttr(section.id)}">
  <p class="eyebrow">${escapeHtml(section.type)}</p>
  <h2>${escapeHtml(section.title ?? "Hero")}</h2>
  <p>${escapeHtml(section.subtitle ?? "")}</p>
  <div class="button-row">
    <a class="button button--primary" href="${escapeHtmlAttr(section.cta?.href ?? "#")}">${escapeHtml(
      section.cta?.label ?? "Shop now"
    )}</a>
    <a class="button button--secondary" href="${escapeHtmlAttr(String(secondary?.secondaryCtaHref ?? "#"))}">${escapeHtml(
      String(secondary?.secondaryCtaLabel ?? "Learn more")
    )}</a>
  </div>
</section>`;
  }

  if (Array.isArray(section.items) && section.items.length > 0) {
    return `<section class="section-card" id="${escapeHtmlAttr(section.id)}">
  <p class="eyebrow">${escapeHtml(section.type)}</p>
  <h2>${escapeHtml(section.title ?? section.type)}</h2>
  ${section.subtitle ? `<p>${escapeHtml(section.subtitle)}</p>` : ""}
  <div class="item-grid">
    ${section.items.map((item) => renderItemCard(item)).join("\n    ")}
  </div>
</section>`;
  }

  return `<section class="section-card" id="${escapeHtmlAttr(section.id)}">
  <p class="eyebrow">${escapeHtml(section.type)}</p>
  <h2>${escapeHtml(section.title ?? section.type)}</h2>
  <p>${escapeHtml(section.content ?? section.subtitle ?? "Generated content section")}</p>
</section>`;
}

function renderItemCard(item: unknown) {
  if (typeof item === "string") {
    return `<article class="item-card"><strong>${escapeHtml(item)}</strong></article>`;
  }

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const title = String(record.title ?? record.name ?? record.label ?? record.q ?? "Item");
    const meta = String(record.subtitle ?? record.category ?? record.quote ?? record.a ?? record.href ?? "");
    return `<article class="item-card">
  <strong>${escapeHtml(title)}</strong>
  ${meta ? `<div class="item-card__meta">${escapeHtml(meta)}</div>` : ""}
</article>`;
  }

  return `<article class="item-card"><strong>Item</strong></article>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttr(value: string) {
  return escapeHtml(value);
}
