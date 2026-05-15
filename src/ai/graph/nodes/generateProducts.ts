import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { z } from "zod";
import { productZod, type WebsiteGraphState } from "@/ai/graph/state";

const productsSchema = z.array(productZod).min(8);

export async function generateProducts(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    businessAnalysis: state.businessAnalysis,
    strategy: state.strategy,
    instruction:
      `Return JSON array of 10-16 products. Each product MUST include:
  - id, name, category, price (base price), description, imagePrompt
  - compareAtPrice (original price if on sale, e.g. 79.99 when price is 59.99 — set on 30-50% of products, null for others)
  - badge (optional: "New", "Sale", "Bestseller", "Limited Edition", null)
  - rating (4.0 to 5.0)
  - reviewCount (integer 12-847, higher for bestsellers)

  ═══ VARIANT SELECTORS — BE INDUSTRY-SMART! ═══
  sizes and colors MUST be appropriate to the PRODUCT TYPE. Do NOT blindly add "S/M/L/XL" to every product.

  "sizes" field = array of {label, priceDelta} — use the RIGHT label type for the product:
    👕 Clothing/Apparel → S, M, L, XL, XXL
    🕯️ Candles/Fragrance → 4oz, 8oz, 12oz, 16oz  OR  Travel, Standard, Large
    🪑 Furniture → Single, Double, Queen, King  OR  Small, Medium, Large
    🖼️ Art/Prints/Posters → 8×10, 11×14, 16×20, 24×36
    ☕ Coffee/Tea/Beverages → 8oz, 12oz, 16oz, 32oz  OR  100g, 250g, 500g, 1kg
    💻 Electronics → 64GB, 128GB, 256GB, 512GB
    💍 Jewelry/Rings → 5, 6, 7, 8, 9, 10 (ring sizes)
    🧴 Skincare/Beauty → 30ml, 50ml, 100ml
    📦 If size doesn't apply (e.g., a single wall clock, a specific art piece) → use EMPTY array []
    Larger/bigger options MUST cost more (positive priceDelta). Smallest = priceDelta:0.

  "colors" field = array of {name, hex, priceDelta} — use the RIGHT variant type:
    👕 Clothing → actual colors (Black, Navy, Burgundy, etc.)
    🕯️ Candles → scent variants presented as "colors" for UI (Vanilla Cream:#f5e6d3, Lavender:#9b8bb4, Ocean Breeze:#87ceeb)
    🪑 Furniture → material/finish (Natural Oak:#c19a6b, Dark Walnut:#5c4033, Matte White:#f5f5f5, Ebony:#3d3635)
    🖼️ Art/Prints → frame options (No Frame:#ffffff, Black Frame:#1a1a1a, Oak Frame:#c19a6b, White Frame:#f0f0f0)
    💻 Electronics → device colors (Space Grey:#717378, Silver:#c0c0c0, Midnight:#0d1117)
    💍 Jewelry → metal (Gold:#ffd700, Silver:#c0c0c0, Rose Gold:#b76e79, Platinum:#e5e4e2)
    🧴 Skincare → NOT applicable, use EMPTY array []
    📦 If color/variant doesn't apply → use EMPTY array []
    Premium finishes/materials should have priceDelta:5-20. Standard = priceDelta:0.

  - variants: array of {id, name, type, priceDelta, colorHex, inStock} combining applicable variant combos
    IMPORTANT: "type" must be one of: "size", "color", "material", "style" — do NOT use compound types like "size+frame" or "size+finish".

CRITICAL: Think like a real Shopify store owner — only add variant selectors that MAKE SENSE for each product. A candle doesn't need "S/M/L" clothing sizes. A wall art piece doesn't need "Navy Blue" color options. Be smart about it.
The displayed price formula: basePrice + selectedSizePriceDelta + selectedColorPriceDelta.`
  };

  const products = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 16384,
    temperature: 0.5,
    system:
      "You generate realistic sample product catalogs for ecommerce demos. Return ONLY a valid JSON array — no markdown fences, no explanation, no preamble. Start your response with [ and end with ]. Each product must include id, name, category, price, description, imagePrompt, sizes (as {label,priceDelta} objects), and colors (as {name,hex,priceDelta} objects). BE INDUSTRY-SMART: use appropriate variant types for the product category — candles get weight sizes not clothing sizes, furniture gets material finishes not fabric colors, art gets print dimensions and frame options. Pens/pencils/stationery do NOT get S/M/L sizes — use empty array []. Products that don't logically have a variant type should use an empty array []. Make the assortment feel curated, professional, and aligned with the store's merchandising angle.",
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "generateProducts",
    validate: (data) => productsSchema.parse(data),
  });

  return { products };
}
