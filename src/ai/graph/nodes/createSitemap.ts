import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { sitemapSchema, type WebsiteGraphState } from "@/ai/graph/state";
import { requiredPageSlugs } from "@/lib/site-schema";

export async function createSitemap(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    businessAnalysis: state.businessAnalysis,
    strategy: state.strategy,
    requiredPages: requiredPageSlugs,
    instruction:
      "Return JSON array of pages: [{slug,title,type}]. Must include slugs: home, shop, product, cart, checkout, about, contact. Use professional storefront conventions and make page titles feel polished for this business."
  };

  const rawSitemap = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 4096,
    temperature: 0.3,
    system:
      "You create concise professional ecommerce sitemaps. Always include required pages. Return ONLY a valid JSON array — no markdown fences, no explanation, no preamble. Start your response with [ and end with ].",
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "createSitemap",
    validate: (data) => sitemapSchema.parse(data),
  });

  const ensured = ensureRequiredPages(rawSitemap);
  return { sitemap: ensured };
}

function ensureRequiredPages(
  sitemap: Array<{ slug: string; title: string; type: string }>
) {
  const bySlug = new Map(sitemap.map((p) => [p.slug, p]));
  const defaults: Record<string, { title: string; type: string }> = {
    home: { title: "Home", type: "home" },
    shop: { title: "Shop", type: "shop" },
    product: { title: "Product Detail", type: "product_detail" },
    cart: { title: "Cart", type: "cart" },
    checkout: { title: "Checkout", type: "checkout" },
    about: { title: "About", type: "about" },
    contact: { title: "Contact", type: "contact" }
  };
  for (const slug of requiredPageSlugs) {
    if (!bySlug.has(slug)) bySlug.set(slug, { slug, ...defaults[slug] });
  }
  return Array.from(bySlug.values());
}
