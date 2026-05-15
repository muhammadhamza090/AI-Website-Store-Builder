import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db, eq, schema } from "@/lib/db";
import { generateCodeBundle } from "@/lib/codegen";
import { createFallbackWebsiteFromBrief } from "@/lib/fallback-site";
import { generatedWebsiteSchema, type GeneratedWebsite } from "@/lib/site-schema";
import { websiteBriefSchema } from "@/lib/validation";
import { WebsiteRenderer } from "@/components/preview/WebsiteRenderer";
import { LocalSitePreview } from "@/components/preview/LocalSitePreview";
import { HtmlPreviewIframe } from "@/components/preview/HtmlPreviewIframe";

export default async function PreviewPage({
  params,
  searchParams
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ page?: string; view?: string; file?: string; product?: string }>;
}) {
  const { siteId } = await params;
  const sp = await searchParams;

  // ── Local (unsaved) site — serve client-side via sessionStorage ──────────────
  if (siteId.startsWith("local_")) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-800">AI-Generated Website</div>
              <div className="text-xs text-zinc-400">Session preview — not saved to database</div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/generate">Generate new</Link>
              </Button>
            </div>
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="border-amber-300 text-amber-700">Session only</Badge>
            <Badge variant="secondary">AI-generated HTML</Badge>
          </div>
          <LocalSitePreview siteId={siteId} />
        </main>
      </div>
    );
  }

  // ── Saved site — load from DB ────────────────────────────────────────────────
  let site: {
    id: string;
    businessName: string;
    briefJson: unknown;
    websiteJson: unknown;
    generatedHtml: string | null;
    createdAt: Date;
  } | null = null;

  try {
    const [row] = await db
      .select({
        id: schema.sites.id,
        businessName: schema.sites.businessName,
        briefJson: schema.sites.briefJson,
        websiteJson: schema.sites.websiteJson,
        generatedHtml: schema.sites.generatedHtml,
        createdAt: schema.sites.createdAt
      })
      .from(schema.sites)
      .where(eq(schema.sites.id, siteId))
      .limit(1);

    site = row ?? null;
  } catch (err) {
    console.error("DB error loading site:", err);
  }

  if (!site) {
    notFound();
  }

  const parsedWebsite = generatedWebsiteSchema.safeParse(site.websiteJson);
  const parsedBrief = websiteBriefSchema.safeParse(site.briefJson);
  const website: GeneratedWebsite = parsedWebsite.success
    ? parsedWebsite.data
    : parsedBrief.success
      ? createFallbackWebsiteFromBrief(parsedBrief.data)
      : {
          site: {
            id: site.id,
            businessName: site.businessName || "Recovered preview",
            industry: "Ecommerce",
            layoutStyle: "minimal premium layout",
            colorPalette: {
              primary: "#4F46E5",
              secondary: "#EEF2FF",
              accent: "#EC4899",
              background: "#FFFFFF",
              text: "#111827"
            },
            typography: {
              headingFont: "Modern Sans",
              bodyFont: "Modern Sans",
              style: "clean sans"
            },
            pages: [
              {
                id: "home_recovered",
                slug: "home",
                title: "Recovered preview",
                type: "home",
                sections: [
                  {
                    id: "hero_recovered",
                    type: "hero",
                    title: "Recovered website preview",
                    subtitle:
                      "The saved website data was incomplete, so a safe preview was generated.",
                    cta: { label: "Generate again", href: "/generate" },
                    items: []
                  }
                ]
              }
            ]
          },
          products: [
            {
              id: "product_recovered",
              name: "Recovered product",
              category: "General",
              price: 49,
              description: "Fallback preview product.",
              imagePrompt: "Minimal ecommerce product card",
              sizes: [{ label: "S", priceDelta: 0 }, { label: "M", priceDelta: 0 }, { label: "L", priceDelta: 5 }],
              colors: [{ name: "Default", hex: "#4F46E5", priceDelta: 0 }],
              variants: []
            }
          ],
          meta: {
            generationStyle: "recovered preview",
            notes: "Recovered from invalid saved website JSON."
          }
        };

  // If AI-generated HTML exists, show that as the code. Otherwise fall back to codegen bundle.
  const bundle = site.generatedHtml
    ? {
        files: [
          { filename: "index.html", language: "html", content: site.generatedHtml },
          { filename: "site-data.json", language: "json", content: JSON.stringify(website, null, 2) },
          { filename: "README.md", language: "markdown", content: `# ${website.site.businessName}\n\nThis website was generated by AI. The index.html is a complete, standalone site.\n\n## How to use\n\n1. Open index.html in any browser\n2. All CSS and JS are embedded — no build step needed\n` }
        ]
      }
    : generateCodeBundle(website);
  const businessName = site.businessName || website?.site?.businessName || "Preview";
  const pageSlug = sp.page ?? "home";
  const selectedProductId = sp.product;
  const view = sp.view === "code" ? "code" : "design";
  const selectedFile =
    bundle.files.find((file) => file.filename === sp.file) ?? bundle.files[0];
  const usedRecoveredPreview = !parsedWebsite.success;
  const hasGeneratedHtml = Boolean(site.generatedHtml);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Unified header bar */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{businessName}</div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              {hasGeneratedHtml && (
                <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] px-2 py-0.5">
                  AI-Generated
                </Badge>
              )}
              {usedRecoveredPreview && <Badge variant="outline" className="text-[11px] px-2 py-0.5">Recovered</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={view === "design" ? "default" : "secondary"} asChild>
              <Link href={`/preview/${siteId}?view=design`}>Design</Link>
            </Button>
            <Button size="sm" variant={view === "code" ? "default" : "secondary"} asChild>
              <Link
                href={`/preview/${siteId}?view=code&file=${encodeURIComponent(selectedFile.filename)}`}
              >
                Code
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard">← Back</Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* Design view */}
        {view === "design" ? (
          <>
            {usedRecoveredPreview && !hasGeneratedHtml && (
              <Card className="mb-4 border-amber-200 bg-amber-50">
                <CardContent className="p-4 text-sm text-amber-900">
                  The saved website JSON was incomplete, so this preview was rebuilt from the brief.
                </CardContent>
              </Card>
            )}

            {hasGeneratedHtml ? (
              /* ── AI-generated HTML iframe ─────────────────────────────── */
              <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="rounded-md border border-zinc-200 bg-white px-3 py-0.5 text-[11px] text-zinc-400">
                    {businessName}
                  </div>
                  <div />
                </div>
                <HtmlPreviewIframe
                  html={site.generatedHtml ?? ""}
                  businessName={businessName}
                />
              </div>
            ) : (
              /* ── Legacy JSON renderer ─────────────────────────────────── */
              <>
                <div className="mb-3 flex items-center justify-between gap-3 px-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <span>Live storefront preview</span>
                  <span>Current page: {pageSlug.replace(/_/g, " ")}</span>
                </div>
                <WebsiteRenderer
                  website={website}
                  pageSlug={pageSlug}
                  siteId={siteId}
                  selectedProductId={selectedProductId}
                />
              </>
            )}
          </>
        ) : (
          /* ── Code view ────────────────────────────────────────────────── */
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <Card className="border-zinc-200">
              <CardContent className="p-3">
                <div className="mb-3 text-sm font-medium text-zinc-900">Generated files</div>
                <div className="flex flex-col gap-2">
                  {bundle.files.map((file) => (
                    <Link
                      key={file.filename}
                      href={`/preview/${siteId}?view=code&file=${encodeURIComponent(file.filename)}`}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        file.filename === selectedFile.filename
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="font-medium">{file.filename}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] opacity-70">
                        {file.language}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                  <div>
                    <div className="text-sm font-medium">{selectedFile.filename}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {selectedFile.language}
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link
                      href={`/api/sites/${siteId}/code?file=${encodeURIComponent(selectedFile.filename)}&download=1`}
                    >
                      Download
                    </Link>
                  </Button>
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-6 text-zinc-800">
                  <code>{selectedFile.content}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-4 text-xs text-zinc-500">
          Generated on {new Date(site.createdAt).toLocaleString()} •{" "}
          {hasGeneratedHtml
            ? "This site was built by Claude — unique HTML, CSS & JS generated by AI."
            : "Design view shows the rendered storefront. Code view shows downloadable files."}
        </div>
      </main>
    </div>
  );
}
