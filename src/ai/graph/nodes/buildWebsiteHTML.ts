import { callClaudeStreaming, extractClaudeText, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { websiteCodePrompt } from "@/ai/prompts/websiteCodePrompt";
import { withTimeout } from "@/ai/graph/nodes/_withTimeout";
import type { WebsiteGraphState } from "@/ai/graph/state";

// ── STEP 1 SYSTEM: design plan commitment ─────────────────────────────────────
const DESIGN_PLAN_SYSTEM = `You are a senior UI/UX designer at a premium agency creating a UNIQUE, MODERN, PREMIUM visual design for an ecommerce website.

You will receive a design variant with creative attributes. Use them to produce a CONCRETE, SPECIFIC visual plan that feels like a top-tier Shopify theme — not a WordPress template.

Be extremely specific — not "use a split layout" but "hero: CSS grid 2 columns, left 45vw panel with gradient overlay (135deg, var(--primary) to transparent), white 4.5rem heading with letter-spacing:-0.02em, glassmorphic CTA button with backdrop-filter:blur(12px)".

DESIGN MUST FEEL MODERN & PREMIUM:
- Think glassmorphism (backdrop-filter:blur), gradient text on headings, layered multi-depth shadows
- Cards that lift on hover (translateY(-8px) + enhanced shadow), not just color change
- Rich gradient product images (3+ color stops, angled), not flat color blocks
- Smooth cubic-bezier transitions on everything interactive
- Section dividers using clip-path or angled pseudo-elements
- Typography with letter-spacing for elegance, dramatic size contrast
- Alternating section backgrounds for visual rhythm
- Nav that feels premium: sticky + glassmorphism effect on scroll

Output exactly these 6 sections (use these exact headings):
HERO LAYOUT: [exact CSS layout, dimensions, overlay technique (gradient/radial/mesh), animation (fade-in/slide/parallax), CTA button style with hover effect]
COLOR APPLICATION: [which exact hex on which elements — bg, nav (include glassmorphism params), hero overlay, cards, buttons (with gradient direction), text, accents, section backgrounds (alternate!)]
TYPOGRAPHY SCALE: [exact clamp() sizes for h1, h2, h3, body, price, label — include letter-spacing and font-weight for each]
SECTION ORDER: [homepage sections in render order with spacing + describe background treatment for each section]
PRODUCT PAGE UI: [product detail page: image area style, variant selector design (size buttons with +$X labels, color swatches with ring on selected), live price display, add-to-cart button (gradient + price text), empty cart state design]
SIGNATURE ELEMENT: [one distinctive MODERN CSS technique — e.g., animated gradient border, glassmorphic floating cards, gradient text headings, parallax hero, clip-path section dividers — be specific about the CSS]

The final website must make someone say "wow this looks expensive" at first glance. NOT a free Bootstrap template.
Never use plain white backgrounds with blue buttons. Never use flat, boring, shadowless cards.`;

export async function buildWebsiteHTML(state: WebsiteGraphState): Promise<Partial<WebsiteGraphState>> {
  if (!state.designSystem || !state.content || !state.products) {
    throw new Error(
      `buildWebsiteHTML: missing required state — designSystem:${!!state.designSystem}, content:${!!state.content}, products:${!!state.products}`
    );
  }

  const client = getClaudeClient();
  const model = getClaudeModel();

  const palette = state.designSystem.colorPalette;
  const typo = state.designSystem.typography;
  const variant = state.designVariant;
  const seed = variant?.seed ?? Date.now();

  // ─── STEP 1: Get Claude to commit to a design plan ───────────────────────────
  let designPlan = `Hero: ${state.designSystem.heroStyle}. Layout: ${state.designSystem.layoutStyle}. Mood: ${state.designSystem.uiMood}.`;
  try {
    const planRes = await withTimeout(
      client.messages.create({
        model,
        max_tokens: 1200,
        temperature: 1.0,
        system: DESIGN_PLAN_SYSTEM,
        messages: [
          {
            role: "user",
            content: `Seed: ${seed} (use this to vary your choices)

Business: ${state.brief.businessName} (${state.brief.industry})
Audience: ${state.brief.targetAudience}
Brand tone: ${state.brief.brandTone}
Ecommerce type: ${state.brief.ecommerceType}

Design System:
  Colors: bg=${palette.background} text=${palette.text} primary=${palette.primary} secondary=${palette.secondary} accent=${palette.accent}
  Fonts: heading="${typo.headingFont}" body="${typo.bodyFont}" style="${typo.style}"
  Layout: ${state.designSystem.layoutStyle}
  Hero: ${state.designSystem.heroStyle}
  Navigation: ${state.designSystem.navigationStyle}
  Buttons: ${state.designSystem.buttonStyle}
  Cards: ${state.designSystem.productCardStyle}
  Mood: ${state.designSystem.uiMood}
  Spacing: ${state.designSystem.spacingScale}

Creative Direction (use as inspiration):
  Layout approach: ${variant?.layoutBias ?? "creative and unique"}
  Color strategy: ${variant?.paletteBias ?? "bold and distinctive"}
  Hero approach: ${variant?.heroApproach ?? "dramatic and memorable"}
  Typography approach: ${variant?.typographyApproach ?? "expressive and readable"}
  Section mood: ${variant?.sectionMood ?? "engaging and professional"}
  Product presentation: ${variant?.productPresentation ?? "compelling merchandising"}
  Navigation: ${variant?.navigationApproach ?? "intuitive and styled"}
  Buttons: ${variant?.buttonApproach ?? "distinctive and clickable"}

Produce your concrete, unique design specification now.`
          }
        ]
      }),
      60_000,
      "buildWebsiteHTML:plan"
    );
    designPlan = extractClaudeText(planRes).trim();
  } catch (planErr) {
    console.error("[buildWebsiteHTML] plan step failed:", planErr instanceof Error ? planErr.message : planErr);
  }

  // ─── Build the full design brief text ────────────────────────────────────────
  const productLines = state.products.map(
    (p, i) => {
      const sizesStr = p.sizes?.length
        ? ` sizes=[${p.sizes.map(s => typeof s === 'string' ? s : `${s.label}${s.priceDelta ? `(+$${s.priceDelta})` : ''}`).join(',')}]`
        : '';
      const colorsStr = p.colors?.length
        ? ` colors=[${p.colors.map(c => `${c.name}:${c.hex}${c.priceDelta ? `(+$${c.priceDelta})` : ''}`).join(',')}]`
        : '';
      const compareStr = p.compareAtPrice ? ` was=$${p.compareAtPrice}` : '';
      const reviewStr = p.reviewCount ? ` reviews=${p.reviewCount}` : '';
      return `[${i + 1}] name="${p.name}" price=$${p.price}${compareStr} category="${p.category}"${p.badge ? ` badge="${p.badge}"` : ''}${p.rating ? ` rating=${p.rating}` : ''}${reviewStr}${sizesStr}${colorsStr} desc="${p.description.slice(0, 80)}"`;
    }
  );

  const categories = Array.from(new Set(state.products.map((p) => p.category)));

  const testimonialLines = (state.content.home.testimonials ?? []).map(
    (t) => `  "${t.quote}" — ${t.name}`
  );

  const designBrief = `╔══════════════════════════════════════════════════════════════╗
║  UNIQUE DESIGN | SEED: ${seed}
╚══════════════════════════════════════════════════════════════╝

BUSINESS: ${state.brief.businessName}
⚠️ USE THIS EXACT NAME everywhere (navbar, hero, footer, title) — do NOT change, abbreviate, or embellish it.
Industry: ${state.brief.industry} | Type: ${state.brief.ecommerceType}
Audience: ${state.brief.targetAudience}
Brand tone: ${state.brief.brandTone}
${state.brief.preferredColors ? `Brand color hint: ${state.brief.preferredColors}` : ""}

COLOR PALETTE — use these EXACT hex values as CSS custom properties:
  --primary:   ${palette.primary}
  --secondary: ${palette.secondary}
  --accent:    ${palette.accent}
  --bg:        ${palette.background}
  --text:      ${palette.text}

TYPOGRAPHY:
  Heading font: "${typo.headingFont}"
  Body font: "${typo.bodyFont}"
  Style: ${typo.style}

DESIGN SYSTEM (follow this precisely):
  Layout: ${state.designSystem.layoutStyle}
  Hero: ${state.designSystem.heroStyle}
  Navigation: ${state.designSystem.navigationStyle}
  Buttons: ${state.designSystem.buttonStyle}
  Cards: ${state.designSystem.productCardStyle}
  Spacing: ${state.designSystem.spacingScale}
  Mood: ${state.designSystem.uiMood}
  Hierarchy: ${state.designSystem.hierarchy}
  Brand voice: ${state.designSystem.brandVoice}
  Mobile: ${state.designSystem.mobileLayout}

MY DESIGN PLAN (I will follow this exactly):
${designPlan}

CREATIVE DIRECTION:
  Layout: ${variant?.layoutBias ?? "unique"}
  Hero: ${variant?.heroApproach ?? "dramatic"}
  Typography: ${variant?.typographyApproach ?? "expressive"}
  Products: ${variant?.productPresentation ?? "compelling"}
  Navigation: ${variant?.navigationApproach ?? "intuitive"}
  Buttons: ${variant?.buttonApproach ?? "distinctive"}

HERO CONTENT:
  Headline: "${state.content.home.heroTitle}"
  Subtitle: "${state.content.home.heroSubtitle}"
  Primary CTA: "${state.content.home.heroCtaLabel}"
  ${state.content.home.heroSecondaryCtaLabel ? `Secondary CTA: "${state.content.home.heroSecondaryCtaLabel}"` : ""}
  Brand story: "${state.content.home.brandStory}"

PRODUCTS (${state.products.length} total):
${productLines.join("\n")}

CATEGORIES: ${categories.join(" · ")}

TESTIMONIALS:
${testimonialLines.join("\n")}

TRUST BADGES: ${(state.content.home.trustBadges ?? []).join(" · ")}

FAQ: ${state.content.home.faq.length} questions

GLOBALS:
  Footer blurb: "${state.content.globals.footerBlurb}"
  Newsletter heading: "${state.content.globals.newsletterHeading}"
  ${state.content.globals.announcement ? `Announcement bar: "${state.content.globals.announcement}"` : ""}

STRATEGY:
  Funnel: ${state.strategy?.funnel ?? ""}
  Primary CTA: "${state.strategy?.primaryCTA ?? "Shop now"}"
  Merchandising: ${state.strategy?.merchandisingAngle ?? ""}`;

  // ─── STEP 2: Generate HTML — Claude creates ALL CSS from scratch ─────────────
  // The prefill provides ONLY reset, tokens, and animation keyframes.
  // Claude must generate all component-level CSS, layout, and visual design itself.
  const fontUrl = encodeURIComponent(`family=${typo.headingFont.replace(/ /g, "+")}&family=${typo.bodyFont.replace(/ /g, "+")}&display=swap`);

  const prefill = `<!-- ═══ ${state.brief.businessName} | SEED:${seed} ═══ -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${state.brief.businessName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?${fontUrl}" rel="stylesheet">
<style>
/* ── RESET ─────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

/* ── DESIGN TOKENS ─────────────────────────────────────────────── */
:root{
  --primary:${palette.primary};
  --secondary:${palette.secondary};
  --accent:${palette.accent};
  --bg:${palette.background};
  --text:${palette.text};
  --heading-font:"${typo.headingFont}",serif;
  --body-font:"${typo.bodyFont}",sans-serif;
}

/* ── BASE ──────────────────────────────────────────────────────── */
body{background:var(--bg);color:var(--text);font-family:var(--body-font);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block}
a{text-decoration:none;color:inherit}
button{cursor:pointer;font-family:inherit;min-height:44px}

/* ── ANIMATIONS ────────────────────────────────────────────────── */
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}

/* ── PAGES ─────────────────────────────────────────────────────── */
.page-section{display:none}
.page-section.active{display:block}

/* ══════════════════════════════════════════════════════════════════
   IMPORTANT: Write CONCISE CSS. Use shorthand properties.
   Combine selectors. Avoid verbose comments in CSS.
   Keep total CSS under 800 lines so there is room for all HTML and JS.
   Write the </style> tag, then IMMEDIATELY start <body>.
   Do NOT write more than needed — every page must render.
   ══════════════════════════════════════════════════════════════════ */`;

  const continuation = await callClaudeStreaming({
    client,
    model,
    max_tokens: 64000,
    temperature: 1.0,
    system: websiteCodePrompt,
    messages: [
      { role: "user", content: designBrief },
      { role: "assistant", content: prefill }
    ]
  });

  let html = prefill + "\n" + continuation.trim();

  // Strip accidental markdown fences
  html = html.replace(/^```html\s*/im, "").replace(/\s*```\s*$/im, "").trim();

  // ── Truncation recovery ──────────────────────────────────────────────────
  // If Claude hit the token limit and the HTML is truncated, try to close it gracefully
  if (!html.toLowerCase().includes("</html>")) {
    // Check if we at least have a body
    if (html.toLowerCase().includes("<body")) {
      // Close any open tags gracefully
      html += "\n</div></main></body></html>";
      console.warn("[buildWebsiteHTML] HTML truncated — added closing tags");
    } else if (html.toLowerCase().includes("</style>")) {
      // CSS finished but body not started — add minimal body
      html += `\n<body>
<nav style="background:var(--primary);padding:1rem 2rem;color:#fff;font-family:var(--heading-font)">
  <strong>${state.brief.businessName}</strong>
</nav>
<main style="padding:2rem;text-align:center">
  <h1 style="font-family:var(--heading-font);font-size:3rem;margin:2rem 0">${state.content.home.heroTitle}</h1>
  <p style="font-size:1.2rem;max-width:600px;margin:0 auto">${state.content.home.heroSubtitle}</p>
  <p style="margin-top:2rem;color:var(--accent)">Website generation was truncated. Please regenerate.</p>
</main>
</body></html>`;
      console.warn("[buildWebsiteHTML] HTML truncated before body — added emergency body");
    } else {
      throw new Error(
        `buildWebsiteHTML: output missing <body> — Claude returned truncated HTML (length: ${html.length})`
      );
    }
  }

  return { generatedHTML: html };
}
