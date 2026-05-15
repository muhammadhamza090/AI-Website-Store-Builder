import { z } from "zod";
import { websiteBriefSchema, type WebsiteBrief } from "@/lib/validation";
import { generatedWebsiteSchema, productSchema, type GeneratedWebsite, type Product } from "@/lib/site-schema";
import type { DesignVariant } from "@/lib/design-variant";

export type BusinessAnalysis = {
  audienceSummary: string;
  brandPersonality: string;
  conversionGoal: string;
  pricePositioning: string;
  competitivePositioning: string;
  keyTrustSignals: string[];
  differentiators: string[];
};

export type EcommerceStrategy = {
  funnel: string;
  primaryCTA: string;
  secondaryCTA: string;
  merchandisingAngle: string;
  trustSectionIdeas: string[];
  urgencyPatterns: string[];
  homepageNarrative: string;
};

export type DesignSystem = {
  layoutStyle: string;
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
  uiMood: string;
  heroStyle: string;
  productCardStyle: string;
  buttonStyle: string;
  navigationStyle: string;
  spacingScale: string;
  hierarchy: string;
  mobileLayout: string;
  brandVoice: string;
  accessibilityNotes: string[];
};

export type SitemapPage = {
  slug: string;
  title: string;
  type: string;
};

export type PagePlan = {
  slug: string;
  title: string;
  type: string;
  sections: Array<{
    type: string;
    intent: string;
    layout: string;
    required?: boolean;
  }>;
};

export type GeneratedContent = {
  globals: {
    announcement?: string;
    newsletterHeading: string;
    newsletterBody: string;
    footerBlurb: string;
    supportLinks: string[];
    policyLinks: string[];
    socialLinks: Array<{ label: string; href: string }>;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaLabel: string;
    heroSecondaryCtaLabel?: string;
    brandStory: string;
    testimonials: Array<{ name: string; quote: string }>;
    trustBadges: string[];
    faq: Array<{ q: string; a: string }>;
  };
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings?: string[];
};

export type WebsiteGraphState = {
  brief: WebsiteBrief;
  designVariant?: DesignVariant;
  businessAnalysis?: BusinessAnalysis;
  strategy?: EcommerceStrategy;
  designSystem?: DesignSystem;
  sitemap?: SitemapPage[];
  pagePlans?: PagePlan[];
  content?: GeneratedContent;
  products?: Product[];
  website?: GeneratedWebsite;
  generatedHTML?: string;
  validation?: ValidationResult;
  errors?: string[];
  revisionCount: number;
};

export const businessAnalysisSchema = z.object({
  audienceSummary: z.string(),
  brandPersonality: z.string(),
  conversionGoal: z.string(),
  pricePositioning: z.string(),
  competitivePositioning: z.string(),
  keyTrustSignals: z.array(z.string()).default([]),
  differentiators: z.array(z.string()).default([])
});

export const ecommerceStrategySchema = z.object({
  funnel: z.string(),
  primaryCTA: z.string(),
  secondaryCTA: z.string(),
  merchandisingAngle: z.string(),
  trustSectionIdeas: z.array(z.string()).default([]),
  urgencyPatterns: z.array(z.string()).default([]),
  homepageNarrative: z.string()
});

export const designSystemSchema = z.object({
  layoutStyle: z.string(),
  colorPalette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string()
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    style: z.string()
  }),
  uiMood: z.string(),
  heroStyle: z.string(),
  productCardStyle: z.string(),
  buttonStyle: z.string(),
  navigationStyle: z.string(),
  spacingScale: z.string(),
  hierarchy: z.string(),
  mobileLayout: z.string(),
  brandVoice: z.string(),
  accessibilityNotes: z.array(z.string()).min(1)
});

export const sitemapSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string(),
    type: z.string()
  })
);

export const pagePlansSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string(),
    type: z.string(),
    sections: z.array(
      z.object({
        type: z.string(),
        intent: z.string(),
        layout: z.string(),
        required: z.boolean().optional()
      })
    )
  })
);

export const generatedContentSchema = z.object({
  globals: z.object({
    announcement: z.string().optional(),
    newsletterHeading: z.string(),
    newsletterBody: z.string(),
    footerBlurb: z.string(),
    supportLinks: z.array(z.string()).default([]),
    policyLinks: z.array(z.string()).default([]),
    socialLinks: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .default([])
  }),
  home: z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    heroCtaLabel: z.string(),
    heroSecondaryCtaLabel: z.string().optional(),
    brandStory: z.string(),
    testimonials: z.array(z.object({ name: z.string(), quote: z.string() })).default([]),
    trustBadges: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([])
  })
});

export const websiteBriefZod = websiteBriefSchema;
export const productZod = productSchema;
export const websiteZod = generatedWebsiteSchema;
