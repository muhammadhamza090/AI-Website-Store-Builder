import { callClaudeJsonStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { contentPrompt } from "@/ai/prompts/contentPrompt";
import { generatedContentSchema, type WebsiteGraphState } from "@/ai/graph/state";

export async function generateContent(state: WebsiteGraphState) {
  const client = getClaudeClient();
  const model = getClaudeModel();

  const user = {
    brief: state.brief,
    designVariant: state.designVariant,
    businessAnalysis: state.businessAnalysis,
    strategy: state.strategy,
    pagePlans: state.pagePlans,
    instruction:
      "Return JSON matching GeneratedContent shape. Write professional, high-converting storefront copy for hero messaging, brand story, testimonials, trust badges, FAQ, newsletter invite, and footer copy. Make it business-specific and non-generic."
  };

  const content = await callClaudeJsonStreaming({
    client,
    model,
    max_tokens: 8192,
    temperature: 0.7,
    system: contentPrompt,
    messages: [
      { role: "user", content: JSON.stringify(user) }
    ],
    label: "generateContent",
    validate: (data) => generatedContentSchema.parse(data),
  });

  return { content };
}
