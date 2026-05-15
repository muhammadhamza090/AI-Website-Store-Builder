import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";
import type { GeneratedWebsite } from "@/lib/site-schema";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ siteId: string; productId: string }> };

/**
 * PATCH /api/sites/[siteId]/products/[productId] — Update a product
 * Body: partial product fields (name, price, category, description, sizes, colors, etc.)
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { siteId, productId } = await params;
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
    const productIndex = website?.products?.findIndex((p) => p.id === productId);

    if (productIndex === undefined || productIndex < 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = website.products[productIndex];

    // Merge only provided fields
    const updated = {
      ...existing,
      ...(body.name != null ? { name: body.name } : {}),
      ...(body.category != null ? { category: body.category } : {}),
      ...(body.price != null ? { price: Number(body.price) } : {}),
      ...(body.compareAtPrice !== undefined ? { compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null } : {}),
      ...(body.description != null ? { description: body.description } : {}),
      ...(body.imagePrompt != null ? { imagePrompt: body.imagePrompt } : {}),
      ...(body.badge !== undefined ? { badge: body.badge || null } : {}),
      ...(body.rating !== undefined ? { rating: body.rating ? Number(body.rating) : null } : {}),
      ...(body.reviewCount !== undefined ? { reviewCount: body.reviewCount ? Number(body.reviewCount) : null } : {}),
      ...(body.sizes != null ? { sizes: body.sizes } : {}),
      ...(body.colors != null ? { colors: body.colors } : {}),
      ...(body.variants != null ? { variants: body.variants } : {}),
    };

    website.products[productIndex] = updated;

    await db
      .update(schema.sites)
      .set({ websiteJson: website, updatedAt: new Date() })
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({ product: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sites/[siteId]/products/[productId] — Remove a product
 */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { siteId, productId } = await params;

    const [site] = await db
      .select({ websiteJson: schema.sites.websiteJson })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const productIndex = website?.products?.findIndex((p) => p.id === productId);

    if (productIndex === undefined || productIndex < 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const removed = website.products.splice(productIndex, 1)[0];

    await db
      .update(schema.sites)
      .set({ websiteJson: website, updatedAt: new Date() })
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({ deleted: true, product: removed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
