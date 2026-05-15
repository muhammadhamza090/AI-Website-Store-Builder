import { NextResponse } from "next/server";
import { websiteBriefSchema } from "@/lib/validation";
import { db, desc, schema } from "@/lib/db";
import { runEcommerceGraph } from "@/ai/graph/ecommerceGraph";
import { generatedWebsiteSchema, type GeneratedWebsite } from "@/lib/site-schema";
import type { ValidationResult } from "@/ai/graph/state";
import {
  createDesignVariant,
  type DesignVariant,
  type RecentStyleRecord
} from "@/lib/design-variant";
import { createFallbackWebsiteFromBrief } from "@/lib/fallback-site";
import { callClaudeStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";


// Tell Next.js this route can run for up to 15 minutes (AI graph + HTML generation + DB save)
export const maxDuration = 900;

const GRAPH_TIMEOUT_MS = Number(process.env.AI_GRAPH_TIMEOUT_MS ?? 480_000);


export async function POST(req: Request) {
  const startedAt = Date.now();
  const streamMode = new URL(req.url).searchParams.get("stream") === "1";

  if (streamMode) {
    return streamGeneration(req, startedAt);
  }

  try {
    const body = await req.json();
    const parsed = websiteBriefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid brief", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const logs: Array<{
      nodeName: string;
      status: "start" | "success" | "error";
      data?: unknown;
    }> = [];
    const recentStyles = await loadRecentStyles();
    const designVariant = createDesignVariant({
      brief: parsed.data,
      recentStyles
    });
    logs.push({
      nodeName: "designVariant",
      status: "success",
      data: {
        ...designVariant,
        recentStylesConsidered: recentStyles.length
      }
    });

    const result = await generateWithFallback(parsed.data, designVariant, logs);

    const durationMs = Date.now() - startedAt;
    const orgId = (body.orgId as string) || null;

    try {
      const [site] = await db.insert(schema.sites).values({
        orgId,
        businessName: parsed.data.businessName,
        briefJson: parsed.data,
        websiteJson: result.website ?? {},
        generatedHtml: result.generatedHTML ?? null,
      }).returning({ id: schema.sites.id });

      if (site && logs.length > 0) {
        await db.insert(schema.generationLogs).values(
          logs.map((l) => ({
            siteId: site.id,
            nodeName: l.nodeName,
            status: l.status,
            inputJson: l.status === "start" ? { brief: parsed.data } : undefined,
            outputJson: l.status === "success" && l.data != null ? l.data : undefined,
            error: l.status === "error" ? JSON.stringify(l.data ?? {}) : undefined
          }))
        );
      }

      return NextResponse.json({
        siteId: site!.id,
        website: result.website,
        generatedHtml: result.generatedHTML ?? null,
        validation: result.validation ?? null,
        pipeline: result.pipeline,
        durationMs,
        savedToDb: true,
        generationMode: result.generationMode
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Database error";
      // Return the generated website anyway so the user can preview it even before DB setup.
      return NextResponse.json({
        siteId: `local_${Date.now()}`,
        website: result.website,
        generatedHtml: result.generatedHTML ?? null,
        validation: result.validation ?? null,
        pipeline: result.pipeline,
        durationMs,
        savedToDb: false,
        dbError: message,
        generationMode: result.generationMode
      });
    }
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", message, durationMs },
      { status: 500 }
    );
  }
}

async function streamGeneration(req: Request, startedAt: number) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  let streamClosed = false;
  const writeEvent = async (payload: Record<string, unknown>) => {
    if (streamClosed) return;
    try {
      await writer.write(encoder.encode(`${JSON.stringify(payload)}\n`));
    } catch {
      streamClosed = true; // Client disconnected — stop writing silently
    }
  };

  (async () => {
    try {
      const body = await req.json();
      const parsed = websiteBriefSchema.safeParse(body);
      if (!parsed.success) {
        await writeEvent({
          type: "error",
          message: parsed.error.issues[0]?.message ?? "Invalid input"
        });
        return;
      }

      const orgId = (body.orgId as string) || null;

      const response = await executeGeneration(parsed.data, startedAt, orgId, async (entry) => {
        await writeEvent({
          type: "stage",
          ...entry
        });
      });

      await writeEvent({
        type: "result",
        ...response
      });
    } catch (err) {
      await writeEvent({
        type: "error",
        message: err instanceof Error ? err.message : "Generation failed"
      });
    } finally {
      try {
        if (!streamClosed) await writer.close();
      } catch {
        // Already closed — ignore
      }
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function executeGeneration(
  brief: ReturnType<typeof websiteBriefSchema.parse>,
  startedAt: number,
  orgId: string | null,
  emit?: (entry: { nodeName: string; status: "start" | "success" | "error"; data?: unknown }) => Promise<void>
) {
  const logs: Array<{
    nodeName: string;
    status: "start" | "success" | "error";
    data?: unknown;
  }> = [];
  const recentStyles = await loadRecentStyles();
  const designVariant = createDesignVariant({
    brief,
    recentStyles
  });
  const designVariantEntry = {
    nodeName: "designVariant",
    status: "success" as const,
    data: {
      ...designVariant,
      recentStylesConsidered: recentStyles.length
    }
  };
  logs.push(designVariantEntry);
  if (emit) {
    await emit(designVariantEntry);
  }

  const result = await generateWithFallback(brief, designVariant, logs, emit);
  const durationMs = Date.now() - startedAt;

  try {
    if (emit) {
      await emit({ nodeName: "saveWebsite", status: "start" });
    }

    const [site] = await db.insert(schema.sites).values({
      orgId,
      businessName: brief.businessName,
      briefJson: brief,
      websiteJson: result.website ?? {},
      generatedHtml: result.generatedHTML ?? null,
    }).returning({ id: schema.sites.id });

    if (site && logs.length > 0) {
      await db.insert(schema.generationLogs).values(
        logs.map((l) => ({
          siteId: site.id,
          nodeName: l.nodeName,
          status: l.status,
          inputJson: l.status === "start" ? { brief } : undefined,
          outputJson: l.status === "success" && l.data != null ? l.data : undefined,
          error: l.status === "error" ? JSON.stringify(l.data ?? {}) : undefined
        }))
      );
    }

    if (emit) {
      await emit({ nodeName: "saveWebsite", status: "success", data: { siteId: site!.id } });
    }

    return {
      siteId: site!.id,
      website: result.website,
      generatedHTML: result.generatedHTML,
      validation: result.validation ?? null,
      pipeline: result.pipeline,
      durationMs,
      savedToDb: true,
      generationMode: result.generationMode
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";

    if (emit) {
      await emit({ nodeName: "saveWebsite", status: "error", data: { message } });
    }

    return {
      siteId: `local_${Date.now()}`,
      website: result.website,
      generatedHTML: result.generatedHTML,
      validation: result.validation ?? null,
      pipeline: result.pipeline,
      durationMs,
      savedToDb: false,
      dbError: message,
      generationMode: result.generationMode
    };
  }
}

async function loadRecentStyles(): Promise<RecentStyleRecord[]> {
  try {
    const recentSites = await db
      .select({
        createdAt: schema.sites.createdAt,
        websiteJson: schema.sites.websiteJson
      })
      .from(schema.sites)
      .orderBy(desc(schema.sites.createdAt))
      .limit(40);

    const recentStyles: RecentStyleRecord[] = [];

    for (const site of recentSites) {
      const parsed = generatedWebsiteSchema.safeParse(site.websiteJson);
      if (!parsed.success) continue;

      recentStyles.push({
        createdAt: site.createdAt,
        layoutStyle: parsed.data.site.layoutStyle,
        generationStyle: parsed.data.meta?.generationStyle ?? null,
        notes: parsed.data.meta?.notes ?? null
      });
    }

    return recentStyles;
  } catch {
    return [];
  }
}


async function generateWithFallback(
  brief: ReturnType<typeof websiteBriefSchema.parse>,
  designVariant: DesignVariant,
  logs: Array<{ nodeName: string; status: "start" | "success" | "error"; data?: unknown }>,
  emit?: (entry: { nodeName: string; status: "start" | "success" | "error"; data?: unknown }) => Promise<void>
): Promise<{
  website: GeneratedWebsite;
  generatedHTML?: string;
  validation: ValidationResult | null;
  errors: string[];
  generationMode: "ai" | "fallback";
  pipeline: Record<string, unknown>;
}> {
  try {
    const aiResult = await Promise.race([
      runEcommerceGraph({
        brief,
        designVariant,
        logger: (entry) => {
          logs.push(entry);
          void emit?.(entry);
        }
      }),
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error(`AI generation timed out after ${GRAPH_TIMEOUT_MS}ms`)), GRAPH_TIMEOUT_MS)
      )
    ]);

    // ── HTML-first path (primary) ─────────────────────────────────────────────
    if (aiResult.generatedHTML) {
      return {
        website: aiResult.website ?? ({} as GeneratedWebsite),
        generatedHTML: aiResult.generatedHTML,
        validation: aiResult.validation ?? null,
        errors: aiResult.errors ?? [],
        generationMode: "ai" as const,
        pipeline: buildPipelineSummary({ designVariant, aiResult, website: aiResult.website ?? ({} as GeneratedWebsite), validation: aiResult.validation ?? null })
      };
    }

    // ── Legacy JSON path — still generate HTML from it ─────────────────────────
    if (aiResult.website) {
      const finalized = ensureValidWebsite({
        candidate: aiResult.website,
        brief,
        designVariant,
        logs,
        reason: "AI output failed final website schema validation"
      });

      // Generate standalone HTML from the fallback JSON so we still show unique design
      const html = await generateFallbackHTML(brief, designVariant, finalized.website);

      return {
        website: finalized.website,
        generatedHTML: html ?? undefined,
        validation: aiResult.validation ?? null,
        errors: finalized.usedFallback
          ? [...(aiResult.errors ?? []), "AI output failed final website schema validation"]
          : (aiResult.errors ?? []),
        generationMode: finalized.usedFallback ? "fallback" : ("ai" as const),
        pipeline: buildPipelineSummary({
          designVariant,
          aiResult,
          website: finalized.website,
          validation: aiResult.validation ?? null
        })
      };
    }

    const message =
      aiResult.errors && aiResult.errors.length > 0
        ? aiResult.errors.join(" | ")
        : "AI generation did not produce a website";

    logs.push({
      nodeName: "fallbackGenerator",
      status: "success",
      data: { reason: message }
    });
    if (emit) {
      await emit({
        nodeName: "fallbackGenerator",
        status: "success",
        data: { reason: message }
      });
    }

    const fallbackWebsite = createFallbackWebsiteFromBrief(brief, designVariant);
    // Generate standalone HTML for fallback too
    const html = await generateFallbackHTML(brief, designVariant, fallbackWebsite);

    return {
      website: fallbackWebsite,
      generatedHTML: html ?? undefined,
      validation: {
        ok: true,
        errors: [],
        warnings: [`Fallback generation used: ${message}`]
      },
      errors: aiResult.errors ?? [message],
      generationMode: "fallback" as const,
      pipeline: buildPipelineSummary({
        designVariant,
        aiResult,
        website: fallbackWebsite,
        validation: {
          ok: true,
          errors: [],
          warnings: [`Fallback generation used: ${message}`]
        }
      })
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    console.error("[generateWithFallback] AI pipeline failed:", message);

    logs.push({
      nodeName: "fallbackGenerator",
      status: "success",
      data: { reason: message }
    });
    if (emit) {
      await emit({
        nodeName: "fallbackGenerator",
        status: "success",
        data: { reason: message }
      });
    }

    const fallbackWebsite = createFallbackWebsiteFromBrief(brief, designVariant);
    // Generate standalone HTML for fallback too
    const html = await generateFallbackHTML(brief, designVariant, fallbackWebsite);

    return {
      website: fallbackWebsite,
      generatedHTML: html ?? undefined,
      validation: {
        ok: true,
        errors: [],
        warnings: [`Fallback generation used: ${message}`]
      },
      errors: [message],
      generationMode: "fallback" as const,
      pipeline: buildPipelineSummary({
        designVariant,
        website: fallbackWebsite,
        validation: {
          ok: true,
          errors: [],
          warnings: [`Fallback generation used: ${message}`]
        }
      })
    };
  }
}

/**
 * Emergency HTML generator — called when the main pipeline fails or produces only JSON.
 * Uses Claude to generate a complete unique HTML site from the brief + design variant directly.
 * This ensures the user ALWAYS gets a unique, AI-generated HTML site — never the template JSON renderer.
 */
async function generateFallbackHTML(
  brief: ReturnType<typeof websiteBriefSchema.parse>,
  designVariant: DesignVariant,
  website: GeneratedWebsite
): Promise<string | null> {
  try {
    const client = getClaudeClient();
    const model = getClaudeModel();

    const products = website.products.slice(0, 8).map(
      (p, i) => {
        const sizesStr = p.sizes?.length
          ? ` | Sizes: ${p.sizes.map(s => typeof s === 'string' ? s : `${s.label}${s.priceDelta ? `(+$${s.priceDelta})` : ''}`).join(', ')}`
          : '';
        const colorsStr = p.colors?.length
          ? ` | Colors: ${p.colors.map(c => `${c.name}(${c.hex})${c.priceDelta ? `+$${c.priceDelta}` : ''}`).join(', ')}`
          : '';
        const compareStr = p.compareAtPrice ? ` (was $${p.compareAtPrice})` : '';
        return `${i + 1}. ${p.name} — $${p.price}${compareStr} (${p.category}): ${p.description.slice(0, 60)}${sizesStr}${colorsStr}`;
      }
    ).join("\n");

    const prompt = `Generate a COMPLETE, STANDALONE, UNIQUE ecommerce website as a single HTML file.

BUSINESS: ${brief.businessName} — ${brief.industry}
Audience: ${brief.targetAudience}
Brand tone: ${brief.brandTone}
Style: ${brief.preferredStyle}
Colors: ${brief.preferredColors ?? "your choice"}
Type: ${brief.ecommerceType}
Products: ${brief.productsOrServices}

CREATIVE DIRECTION (make it unique):
  Layout: ${designVariant.layoutBias}
  Colors: ${designVariant.paletteBias}
  Hero: ${designVariant.heroApproach}
  Typography: ${designVariant.typographyApproach}
  Products: ${designVariant.productPresentation}
  Navigation: ${designVariant.navigationApproach}
  Buttons: ${designVariant.buttonApproach}
  Mood: ${designVariant.sectionMood}

PRODUCT DATA (include ALL sizes and colors in the JS PRODUCTS array):
${products}

REQUIREMENTS:
1. Single self-contained HTML file with embedded CSS and JS
2. Use Google Fonts (load via <link>)
3. 7 pages: home, shop, product, cart, checkout, about, contact (JS show/hide navigation)
4. Full cart with localStorage — cart items must store selected size + color
5. Beautiful, UNIQUE, PREMIUM design — feels like a top-tier Shopify theme, NOT a generic template
6. Hero must be dramatic and full-viewport with gradient overlay and large bold typography
7. Product cards with CSS gradient images, star ratings (★★★★☆), badges, and compareAtPrice strikethrough
8. FULLY RESPONSIVE — must work on mobile (375px), tablet (768px), desktop (1440px)
9. MANDATORY: Write @media queries for 3 breakpoints (480px, 768px, 1024px)
10. Mobile: hamburger menu, single-column layouts, touch-friendly 44px buttons
11. Tablet: 2-column product grids, adjusted spacing
12. Use clamp() for typography: font-size:clamp(2rem,5vw,4rem)
13. No horizontal scroll — overflow-x:hidden if needed
14. Scroll-based nav with glassmorphism effect (backdrop-filter:blur)
15. Min 16000 characters
16. CSS animations on hero and cards + micro-interactions on hover

═══ MODERN DESIGN (CRITICAL — MUST FEEL 2025 PREMIUM) ═══
- Use glassmorphism on nav (backdrop-filter:blur(20px), semi-transparent bg)
- Layered box-shadows for depth (0 4px 6px -1px rgba(0,0,0,.1), 0 20px 40px -8px rgba(0,0,0,.15))
- Gradient text on hero heading (-webkit-background-clip:text)
- Card hover effects: translateY(-8px) + enhanced shadow + scale(1.02)
- Button hover: gradient shift + glow shadow
- Smooth transitions: cubic-bezier(0.4,0,0.2,1) on everything interactive
- Rich product gradients: 3+ color stops, angled (135deg/45deg)
- Section dividers: clip-path or angled pseudo-elements between sections
- letter-spacing on headings and nav for elegance
- Alternating section backgrounds for visual rhythm

═══ SHOPIFY-QUALITY PRODUCT PAGE (CRITICAL) ═══
17. Product detail page MUST have:
    - SIZE SELECTOR: styled <select> dropdown OR clickable button group showing all sizes from product data
      Sizes that cost more must show "+$X" label (e.g., "XL (+$5)")
    - COLOR SELECTOR: clickable color swatches (circles/squares, min 28px) using actual hex codes as background-color, with ring/border on selected swatch
      Premium colors show "+$X" (e.g., "Rose Gold (+$10)")
    - Color name text that updates when a swatch is clicked
    - Star rating display (★★★★☆) with review count
    - LIVE PRICE UPDATE: price MUST change in real-time when size/color changes!
      Formula: displayedPrice = basePrice + selectedSizePriceDelta + selectedColorPriceDelta
      e.g., Base $49.99 + XL(+$5) + Rose Gold(+$10) = $64.99
    - Price with compareAtPrice strikethrough + "Save X%" badge
    - Stock status indicator ("In Stock" green badge)
    - Quantity selector with styled [-] [qty] [+] buttons
    - "Add to Cart — $XX.XX" button that shows the CURRENT calculated price
18. CART PAGE — MUST handle EMPTY state:
    - If cart is EMPTY: show large 🛒 icon (60px), "Your cart is empty" heading, "Continue Shopping" button
    - If cart has items: show items with variant text ("Size: XL (+$5) · Color: Rose Gold (+$10)"), qty controls, remove buttons, subtotal/shipping/total, "Checkout" button
19. Each PRODUCTS[] entry in JS must include: sizes:[{label,priceDelta}], colors:[{name,hex,priceDelta}], compareAtPrice, rating, reviewCount

FORBIDDEN: centered-text-on-white hero, plain Bootstrap/template look, generic blue buttons, non-responsive layouts, browser-default select dropdowns without styling, product pages without size/color selectors, static prices that don't change when variants are selected, empty/broken cart page with no content, flat boring shadows, generic-looking nav bars, OVERLAPPING TEXT/ELEMENTS — hero stats and CTA buttons MUST be in separate rows with clear spacing (use flexbox with gap, NEVER position:absolute for stats that overlap buttons).

Return ONLY the HTML. No markdown fences. Start with <!DOCTYPE html>.`;

    let html = await callClaudeStreaming({
      client,
      model,
      max_tokens: 64000,
      temperature: 1.0,
      system: "You are a world-class frontend engineer. Generate a complete, unique, STUNNING ecommerce website as a single HTML file. The design must feel PREMIUM and MODERN — use glassmorphism, gradient text, layered shadows, micro-animations, and smooth transitions. Think top-tier Shopify theme, not a basic template. Write concise CSS (under 600 lines). ALWAYS include <body> content.",
      messages: [{ role: "user", content: prompt }]
    });

    html = html.trim();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    if (!html.toLowerCase().startsWith("<!doctype") && !html.toLowerCase().startsWith("<html")) {
      const start = html.toLowerCase().indexOf("<!doctype");
      if (start !== -1) html = html.slice(start);
    }

    // Accept any substantial HTML that looks like a document
    const lowerHtml = html.toLowerCase();
    const looksLikeHtml = lowerHtml.includes("<body") || lowerHtml.includes("<html") || lowerHtml.includes("<!doctype") || lowerHtml.includes("<head");
    if (looksLikeHtml && html.length > 3000) {
      console.log(`[generateFallbackHTML] Generated ${html.length} chars of fallback HTML`);
      return html;
    }

    console.warn(`[generateFallbackHTML] Fallback HTML rejected — length: ${html.length}, looksLikeHtml: ${looksLikeHtml}`);
    return null;
  } catch (err) {
    console.error("[generateFallbackHTML] Failed:", err instanceof Error ? err.message : err);
    return null;
  }
}


function buildPipelineSummary(args: {
  designVariant: DesignVariant;
  aiResult?: Record<string, unknown>;
  website: GeneratedWebsite;
  validation: ValidationResult | null;
}) {
  return {
    stage1: {
      name: "business-analysis",
      businessAnalysis: args.aiResult?.businessAnalysis ?? null
    },
    stage2: {
      name: "store-strategy",
      strategy: args.aiResult?.strategy ?? null
    },
    stage3: {
      name: "sitemap-and-page-plan",
      sitemap: args.aiResult?.sitemap ?? null,
      pagePlans: args.aiResult?.pagePlans ?? null
    },
    stage4: {
      name: "content-and-products",
      content: args.aiResult?.content ?? null,
      products: args.aiResult?.products ?? null
    },
    stage5: {
      name: "design-system",
      designVariant: args.designVariant,
      designSystem: args.aiResult?.designSystem ?? null
    },
    stage6: {
      name: "website-build",
      website: args.website
    },
    stage7: {
      name: "professional-validation",
      validation: args.validation
    }
  };
}

function ensureValidWebsite(args: {
  candidate: unknown;
  brief: ReturnType<typeof websiteBriefSchema.parse>;
  designVariant: DesignVariant;
  logs: Array<{ nodeName: string; status: "start" | "success" | "error"; data?: unknown }>;
  reason: string;
}) {
  const parsed = generatedWebsiteSchema.safeParse(args.candidate);
  if (parsed.success) {
    return {
      website: parsed.data,
      usedFallback: false
    };
  }

  args.logs.push({
    nodeName: "fallbackGenerator",
    status: "success",
    data: {
      reason: args.reason,
      schemaIssues: parsed.error.issues.slice(0, 8).map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    }
  });

  return {
    website: createFallbackWebsiteFromBrief(args.brief, args.designVariant),
    usedFallback: true
  };
}
