import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";
import type { GeneratedWebsite } from "@/lib/site-schema";

export const dynamic = "force-dynamic";

/**
 * GET /api/sites/[siteId]/products — List all products
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
    const products = website?.products ?? [];

    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sites/[siteId]/products — Add a new product
 * Body: { name, category, price, description, imagePrompt, ... }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await req.json();

    const name = (body.name || "").trim();
    const category = (body.category || "General").trim();
    const price = Number(body.price);
    const description = (body.description || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Product name must be at least 2 characters" }, { status: 400 });
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
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

    const newProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      category,
      price,
      description: description || `${name} — premium quality product.`,
      imagePrompt: body.imagePrompt || `Product photo of ${name}`,
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      badge: body.badge || null,
      rating: body.rating ? Number(body.rating) : null,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : null,
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      variants: body.variants ?? [],
    };

    const updatedWebsite = {
      ...website,
      products: [...(website.products ?? []), newProduct],
    };

    await db
      .update(schema.sites)
      .set({ websiteJson: updatedWebsite, updatedAt: new Date() })
      .where(eq(schema.sites.id, siteId));

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add product" },
      { status: 500 }
    );
  }
}
