import { notFound } from "next/navigation";
import { db, eq, schema } from "@/lib/db";
import { generatedWebsiteSchema, type GeneratedWebsite } from "@/lib/site-schema";
import { createFallbackWebsiteFromBrief } from "@/lib/fallback-site";
import { websiteBriefSchema } from "@/lib/validation";
import { WebsiteRenderer } from "@/components/preview/WebsiteRenderer";

/**
 * PUBLIC route: /s/[siteSlug]
 * Serves the live published website by slug.
 * No auth required — this is the customer-facing storefront.
 */
export default async function LiveSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ siteSlug: string }>;
  searchParams: Promise<{ page?: string; product?: string }>;
}) {
  const { siteSlug } = await params;
  const sp = await searchParams;

  // Look up site by slug
  const [site] = await db
    .select({
      id: schema.sites.id,
      businessName: schema.sites.businessName,
      slug: schema.sites.slug,
      published: schema.sites.published,
      briefJson: schema.sites.briefJson,
      websiteJson: schema.sites.websiteJson,
    })
    .from(schema.sites)
    .where(eq(schema.sites.slug, siteSlug))
    .limit(1);

  if (!site) {
    notFound();
  }

  // Only serve published sites
  if (!site.published) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="text-5xl mb-4">🚧</div>
          <h1 className="text-xl font-bold text-white">Coming Soon</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {site.businessName} is not published yet.
          </p>
        </div>
      </div>
    );
  }

  // Parse website data
  const parsedWebsite = generatedWebsiteSchema.safeParse(site.websiteJson);
  const parsedBrief = websiteBriefSchema.safeParse(site.briefJson);

  let website: GeneratedWebsite;

  if (parsedWebsite.success) {
    website = parsedWebsite.data;
  } else if (parsedBrief.success) {
    website = createFallbackWebsiteFromBrief(parsedBrief.data);
  } else {
    notFound();
  }

  const pageSlug = sp.page || "home";
  const selectedProductId = sp.product;

  return (
    <div className="min-h-screen">
      <WebsiteRenderer
        website={website}
        pageSlug={pageSlug}
        siteId={site.id}
        selectedProductId={selectedProductId}
      />
    </div>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;

  const [site] = await db
    .select({
      businessName: schema.sites.businessName,
      websiteJson: schema.sites.websiteJson,
    })
    .from(schema.sites)
    .where(eq(schema.sites.slug, siteSlug))
    .limit(1);

  if (!site) {
    return { title: "Site Not Found" };
  }

  const parsed = generatedWebsiteSchema.safeParse(site.websiteJson);
  const industry = parsed.success ? parsed.data.site.industry : "eCommerce";

  return {
    title: `${site.businessName} — ${industry}`,
    description: `Shop ${site.businessName}'s ${industry.toLowerCase()} collection online.`,
  };
}
