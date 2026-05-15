import { requiredPageSlugs } from "@/lib/site-schema";
import { websiteZod, type ValidationResult, type WebsiteGraphState } from "@/ai/graph/state";

export async function validateWebsite(state: WebsiteGraphState): Promise<{ validation: ValidationResult }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ─── HTML validation (primary path) ─────────────────────────────────────────
  if (state.generatedHTML) {
    const html = state.generatedHTML;

    if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
      errors.push("generatedHTML does not appear to be a valid HTML document.");
      return { validation: { ok: false, errors, warnings } };
    }

    if (!html.toLowerCase().includes("<body")) {
      errors.push("generatedHTML is missing a <body> element.");
    }

    if (!html.toLowerCase().includes("<style")) {
      warnings.push("generatedHTML has no embedded <style> block.");
    }

    if (!html.toLowerCase().includes("<script")) {
      warnings.push("generatedHTML has no embedded <script> block — interactivity may be missing.");
    }

    if (!html.toLowerCase().includes("fonts.googleapis.com")) {
      warnings.push("No Google Fonts detected — typography may fall back to system fonts.");
    }

    const requiredKeywords = ["home", "shop", "cart", "checkout", "about"];
    for (const keyword of requiredKeywords) {
      if (!html.toLowerCase().includes(keyword)) {
        warnings.push(`HTML may be missing a "${keyword}" page or section.`);
      }
    }

    if (!html.toLowerCase().includes("add to cart") && !html.toLowerCase().includes("addtocart")) {
      warnings.push("No 'Add to cart' interaction detected.");
    }

    // Responsive CSS checks
    if (!html.includes("@media")) {
      errors.push("No @media queries found — the website is NOT responsive. Add breakpoints for 480px, 768px, and 1024px.");
    } else {
      const mediaCount = (html.match(/@media/g) || []).length;
      if (mediaCount < 2) {
        warnings.push(`Only ${mediaCount} @media query found — add breakpoints for mobile (480px), tablet (768px), and desktop (1024px).`);
      }
    }

    if (!html.toLowerCase().includes("hamburger") && !html.toLowerCase().includes("mobile-menu") && !html.toLowerCase().includes("menu-toggle") && !html.toLowerCase().includes("nav-toggle")) {
      warnings.push("No mobile hamburger menu detected — navigation may not work on small screens.");
    }

    if (html.length < 8000) {
      errors.push("generatedHTML is too short — the website is likely incomplete.");
    }

    const ok = errors.length === 0;
    return { validation: { ok, errors, warnings } };
  }

  // ─── Legacy JSON validation (fallback path) ──────────────────────────────────
  if (!state.website) {
    errors.push("No website JSON was generated.");
    return { validation: { ok: false, errors, warnings } };
  }

  const parsed = websiteZod.safeParse(state.website);
  if (!parsed.success) {
    errors.push("Website JSON failed schema validation.");
    for (const issue of parsed.error.issues.slice(0, 12)) {
      errors.push(`${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    return { validation: { ok: false, errors, warnings } };
  }

  const website = parsed.data;

  const slugs = new Set(website.site.pages.map((p) => p.slug));
  for (const slug of requiredPageSlugs) {
    if (!slugs.has(slug)) errors.push(`Missing required page slug: "${slug}"`);
  }

  const home = website.site.pages.find((p) => p.slug === "home");
  if (!home) {
    errors.push('Missing "home" page.');
  } else {
    if (home.sections.length < 6) errors.push("Homepage must have at least 6 sections.");

    const types = new Set(home.sections.map((s) => s.type));
    for (const t of ["hero", "footer"]) {
      if (!types.has(t)) errors.push(`Homepage missing required section type: "${t}"`);
    }

    const heroSection = home.sections.find((s) => s.type === "hero");
    if (!heroSection?.cta?.label || !heroSection?.cta?.href) {
      errors.push("Homepage hero must include a visible primary CTA with label and href.");
    }

    const contentSections = home.sections.filter((s) => s.type !== "navbar" && s.type !== "footer");
    const hasCommerce = contentSections.some((s) =>
      ["category_grid", "featured_products", "product_grid", "best_sellers", "new_arrivals"].includes(s.type)
    );
    if (!hasCommerce) {
      warnings.push("Homepage should surface shopping or category discovery.");
    }
  }

  if (!website.products || website.products.length < 6) {
    errors.push("At least 6 products are required.");
  }

  const colors = website.site.colorPalette;
  for (const [k, v] of Object.entries(colors)) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(v)) errors.push(`Color "${k}" must be a hex string like #RRGGBB.`);
  }

  const ok = errors.length === 0;
  return { validation: { ok, errors, warnings } };
}
