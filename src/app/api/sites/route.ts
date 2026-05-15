import { NextResponse } from "next/server";
import { db, desc, schema } from "@/lib/db";

export async function GET() {
  try {
    const sites = await db
      .select({
        id: schema.sites.id,
        businessName: schema.sites.businessName,
        createdAt: schema.sites.createdAt,
        updatedAt: schema.sites.updatedAt
      })
      .from(schema.sites)
      .orderBy(desc(schema.sites.createdAt));

    return NextResponse.json({ sites });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ sites: [], error: message }, { status: 200 });
  }
}
