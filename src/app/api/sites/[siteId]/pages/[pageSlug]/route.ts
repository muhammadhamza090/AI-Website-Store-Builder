import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";
import type { GeneratedWebsite } from "@/lib/site-schema";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ siteId: string; pageSlug: string }> };

/**
 * GET /api/sites/[siteId]/pages/[pageSlug] — Get single page with sections
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { siteId, pageSlug } = await params;

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const page = website?.site?.pages?.find((p) => p.slug === pageSlug);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch page" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sites/[siteId]/pages/[pageSlug] — Update page
 * Body: { title?, sections?, type? }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { siteId, pageSlug } = await params;
    const body = await req.json();

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const pageIndex = website?.site?.pages?.findIndex((p) => p.slug === pageSlug);

    if (pageIndex === undefined || pageIndex < 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const existing = website.site.pages[pageIndex];
    const updated = {
      ...existing,
      ...(body.title != null ? { title: body.title } : {}),
      ...(body.type != null ? { type: body.type } : {}),
      ...(body.sections != null ? { sections: body.sections } : {}),
    };

    website.site.pages[pageIndex] = updated;

    await db
      .update(schema.sites)
      .set({ websiteJson: website, updatedAt: new Date() })
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({ page: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update page" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sites/[siteId]/pages/[pageSlug] — Remove page
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { siteId, pageSlug } = await params;

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const pageIndex = website?.site?.pages?.findIndex((p) => p.slug === pageSlug);

    if (pageIndex === undefined || pageIndex < 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const removed = website.site.pages.splice(pageIndex, 1)[0];

    await db
      .update(schema.sites)
      .set({ websiteJson: website, updatedAt: new Date() })
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({ deleted: true, page: removed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete page" },
      { status: 500 }
    );
  }
}
