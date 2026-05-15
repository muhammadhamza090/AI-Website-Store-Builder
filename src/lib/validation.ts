import { z } from "zod";

export const websiteBriefSchema = z.object({
  businessName: z.string().min(2),
  industry: z.string().min(2),
  targetAudience: z.string().min(2),
  productsOrServices: z.string().min(2),
  preferredStyle: z.string().transform(v => v?.trim() || undefined).pipe(z.string().optional().default("AI will decide based on business")),
  preferredColors: z.string().optional().nullable(),
  ecommerceType: z.string().min(2),
  brandTone: z.string().transform(v => v?.trim() || undefined).pipe(z.string().optional().default("AI will decide based on business")),
  variationStrength: z.coerce.number().int().min(1).max(5).default(5)
});

export type WebsiteBrief = z.infer<typeof websiteBriefSchema>;
