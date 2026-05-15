import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional().default("size"),
  colorHex: z.string().optional().nullable(),
  inStock: z.boolean().optional().default(true),
  priceDelta: z.number().optional().nullable()
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  description: z.string().min(1),
  imagePrompt: z.string().min(1),
  badge: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().int().optional().nullable(),
  sizes: z.array(z.object({
    label: z.string(),
    priceDelta: z.number().default(0)
  })).optional().default([]),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    priceDelta: z.number().default(0)
  })).optional().default([]),
  variants: z.array(productVariantSchema).default([])
});

export type Product = z.infer<typeof productSchema>;

export const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  layout: z.string().optional().nullable(),
  cta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1)
    })
    .optional()
    .nullable(),
  items: z.array(z.any()).optional().nullable(),
  backgroundStyle: z.string().optional().nullable()
});

export type Section = z.infer<typeof sectionSchema>;

export const pageSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1),
  sections: z.array(sectionSchema).default([])
});

export type SitePage = z.infer<typeof pageSchema>;

export const generatedWebsiteSchema = z.object({
  site: z.object({
    id: z.string().min(1),
    businessName: z.string().min(1),
    industry: z.string().min(1),
    layoutStyle: z.string().min(1),
    colorPalette: z.object({
      primary: z.string().min(1),
      secondary: z.string().min(1),
      accent: z.string().min(1),
      background: z.string().min(1),
      text: z.string().min(1)
    }),
    typography: z.object({
      headingFont: z.string().min(1),
      bodyFont: z.string().min(1),
      style: z.string().min(1)
    }),
    pages: z.array(pageSchema).min(1)
  }),
  products: z.array(productSchema).min(1),
  meta: z
    .object({
      notes: z.string().optional(),
      generationStyle: z.string().optional()
    })
    .optional()
});

export type GeneratedWebsite = z.infer<typeof generatedWebsiteSchema>;

export const requiredPageSlugs = [
  "home",
  "shop",
  "product",
  "cart",
  "checkout",
  "about",
  "contact"
] as const;

