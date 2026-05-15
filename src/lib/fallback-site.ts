import type { WebsiteBrief } from "@/lib/validation";
import type { GeneratedWebsite, Product, Section } from "@/lib/site-schema";
import type { DesignVariant } from "@/lib/design-variant";

type ThemePreset = {
  layoutStyle: string;
  uiMood: string;
  heroStyle: string;
  productCardStyle: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    style: string;
  };
};

const THEME_PRESETS: ThemePreset[] = [
  {
    layoutStyle: "editorial showcase",
    uiMood: "luxury editorial",
    heroStyle: "full-bleed story-led hero",
    productCardStyle: "rounded editorial cards",
    colorPalette: {
      primary: "#7C2D12",
      secondary: "#F5E6D3",
      accent: "#C2410C",
      background: "#FFF9F2",
      text: "#1C1917"
    },
    typography: {
      headingFont: "Editorial Serif",
      bodyFont: "Modern Sans",
      style: "high-contrast serif"
    }
  },
  {
    layoutStyle: "soft boutique grid",
    uiMood: "warm organic boutique",
    heroStyle: "split hero with layered product storytelling",
    productCardStyle: "soft cards with warm gradients",
    colorPalette: {
      primary: "#BE185D",
      secondary: "#FFE4E6",
      accent: "#FB7185",
      background: "#FFF7F8",
      text: "#3F1D2E"
    },
    typography: {
      headingFont: "Boutique Sans",
      bodyFont: "Soft Grotesk",
      style: "friendly contemporary"
    }
  },
  {
    layoutStyle: "modern catalog grid",
    uiMood: "clean tech-modern",
    heroStyle: "structured catalog hero",
    productCardStyle: "sharp cards with bold CTAs",
    colorPalette: {
      primary: "#1D4ED8",
      secondary: "#DBEAFE",
      accent: "#06B6D4",
      background: "#F8FAFC",
      text: "#0F172A"
    },
    typography: {
      headingFont: "Neo Grotesk",
      bodyFont: "System Sans",
      style: "modern geometric"
    }
  },
  {
    layoutStyle: "minimal premium layout",
    uiMood: "minimal refined",
    heroStyle: "calm minimal hero",
    productCardStyle: "minimal cards with airy spacing",
    colorPalette: {
      primary: "#111827",
      secondary: "#E5E7EB",
      accent: "#D97706",
      background: "#FFFFFF",
      text: "#111827"
    },
    typography: {
      headingFont: "Refined Sans",
      bodyFont: "Neutral Sans",
      style: "minimalist"
    }
  },
  {
    layoutStyle: "bold campaign retail",
    uiMood: "high-energy retail campaign",
    heroStyle: "oversized promotional hero with stacked messaging",
    productCardStyle: "dense campaign cards with badges and urgency",
    colorPalette: {
      primary: "#DC2626",
      secondary: "#FEE2E2",
      accent: "#F59E0B",
      background: "#FFF7ED",
      text: "#1F2937"
    },
    typography: {
      headingFont: "Campaign Display",
      bodyFont: "Retail Sans",
      style: "bold retail"
    }
  },
  {
    layoutStyle: "retro playful storefront",
    uiMood: "playful nostalgic",
    heroStyle: "graphic hero with expressive blocks",
    productCardStyle: "playful cards with bright accents",
    colorPalette: {
      primary: "#7C3AED",
      secondary: "#F3E8FF",
      accent: "#F97316",
      background: "#FFFDF7",
      text: "#312E81"
    },
    typography: {
      headingFont: "Retro Display",
      bodyFont: "Friendly Sans",
      style: "playful expressive"
    }
  },
  {
    layoutStyle: "brutalist grid storefront",
    uiMood: "bold brutalist modern",
    heroStyle: "hard-edge hero with oversized text",
    productCardStyle: "sharp utility cards",
    colorPalette: {
      primary: "#111111",
      secondary: "#F4F4F5",
      accent: "#22C55E",
      background: "#FFFFFF",
      text: "#111111"
    },
    typography: {
      headingFont: "Brutalist Grotesk",
      bodyFont: "Utility Sans",
      style: "brutalist"
    }
  },
  {
    layoutStyle: "artisan organic market",
    uiMood: "grounded artisan organic",
    heroStyle: "story-led organic hero with tactile layering",
    productCardStyle: "rounded natural cards with earthy accents",
    colorPalette: {
      primary: "#166534",
      secondary: "#DCFCE7",
      accent: "#B45309",
      background: "#F8FFF8",
      text: "#1F2937"
    },
    typography: {
      headingFont: "Organic Serif",
      bodyFont: "Humanist Sans",
      style: "earthy editorial"
    }
  }
];

