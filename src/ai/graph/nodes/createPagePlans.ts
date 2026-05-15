import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { pagePlansSchema, type WebsiteGraphState } from "@/ai/graph/state";

export async function createPagePlans(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    designVariant: state.designVariant,
    businessAnalysis: state.businessAnalysis,
    strategy: state.strategy,
    sitemap: state.sitemap,
    instruction:
      "Return JSON array of page plans: [{slug,title,type,sections:[{type,intent,layout,required?}]}]. Make homepage have at least 8 sections and vary section order per business. Use section-level intent to create a polished storefront UX. IMPORTANT: Keep intent and layout values SHORT — max 1-2 sentences each. Do not write paragraphs. Avoid generic fixed patterns. Use designVariant to create materially different composition styles across generations."
  };

  const pagePlans = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 16384,
    temperature: 0.5,
    system:
      "You plan ecommerce pages and sections. Create business-specific section order and layouts for a polished storefront experience. Return ONLY a valid JSON array — no markdown fences, no explanation, no preamble text. Start your response with [ and end with ]. The response must be a JSON array of page plan objects.",
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "createPagePlans",
    validate: (data) => pagePlansSchema.parse(data),
  });

  return { pagePlans };
}
