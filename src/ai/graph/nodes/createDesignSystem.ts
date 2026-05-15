import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { designPrompt } from "@/ai/prompts/designPrompt";
import { designSystemSchema, type WebsiteGraphState } from "@/ai/graph/state";

export async function createDesignSystem(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    storeContext: {
      businessName: state.brief.businessName,
      industry: state.brief.industry,
      ecommerceType: state.brief.ecommerceType,
      targetAudience: state.brief.targetAudience,
      preferredStyle: state.brief.preferredStyle,
      preferredColors: state.brief.preferredColors ?? undefined,
      brandTone: state.brief.brandTone,
      productsOrServices: state.brief.productsOrServices
    },
    designVariant: state.designVariant,
    businessAnalysis: state.businessAnalysis,
    strategy: state.strategy,
    sitemap: state.sitemap,
    pagePlans: state.pagePlans,
    content: state.content,
    sampleProducts: state.products?.slice(0, 6),
    preferredColors: state.brief.preferredColors ?? undefined,
    instruction:
      "Return JSON matching: { layoutStyle, colorPalette{primary,secondary,accent,background,text}, typography{headingFont,bodyFont,style}, uiMood, heroStyle, productCardStyle, buttonStyle, navigationStyle, spacingScale, hierarchy, mobileLayout, brandVoice, accessibilityNotes[] }. Colors must be hex. Fonts must be real Google Fonts names. Use the designVariant's creative attributes (layoutBias, paletteBias, heroApproach, typographyApproach, sectionMood, productPresentation, navigationApproach, buttonApproach) as creative inspiration to generate a COMPLETELY UNIQUE design system that has never been created before. The design must feel custom-made for this specific business."
  };

  const designSystem = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 4096,
    temperature: 0.9,
    system: designPrompt,
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "createDesignSystem",
    validate: (data) => designSystemSchema.parse(data),
  });

  return { designSystem };
}