const HOME_ORDERS = [
  ["banner", "hero", "category_grid", "featured_products", "brand_story", "trust_badges", "testimonials", "newsletter", "faq"],
  ["hero", "category_grid", "new_arrivals", "brand_story", "best_sellers", "trust_badges", "newsletter", "testimonials", "faq"],
  ["banner", "hero", "brand_story", "category_grid", "product_grid", "trust_badges", "faq", "newsletter", "testimonials"],
  ["hero", "featured_products", "category_grid", "trust_badges", "brand_story", "new_arrivals", "testimonials", "newsletter", "faq"],
  ["banner", "hero", "featured_products", "brand_story", "category_grid", "newsletter", "trust_badges", "faq", "testimonials"],
  ["hero", "brand_story", "category_grid", "new_arrivals", "trust_badges", "featured_products", "newsletter", "testimonials", "faq"],
  ["banner", "hero", "trust_badges", "product_grid", "category_grid", "brand_story", "testimonials", "faq", "newsletter"],
  ["hero", "category_grid", "brand_story", "featured_products", "newsletter", "best_sellers", "faq", "trust_badges", "testimonials"]
] as const;

// Theme selection is now seed-based since design directions are dynamically generated.

export function createFallbackWebsiteFromBrief(
  brief: WebsiteBrief,
  designVariant?: DesignVariant
): GeneratedWebsite {
  const seed = hashText([
    brief.businessName,
    brief.industry,
    brief.targetAudience,
    brief.productsOrServices,
    brief.preferredStyle,
    brief.preferredColors ?? "",
    brief.ecommerceType,
    brief.brandTone,
    String(designVariant?.seed ?? "")
  ].join("|"));

  const theme = pickThemePreset(seed);
  const categories = deriveCategories(brief);
  const products = createProducts(brief, categories, seed);
  const homeOrder = HOME_ORDERS[seed % HOME_ORDERS.length];
  const footerBlurb = `${brief.businessName} creates ${brief.preferredStyle.toLowerCase()} products for ${brief.targetAudience.toLowerCase()}.`;

  const sharedFooter: Section = {
    id: "footer_shared",
    type: "footer",
    title: "Footer",
    content: footerBlurb,
    items: [
      { title: "Support", links: ["Shipping", "Returns", "Order tracking", "Help center"] },
      { title: "Policies", links: ["Privacy policy", "Terms", "Refund policy"] },
      {
        title: "Social",
        links: [
          { label: "Instagram", href: "#" },
          { label: "Pinterest", href: "#" },
          { label: "TikTok", href: "#" }
        ]
      }
    ]
  };

  const sharedNavbar: Section = {
    id: "navbar_shared",
    type: "navbar",
    title: brief.businessName,
    items: [
      { label: "Shop", href: "/shop" },
      ...categories.slice(0, 4).map((category) => ({
        label: category,
        href: `/shop?cat=${encodeURIComponent(category)}`
      })),
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" }
    ]
  };

  const homeSections = homeOrder.map((type, index) =>
    buildSection(type, brief, theme, categories, products, seed + index, designVariant)
  );

  const shopSections: Section[] = [
    buildSection("hero", brief, theme, categories, products, seed + 10, designVariant),
    buildSection("category_grid", brief, theme, categories, products, seed + 11, designVariant),
    buildSection("product_grid", brief, theme, categories, products, seed + 12, designVariant),
    buildSection("newsletter", brief, theme, categories, products, seed + 13, designVariant)
  ];

  const productSections: Section[] = [
    buildSection("hero", brief, theme, categories, products, seed + 20, designVariant),
    buildSection("featured_products", brief, theme, categories, products, seed + 21, designVariant),
    buildSection("trust_badges", brief, theme, categories, products, seed + 22, designVariant),
    buildSection("faq", brief, theme, categories, products, seed + 23, designVariant)
  ];

  const simplePages = [
    {
      slug: "cart",
      title: "Cart",
      type: "cart",
      sections: [
        simpleSection("cart_summary", "Cart overview", "Review your items, quantities, and savings before checkout."),
        simpleSection("trust_badges", "Why shoppers finish checkout", undefined, [
          { label: "Secure payments" },
          { label: "Fast delivery" },
          { label: "Easy returns" }
        ])
      ]
    },
    {
      slug: "checkout",
      title: "Checkout",
      type: "checkout",
      sections: [
        simpleSection(
          "checkout_flow",
          "Checkout built for conversion",
          "A clean, low-friction checkout with clear shipping and payment steps."
        ),
        simpleSection("faq", "Checkout questions", undefined, [
          { q: "How fast is shipping?", a: "Most orders dispatch in 1-2 business days." },
          { q: "Can I return an item?", a: "Yes, returns are supported within the standard return window." }
        ])
      ]
    },
    {
      slug: "about",
      title: "About",
      type: "about",
      sections: [
        simpleSection(
          "brand_story",
          "About the brand",
          `${brief.businessName} serves ${brief.targetAudience.toLowerCase()} with a ${brief.brandTone.toLowerCase()} voice and a ${brief.preferredStyle.toLowerCase()} visual point of view.`
        ),
        simpleSection("trust_badges", "Why customers stay", undefined, [
          { label: "Distinct design direction" },
          { label: "Customer-first support" },
          { label: "Quality-focused assortment" }
        ])
      ]
    },
    {
      slug: "contact",
      title: "Contact",
      type: "contact",
      sections: [
        simpleSection(
          "contact_panel",
          "Talk to the team",
          `Reach ${brief.businessName} for product questions, shipping support, and wholesale inquiries.`
        ),
        simpleSection("faq", "Support FAQ", undefined, [
          { q: "When will I hear back?", a: "Support requests are typically answered within one business day." },
          { q: "Do you offer custom orders?", a: "Selected products and bulk requests can be discussed with the team." }
        ])
      ]
    }
  ];

  return {
    site: {
      id: `site_${Date.now()}`,
      businessName: brief.businessName,
      industry: brief.industry,
      layoutStyle: theme.layoutStyle,
      colorPalette: theme.colorPalette,
      typography: theme.typography,
      pages: [
        {
          id: "page_home",
          slug: "home",
          title: "Home",
          type: "home",
          sections: [sharedNavbar, ...homeSections, sharedFooter]
        },
        {
          id: "page_shop",
          slug: "shop",
          title: "Shop",
          type: "shop",
          sections: [sharedNavbar, ...shopSections, sharedFooter]
        },
        {
          id: "page_product",
          slug: "product",
          title: "Product Detail",
          type: "product_detail",
          sections: [sharedNavbar, ...productSections, sharedFooter]
        },
        ...simplePages.map((page) => ({
          id: `page_${page.slug}`,
          slug: page.slug,
          title: page.title,
          type: page.type,
          sections: [sharedNavbar, ...page.sections, sharedFooter]
        }))
      ]
    },
    products,
    meta: {
      generationStyle: theme.uiMood,
      notes: `Fallback generation used. Direction: ${designVariant?.direction ?? "custom"}; Hero: ${theme.heroStyle}; Product cards: ${theme.productCardStyle}`
    }
  };
}

