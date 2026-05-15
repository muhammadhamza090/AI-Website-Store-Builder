import type { WebsiteBrief } from "@/lib/validation";

export type RecentStyleRecord = {
  generationStyle?: string | null;
  layoutStyle?: string | null;
  notes?: string | null;
  createdAt?: Date | string | null;
};

export type DesignVariant = {
  seed: number;
  direction: string;
  layoutBias: string;
  paletteBias: string;
  sectionMood: string;
  productPresentation: string;
  heroApproach: string;
  typographyApproach: string;
  navigationApproach: string;
  buttonApproach: string;
  variationStrength: number;
  avoidDirections: string[];
};

// ── ATTRIBUTE POOLS ─────────────────────────────────────────────────────────
// Each pool has diverse options. The system randomly combines ONE from each
// pool to create a unique design direction — never a fixed template.

const LAYOUT_STYLES = [
  "asymmetric editorial grid with dramatic whitespace",
  "full-bleed immersive sections with overlapping layers",
  "tight modular bento grid with varied cell sizes",
  "single-column cinematic scroll with full-viewport sections",
  "split-screen duotone panels alternating content sides",
  "magazine-style mixed 2-3-4 column rhythm",
  "diagonal slash composition with angled section dividers",
  "stacked wide banners with alternating background tones",
  "offset grid where elements intentionally break alignment",
  "masonry waterfall layout with organic flow",
  "centered narrow column with generous margins and pull-quotes",
  "layered depth layout with parallax-style z-index stacking",
  "newspaper-style multi-column with featured callouts",
  "horizontal scroll sections mixed with vertical flow",
  "card-based dashboard layout with uniform grid modules",
  "sidebar-anchored layout with floating content cards",
];

const COLOR_STRATEGIES = [
  "deep moody darks with one electric neon accent",
  "warm earth tones: terracotta, ochre, olive, cream",
  "monochrome grayscale with a single saturated highlight",
  "jewel tones: emerald, sapphire, ruby on dark backgrounds",
  "pastel dreamscape: lavender, mint, peach, soft gold",
  "high-contrast black and vivid primary color duotone",
  "warm neutral palette: sand, taupe, ivory, bronze accents",
  "cool oceanic: navy, teal, seafoam, pearl white",
  "sunset gradient palette: coral, amber, magenta, deep purple",
  "forest botanical: deep green, moss, bark brown, cream",
  "industrial: concrete gray, rust orange, steel blue, charcoal",
  "candy pop: hot pink, electric blue, lime, against white",
  "vintage muted: dusty rose, sage, faded denim, antique gold",
  "arctic minimal: ice blue, snow white, silver, slate",
  "luxe metallic: gold, champagne, deep black, ivory",
  "tropical vibrant: coral red, palm green, sunny yellow, ocean blue",
];

const TYPOGRAPHY_APPROACHES = [
  "oversized display serif with thin sans-serif body",
  "geometric sans-serif throughout with tight letter-spacing",
  "handwritten-feel headings with clean modern body text",
  "monospace technical headings with humanist body font",
  "ultra-light weight contrast: thin titles, medium body",
  "heavy condensed uppercase with airy lowercase body text",
  "elegant italic serif headings with neutral sans body",
  "rounded friendly headings with classic serif body",
  "brutalist oversized type that fills the viewport width",
  "mixed weight within headings: light and black weight together",
  "vintage slab-serif headings with modern grotesk body",
  "decorative display font for hero only, systematic sans elsewhere",
];

const HERO_APPROACHES = [
  "full-viewport dark overlay with floating text and gradient backdrop",
  "split-screen: bold text left, abstract gradient shape right",
  "minimal hero: giant typography only, no imagery, just words",
  "layered hero with overlapping translucent panels and depth",
  "centered circular focal point with radial content arrangement",
  "animated gradient background with kinetic text entrance",
  "asymmetric hero: small text at bottom-left, vast atmospheric space",
  "editorial hero: image-forward with text overlay at bottom edge",
  "grid-based hero with product highlights embedded in the layout",
  "bold statement hero: single powerful phrase filling the screen",
  "stacked hero: announcement bar, nav, full-height dramatic visual",
  "floating card hero with content in an elevated glass panel",
];

const SECTION_MOODS = [
  "immersive and cinematic with dramatic transitions",
  "clean and systematic with mathematical precision",
  "warm and inviting like a curated artisan boutique",
  "edgy and disruptive with unexpected layout choices",
  "serene and meditative with generous breathing room",
  "energetic and dynamic with bold visual rhythm",
  "sophisticated and understated with subtle luxury details",
  "playful and expressive with personality and charm",
  "raw and authentic with handcrafted imperfections",
  "futuristic and sleek with cutting-edge aesthetics",
  "nostalgic and textured with vintage character",
  "minimalist and focused with purposeful restraint",
];

