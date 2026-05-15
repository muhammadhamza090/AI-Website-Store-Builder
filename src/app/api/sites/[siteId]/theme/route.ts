import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";
import type { GeneratedWebsite } from "@/lib/site-schema";

export const dynamic = "force-dynamic";

/**
 * GET /api/sites/[siteId]/theme — Get theme settings
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

    return NextResponse.json({
      theme: {
        businessName: website?.site?.businessName ?? "",
        industry: website?.site?.industry ?? "",
        layoutStyle: website?.site?.layoutStyle ?? "",
        colorPalette: website?.site?.colorPalette ?? {},
        typography: website?.site?.typography ?? {},
        generationStyle: website?.meta?.generationStyle ?? "",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sites/[siteId]/theme — Update theme settings
 * Body: { colorPalette?, typography?, layoutStyle?, businessName?, industry? }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await req.json();

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson, businessName: schema.sites.businessName })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;

    // Update color palette
    if (body.colorPalette) {
      website.site.colorPalette = {
        ...website.site.colorPalette,
        ...body.colorPalette,
      };
    }

    // Update typography
    if (body.typography) {
      website.site.typography = {
        ...website.site.typography,
        ...body.typography,
      };
    }

    // Update layout style
    if (body.layoutStyle != null) {
      website.site.layoutStyle = body.layoutStyle;
    }

    // Update business name (also update the sites.business_name column)
    if (body.businessName != null) {
      website.site.businessName = body.businessName;
    }

    // Update industry
    if (body.industry != null) {
      website.site.industry = body.industry;
    }

    // Update meta
    if (body.generationStyle != null) {
      if (!website.meta) website.meta = {};
      website.meta.generationStyle = body.generationStyle;
    }

    const updateFields: Record<string, unknown> = {
      websiteJson: website,
      updatedAt: new Date(),
    };

    // Keep business_name column in sync
    if (body.businessName != null) {
      updateFields.businessName = body.businessName;
    }

    await db
      .update(schema.sites)
      .set(updateFields)
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({
      theme: {
        businessName: website.site.businessName,
        industry: website.site.industry,
        layoutStyle: website.site.layoutStyle,
        colorPalette: website.site.colorPalette,
        typography: website.site.typography,
        generationStyle: website.meta?.generationStyle ?? "",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update theme" },
      { status: 500 }
    );
  }
}