function pickThemePreset(seed: number) {
  return THEME_PRESETS[seed % THEME_PRESETS.length];
}

function createProducts(brief: WebsiteBrief, categories: string[], seed: number): Product[] {
  const adjectives = ["Signature", "Studio", "Classic", "Modern", "Limited", "Premium", "Everyday", "Refined"];
  const suffixes = ["Edition", "Collection", "Set", "Series", "Drop", "Select", "Favorite", "Essential"];

  const sizeOptions = [
    [{ label: "XS", priceDelta: 0 }, { label: "S", priceDelta: 0 }, { label: "M", priceDelta: 0 }, { label: "L", priceDelta: 0 }, { label: "XL", priceDelta: 5 }],
    [{ label: "Small", priceDelta: 0 }, { label: "Medium", priceDelta: 8 }, { label: "Large", priceDelta: 15 }],
    [{ label: "One Size", priceDelta: 0 }],
    [{ label: "6", priceDelta: 0 }, { label: "8", priceDelta: 0 }, { label: "10", priceDelta: 0 }, { label: "12", priceDelta: 3 }, { label: "14", priceDelta: 5 }],
    [{ label: "S", priceDelta: 0 }, { label: "M", priceDelta: 0 }, { label: "L", priceDelta: 0 }, { label: "XL", priceDelta: 5 }, { label: "XXL", priceDelta: 8 }]
  ];

  const colorSets = [
    [{ name: "Midnight Black", hex: "#1a1a2e", priceDelta: 0 }, { name: "Cloud White", hex: "#f5f5f0", priceDelta: 0 }, { name: "Ocean Blue", hex: "#0077b6", priceDelta: 5 }],
    [{ name: "Charcoal", hex: "#36454f", priceDelta: 0 }, { name: "Sand", hex: "#c2b280", priceDelta: 0 }, { name: "Terracotta", hex: "#c04000", priceDelta: 0 }, { name: "Sage", hex: "#87ae73", priceDelta: 8 }],
    [{ name: "Pearl", hex: "#f0ead6", priceDelta: 0 }, { name: "Blush", hex: "#de6fa1", priceDelta: 5 }, { name: "Navy", hex: "#1b2a4a", priceDelta: 0 }],
    [{ name: "Forest", hex: "#228b22", priceDelta: 0 }, { name: "Rust", hex: "#b7410e", priceDelta: 0 }, { name: "Cream", hex: "#fffdd0", priceDelta: 0 }, { name: "Slate", hex: "#708090", priceDelta: 10 }],
    [{ name: "Espresso", hex: "#3c1414", priceDelta: 0 }, { name: "Ivory", hex: "#fffff0", priceDelta: 0 }, { name: "Dusty Rose", hex: "#dcae96", priceDelta: 12 }],
    [{ name: "Storm Grey", hex: "#4f5d75", priceDelta: 0 }, { name: "Sunrise", hex: "#ffcf48", priceDelta: 5 }, { name: "Deep Plum", hex: "#4a0e4e", priceDelta: 8 }, { name: "Mint", hex: "#98fb98", priceDelta: 0 }]
  ];

  return Array.from({ length: 12 }, (_, index) => {
    const category = categories[index % categories.length];
    const adjective = adjectives[(seed + index) % adjectives.length];
    const suffix = suffixes[(seed + index * 2) % suffixes.length];
    const priceBase = 24 + ((seed + index * 17) % 16) * 8;
    const price = Number((priceBase + (index % 3) * 5 + 0.99).toFixed(2));
    const hasSale = index % 3 === 0;
    const compareAtPrice = hasSale ? Number((price * 1.4).toFixed(2)) : undefined;
    const sizes = sizeOptions[(seed + index) % sizeOptions.length];
    const colors = colorSets[(seed + index) % colorSets.length];

    return {
      id: `product_${index + 1}`,
      name: `${adjective} ${category} ${suffix}`,
      category,
      price,
      compareAtPrice,
      description: `${brief.preferredStyle} ${category.toLowerCase()} designed for ${brief.targetAudience.toLowerCase()}.`,
      imagePrompt: `${brief.preferredStyle}, ${category}, ecommerce product photo, clean studio setup`,
      badge: hasSale ? "Sale" : index % 4 === 1 ? "Best seller" : index % 5 === 0 ? "New" : undefined,
      rating: 4.2 + ((seed + index) % 7) * 0.1,
      reviewCount: 12 + ((seed + index * 7) % 200),
      sizes,
      colors,
      variants: [
        { id: `variant_${index + 1}_1`, name: sizes[0].label, type: "size" as const, inStock: true },
        { id: `variant_${index + 1}_2`, name: "Premium", type: "style" as const, priceDelta: 12, inStock: true },
        { id: `variant_${index + 1}_3`, name: colors[0].name, type: "color" as const, colorHex: colors[0].hex, inStock: true }
      ]
    };
  });
}

