import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";
import type { GeneratedWebsite } from "@/lib/site-schema";

export const dynamic = "force-dynamic";

/**
 * GET /api/sites/[siteId]/pages — List all pages
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const pages = website?.site?.pages ?? [];

    return NextResponse.json({
      pages: pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        sectionCount: p.sections?.length ?? 0,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sites/[siteId]/pages — Add a new page
 * Body: { slug: string, title: string, type: string, sections?: Section[] }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await req.json();

    const slug = (body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const title = (body.title || "").trim();
    const type = (body.type || "custom").trim();

    if (!slug || slug.length < 2) {
      return NextResponse.json({ error: "Page slug must be at least 2 characters" }, { status: 400 });
    }
    if (!title || title.length < 2) {
      return NextResponse.json({ error: "Page title must be at least 2 characters" }, { status: 400 });
    }

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const pages = website?.site?.pages ?? [];

    if (pages.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: `Page "${slug}" already exists` }, { status: 409 });
    }

    const newPage = {
      id: `page_${slug}_${Date.now()}`,
      slug,
      title,
      type,
      sections: body.sections ?? [],
    };

    const updatedWebsite = {
      ...website,
      site: {
        ...website.site,
        pages: [...pages, newPage],
      },
    };

    await db
      .update(schema.sites)
      .set({ websiteJson: updatedWebsite, updatedAt: new Date() })
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({ page: newPage }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add page" },
      { status: 500 }
    );
  }
}
