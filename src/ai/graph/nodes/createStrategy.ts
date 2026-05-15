import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { ecommerceStrategySchema, type WebsiteGraphState } from "@/ai/graph/state";

export async function createStrategy(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    designVariant: state.designVariant,
    businessAnalysis: state.businessAnalysis,
    instruction:
      "Return JSON matching: { funnel, primaryCTA, secondaryCTA, merchandisingAngle, trustSectionIdeas[], urgencyPatterns[], homepageNarrative }. Build a conversion-focused strategy with funnel, CTAs, merchandising angle, homepage narrative, trust patterns, and urgency patterns."
  };

  const strategy = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 4096,
    temperature: 0.4,
    system:
      "You are an ecommerce growth strategist. Propose a differentiated, conversion-focused storefront strategy tailored to the business. Return ONLY valid JSON — no markdown fences, no explanation, no preamble. Start your response with { and end with }. The funnel must be a single string summarizing the customer journey, and homepageNarrative must be a single string. Use trust-building and urgency thoughtfully without sounding spammy. Do not include nested objects for these values.",
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "createStrategy",
    validate: (data) => ecommerceStrategySchema.parse(data),
  });

  return { strategy };
}
