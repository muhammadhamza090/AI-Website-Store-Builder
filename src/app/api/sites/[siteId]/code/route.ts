import { NextResponse } from "next/server";
import { db, eq, schema } from "@/lib/db";
import { generateCodeBundle } from "@/lib/codegen";
import type { GeneratedWebsite } from "@/lib/site-schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const [site] = await db
      .select({
        businessName: schema.sites.businessName,
        websiteJson: schema.sites.websiteJson
      })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const website = site.websiteJson as unknown as GeneratedWebsite;
    const bundle = generateCodeBundle(website);
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");
    const shouldDownload = searchParams.get("download") === "1";

    if (!file) {
      return NextResponse.json({ businessName: site.businessName, files: bundle.files });
    }

    const selected = bundle.files.find((candidate) => candidate.filename === file);
    if (!selected) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const contentType = getContentType(selected.language);
    return new NextResponse(selected.content, {
      headers: {
        "Content-Type": contentType,
        ...(shouldDownload
          ? {
              "Content-Disposition": `attachment; filename="${selected.filename}"`
            }
          : {})
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getContentType(language: string) {
  switch (language) {
    case "html":
      return "text/html; charset=utf-8";
    case "css":
      return "text/css; charset=utf-8";
    case "json":
      return "application/json; charset=utf-8";
    case "markdown":
      return "text/markdown; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
}