const PRODUCT_PRESENTATIONS = [
  "editorial lookbook cards with magazine-style composition",
  "dense catalog grid with quick-compare hover features",
  "featured hero product with supporting product carousel",
  "lifestyle context cards showing products in styled scenes",
  "minimal text-forward cards with images revealed on hover",
  "large-format single-column product showcase",
  "mosaic grid with varied card sizes for visual hierarchy",
  "horizontal scrolling product rail with peek-next effect",
  "polaroid-style cards with tilted angles and soft shadows",
  "glassmorphism product cards floating over gradient backgrounds",
  "brutalist product blocks with thick borders and raw typography",
  "stacked list view with side-by-side image and detail panels",
];

const NAVIGATION_STYLES = [
  "transparent overlay that solidifies on scroll with blur",
  "minimal top bar with centered logo and icon-only navigation",
  "full-width mega menu with category image previews",
  "slim elegant bar with spaced horizontal links and hover underlines",
  "pill-shaped floating nav centered with rounded background",
  "split nav: logo left, links center, cart actions right",
  "thick bordered bar with bold uppercase link typography",
  "glassmorphism nav with frosted background and subtle border",
  "underline-animated links with smooth slide transitions",
  "dark contrasting nav bar with light text and accent hover color",
];

const BUTTON_STYLES = [
  "pill-shaped with subtle gradient and soft shadow",
  "sharp rectangular with bold borders and zero radius",
  "ghost buttons: transparent with border, fill on hover",
  "chunky 3D buttons with offset box-shadow depth effect",
  "minimal text-only buttons with arrow → indicator",
  "rounded with icon prefix and micro-animation on click",
  "outlined with thick 2-3px borders and bold text",
  "clip-path geometric shapes like angled parallelograms",
  "glassmorphism buttons with blur background and glow",
  "split-tone buttons with two-color gradient backgrounds",
];

export function createDesignVariant(args: {
  brief: WebsiteBrief;
  recentStyles: RecentStyleRecord[];
}): DesignVariant {
  const { brief, recentStyles } = args;
  const variationStrength = normalizeVariationStrength(brief.variationStrength);

  const seed = hashText([
    brief.businessName,
    brief.industry,
    brief.targetAudience,
    brief.productsOrServices,
    brief.preferredStyle,
    brief.preferredColors ?? "",
    brief.ecommerceType,
    brief.brandTone,
    String(variationStrength),
    String(Date.now()),
    String(Math.random()),
    String(Math.random()),
  ].join("|"));

  const recentFingerprints = extractRecentFingerprints(recentStyles);
  const avoidDirections = recentFingerprints.slice(0, Math.min(variationStrength * 2, 10));

  // Pick one from each pool using different hash offsets
  const layout = pickFromPool(LAYOUT_STYLES, seed, 1);
  const colorStrategy = pickFromPool(COLOR_STRATEGIES, seed, 2);
  const typography = pickFromPool(TYPOGRAPHY_APPROACHES, seed, 3);
  const hero = pickFromPool(HERO_APPROACHES, seed, 4);
  const mood = pickFromPool(SECTION_MOODS, seed, 5);
  const products = pickFromPool(PRODUCT_PRESENTATIONS, seed, 6);
  const nav = pickFromPool(NAVIGATION_STYLES, seed, 7);
  const buttons = pickFromPool(BUTTON_STYLES, seed, 8);

  // Compose a unique direction string from the combination
  const direction = `${mood} / ${colorStrategy}`;

  return {
    seed,
    direction,
    layoutBias: layout,
    paletteBias: colorStrategy,
    sectionMood: mood,
    productPresentation: products,
    heroApproach: hero,
    typographyApproach: typography,
    navigationApproach: nav,
    buttonApproach: buttons,
    variationStrength,
    avoidDirections,
  };
}

function pickFromPool(pool: string[], seed: number, offset: number): string {
  // Use multiple sources of randomness to ensure uniqueness
  const hash = hashText(`${seed}:${offset}:${Math.random().toString(36)}`);
  const index = hash % pool.length;
  return pool[index] ?? pool[0];
}

function extractRecentFingerprints(recentStyles: RecentStyleRecord[]): string[] {
  return recentStyles
    .map(r => `${r.layoutStyle ?? ""} ${r.generationStyle ?? ""} ${r.notes ?? ""}`.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeVariationStrength(value: number) {
  return Math.max(1, Math.min(5, Math.round(value || 4)));
}

function hashText(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
