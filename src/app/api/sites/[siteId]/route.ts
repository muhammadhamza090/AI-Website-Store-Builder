import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const [site] = await db
      .select({
        id: schema.sites.id,
        businessName: schema.sites.businessName,
        slug: schema.sites.slug,
        published: schema.sites.published,
        customDomain: schema.sites.customDomain,
        briefJson: schema.sites.briefJson,
        websiteJson: schema.sites.websiteJson,
        createdAt: schema.sites.createdAt,
        updatedAt: schema.sites.updatedAt
      })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/sites/[siteId] — Update site settings
 * Body: { slug?, published?, customDomain?, businessName? }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await req.json();

    const [site] = await db
      .select({ id: schema.sites.id })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.slug != null) {
      const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      if (slug.length < 2) {
        return NextResponse.json({ error: "Slug must be at least 2 characters" }, { status: 400 });
      }
      updateFields.slug = slug;
    }

    if (body.published != null) {
      updateFields.published = Boolean(body.published);
    }

    if (body.customDomain !== undefined) {
      updateFields.customDomain = body.customDomain || null;
    }

    if (body.businessName != null) {
      updateFields.businessName = body.businessName;
    }

    const [updated] = await db
      .update(schema.sites)
      .set(updateFields)
      .where(eq(schema.sites.id, siteId))
      .returning();

    return NextResponse.json({ site: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

