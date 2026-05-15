import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { businessPrompt } from "@/ai/prompts/businessPrompt";
import { businessAnalysisSchema, type WebsiteGraphState } from "@/ai/graph/state";

export async function analyzeBusiness(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    instruction:
      "Return JSON matching: { audienceSummary, brandPersonality, conversionGoal, pricePositioning, competitivePositioning, keyTrustSignals[], differentiators[] }. Analyze audience, brand personality, target conversion goal, trust signals, and competitive positioning for a professional ecommerce storefront."
  };

  const businessAnalysis = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 4096,
    temperature: 0.4,
    system: businessPrompt,
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "analyzeBusiness",
    validate: (data) => businessAnalysisSchema.parse(data),
  });

  return { businessAnalysis };
}
