import { NextResponse } from "next/server";
import { db, schema, desc } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/orgs — List all organizations with site counts
 */
export async function GET() {
  try {
    const orgs = await db
      .select({
        id: schema.organizations.id,
        name: schema.organizations.name,
        slug: schema.organizations.slug,
        logoUrl: schema.organizations.logoUrl,
        createdAt: schema.organizations.createdAt,
      })
      .from(schema.organizations)
      .orderBy(desc(schema.organizations.createdAt));

    // Get site counts for all orgs
    const orgIds = orgs.map((o) => o.id);
    const siteCounts: Record<string, number> = {};

    if (orgIds.length > 0) {
      const counts = await db
        .select({
          orgId: schema.sites.orgId,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(schema.sites)
        .where(sql`${schema.sites.orgId} IN ${orgIds}`)
        .groupBy(schema.sites.orgId);

      for (const row of counts) {
        if (row.orgId) siteCounts[row.orgId] = row.count;
      }
    }

    const result = orgs.map((o) => ({
      ...o,
      siteCount: siteCounts[o.id] ?? 0,
    }));

    return NextResponse.json({ organizations: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orgs — Create a new organization
 * Body: { name: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Organization name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists
    const existing = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Organization "${name}" already exists` },
        { status: 409 }
      );
    }

    const [org] = await db
      .insert(schema.organizations)
      .values({ name, slug })
      .returning();

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create organization" },
      { status: 500 }
    );
  }
}
