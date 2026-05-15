export function buildPreviewHref(
  siteId: string,
  pageSlug: string,
  options?: {
    hash?: string;
    productId?: string;
  }
) {
  const params = new URLSearchParams({
    view: "design",
    page: pageSlug
  });

  if (options?.productId) {
    params.set("product", options.productId);
  }

  return `/preview/${siteId}?${params.toString()}${options?.hash ? `#${encodeURIComponent(options.hash)}` : ""}`;
}

export function resolvePreviewHref(args: {
  siteId: string;
  currentPageSlug: string;
  href?: string | null;
}) {
  const { siteId, currentPageSlug, href } = args;

  if (!href || href === "#") {
    return buildPreviewHref(siteId, currentPageSlug);
  }

  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    return href;
  }

  if (href.startsWith("#")) {
    const hash = href.slice(1);
    const pageSlug = hash === "shop" || hash.startsWith("cat-") ? "shop" : currentPageSlug;
    return buildPreviewHref(siteId, pageSlug, { hash });
  }

  const target = new URL(href, "https://preview.local");
  const path = target.pathname.replace(/^\/+|\/+$/g, "");
  const firstSegment = path.split("/")[0] ?? "";
  const pageSlug = normalizePageSlug(firstSegment || "home");
  const category = target.searchParams.get("cat");
  const hash = target.hash
    ? target.hash.slice(1)
    : pageSlug === "shop" && category
      ? `cat-${slugify(category)}`
      : undefined;

  return buildPreviewHref(siteId, pageSlug, { hash: hash ?? undefined });
}

export function resolveFooterHref(args: {
  siteId: string;
  currentPageSlug: string;
  label?: string | null;
  href?: string | null;
}) {
  const { siteId, currentPageSlug, label, href } = args;

  if (href && href !== "#") {
    return resolvePreviewHref({
      siteId,
      currentPageSlug,
      href
    });
  }

  const fingerprint = `${label ?? ""}`.toLowerCase();

  if (/(shop|catalog|collection|product)/.test(fingerprint)) {
    return buildPreviewHref(siteId, "shop");
  }

  if (/(about|story|brand)/.test(fingerprint)) {
    return buildPreviewHref(siteId, "about");
  }

  if (/(contact|support|help|shipping|return|order)/.test(fingerprint)) {
    return buildPreviewHref(siteId, "contact");
  }

  if (/(policy|privacy|terms|refund|checkout|payment)/.test(fingerprint)) {
    return buildPreviewHref(siteId, "checkout");
  }

  return buildPreviewHref(siteId, currentPageSlug);
}

function normalizePageSlug(value: string) {
  switch (value.toLowerCase()) {
    case "":
    case "home":
      return "home";
    case "shop":
      return "shop";
    case "product":
    case "product_detail":
      return "product";
    case "cart":
      return "cart";
    case "checkout":
      return "checkout";
    case "about":
      return "about";
    case "contact":
      return "contact";
    default:
      return value.toLowerCase();
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
