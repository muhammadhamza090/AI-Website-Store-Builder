import { callClaudeStreaming, getClaudeClient, getClaudeModel } from "@/lib/claude";
import { websiteCodePrompt } from "@/ai/prompts/websiteCodePrompt";
import type { WebsiteGraphState } from "@/ai/graph/state";

export async function reviseWebsite(state: WebsiteGraphState): Promise<Partial<WebsiteGraphState>> {
  const client = getClaudeClient();
  const model = getClaudeModel();

  // ── HTML revision path (primary) ─────────────────────────────────────────────
  if (state.generatedHTML) {
    const validationIssues = [
      ...(state.validation?.errors ?? []),
      ...(state.validation?.warnings ?? [])
    ].join("\n  - ");

    // Send more of the original HTML so Claude can actually fix it
    const htmlPreview = state.generatedHTML.slice(0, 12000);
    const isTruncated = state.generatedHTML.length > 12000;

    const revisionBrief = [
      `You previously generated an HTML ecommerce website that failed validation.`,
      ``,
      `VALIDATION ISSUES TO FIX:`,
      `  - ${validationIssues}`,
      ``,
      `REVISION INSTRUCTIONS:`,
      `- Fix ALL the issues listed above`,
      `- Keep the same unique design direction and visual identity`,
      `- Keep the same color palette and typography`,
      `- Keep ALL real product data and content`,
      `- Return the COMPLETE revised HTML file (all 7 pages, CSS, JS)`,
      `- Start with <!DOCTYPE html>, end with </html>`,
      `- Minimum 15,000 characters`,
      ``,
      `CURRENT HTML (to revise):`,
      htmlPreview + (isTruncated ? "\n... [truncated — maintain the same structure and content for the rest]" : "")
    ].join("\n");

    let html = await callClaudeStreaming({
      client,
      model,
      max_tokens: 64000,
      temperature: 0.8,
      system: websiteCodePrompt,
      messages: [{ role: "user", content: revisionBrief }]
    });

    html = html.trim();
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    if (!html.toLowerCase().startsWith("<!doctype") && !html.toLowerCase().startsWith("<html")) {
      const start = html.toLowerCase().indexOf("<!doctype");
      if (start !== -1) html = html.slice(start);
    }

    return { generatedHTML: html, revisionCount: (state.revisionCount ?? 0) + 1 };
  }

  // ── Legacy JSON revision path (fallback) ─────────────────────────────────────
  // Skip revision for legacy JSON path — just increment count to end the loop
  return { revisionCount: (state.revisionCount ?? 0) + 1 };
}