function buildSection(
  type: string,
  brief: WebsiteBrief,
  theme: ThemePreset,
  categories: string[],
  products: Product[],
  seed: number,
  designVariant?: DesignVariant
): Section {
  switch (type) {
    case "banner":
      return {
        id: `section_${type}_${seed}`,
        type,
        title: `${brief.businessName} launch offer: curated picks and limited seasonal highlights`,
        backgroundStyle: "gradient"
      };
    case "hero":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: theme.layoutStyle.includes("editorial") ? "editorial split" : "showcase split",
        title: `${brief.businessName} for ${brief.targetAudience}`,
        subtitle: `A ${brief.preferredStyle.toLowerCase()} ecommerce experience for ${brief.productsOrServices.toLowerCase()}.`,
        cta: { label: "Shop collection", href: "/shop" },
        items: [
          {
            secondaryCtaLabel: "See the story",
            secondaryCtaHref: "/about",
            intent: `${designVariant?.direction ?? theme.uiMood} direction with ${brief.brandTone.toLowerCase()} messaging`
          }
        ]
      };
    case "category_grid":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: theme.layoutStyle.includes("grid") ? "dense catalog grid" : "showcase grid",
        title: "Shop by category",
        subtitle: "Collections organized around the way customers browse.",
        items: categories.map((category) => ({
          id: `cat-${slugify(category)}`,
          title: category,
          href: `/shop?cat=${encodeURIComponent(category)}`
        }))
      };
    case "featured_products":
    case "product_grid":
    case "best_sellers":
    case "new_arrivals":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: theme.layoutStyle.includes("modern") ? "grid-heavy catalog" : "curated product grid",
        title:
          type === "best_sellers"
            ? "Best sellers"
            : type === "new_arrivals"
              ? "New arrivals"
              : type === "featured_products"
                ? "Featured picks"
              : "Popular right now",
        subtitle: `${brief.businessName} keeps this assortment aligned with ${brief.targetAudience.toLowerCase()} in a ${designVariant?.direction ?? theme.uiMood} style.`,
        items: rotate(products, seed).slice(0, 8)
      };
    case "brand_story":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: "editorial split",
        title: "Our story",
        content: `${brief.businessName} brings ${brief.preferredStyle.toLowerCase()} design to ${brief.ecommerceType.toLowerCase()} shoppers with a ${brief.brandTone.toLowerCase()} brand voice and a ${designVariant?.direction ?? theme.uiMood} visual direction.`
      };
    case "trust_badges":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: "four-up grid",
        title: "Why customers trust us",
        items: [
          { label: "Secure checkout" },
          { label: "Fast fulfillment" },
          { label: "Curated assortment" },
          { label: "Easy returns" }
        ]
      };
    case "testimonials":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: "three-column editorial",
        title: "Loved by customers",
        items: [
          { name: "Aisha", quote: `The ${brief.businessName} experience feels polished from first click to delivery.` },
          { name: "Omar", quote: `The product mix feels specific, premium, and easy to shop.` },
          { name: "Sara", quote: `The design and checkout flow made the brand feel trustworthy immediately.` }
        ]
      };
    case "newsletter":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: "single-column minimal",
        title: `Get updates from ${brief.businessName}`,
        subtitle: "New drops, restocks, offers, and curated recommendations.",
        items: [{ placeholder: "you@domain.com", ctaLabel: "Subscribe" }]
      };
    case "faq":
      return {
        id: `section_${type}_${seed}`,
        type,
        layout: "stacked FAQ",
        title: "FAQ",
        items: [
          { q: "What makes this store different?", a: `${brief.businessName} focuses on ${brief.preferredStyle.toLowerCase()} products with a ${theme.uiMood} storefront.` },
          { q: "Who is this for?", a: `The assortment is built for ${brief.targetAudience.toLowerCase()}.` },
          { q: "What kind of products are available?", a: brief.productsOrServices },
          { q: "Can I shop by category?", a: "Yes, the storefront highlights categories, featured products, and browsing collections." }
        ]
      };
    default:
      return simpleSection(type, type.replace(/_/g, " "), "This section was generated locally as a fallback.");
  }
}

function simpleSection(type: string, title: string, content?: string, items?: unknown[]): Section {
  return {
    id: `section_${type}_${slugify(title)}`,
    type,
    title,
    content,
    items
  };
}

function deriveCategories(brief: WebsiteBrief) {
  const base = brief.productsOrServices
    .split(/,|\/| and /i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(toTitleCase);

  const categories = Array.from(new Set(base));
  if (categories.length >= 3) return categories.slice(0, 6);

  const fallbacks = ["Featured", "Essentials", "Best Sellers", "New Arrivals"];
  for (const fallback of fallbacks) {
    if (!categories.includes(fallback)) categories.push(fallback);
    if (categories.length >= 4) break;
  }
  return categories;
}

function hashText(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function rotate<T>(items: T[], seed: number) {
  if (items.length === 0) return items;
  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
