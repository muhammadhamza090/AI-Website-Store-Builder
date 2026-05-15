import { NextResponse } from "next/server";
import { db, schema, desc, eq } from "@/lib/db";

type RouteParams = { params: Promise<{ slug: string }> };

/**
 * GET /api/orgs/[slug] — Get organization details + its sites
 */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const sites = await db
      .select({
        id: schema.sites.id,
        businessName: schema.sites.businessName,
        createdAt: schema.sites.createdAt,
        updatedAt: schema.sites.updatedAt,
      })
      .from(schema.sites)
      .where(eq(schema.sites.orgId, org.id))
      .orderBy(desc(schema.sites.createdAt));

    return NextResponse.json({ organization: org, sites });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[slug] — Update organization name
 * Body: { name: string }
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const [org] = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Organization name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(schema.organizations)
      .set({ name, updatedAt: new Date() })
      .where(eq(schema.organizations.id, org.id))
      .returning();

    return NextResponse.json({ organization: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update organization" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orgs/[slug] — Delete organization and ALL its sites (cascade)
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const [org] = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    await db
      .delete(schema.organizations)
      .where(eq(schema.organizations.id, org.id));

    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete organization" },
      { status: 500 }
    );
  }
}
