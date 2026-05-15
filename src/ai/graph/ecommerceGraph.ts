import {
  END,
  START,
  Annotation,
  StateGraph,
} from "@langchain/langgraph";
import type { WebsiteBrief } from "@/lib/validation";
import type { DesignVariant } from "@/lib/design-variant";
import {
  type WebsiteGraphState
} from "@/ai/graph/state";
import { analyzeBusiness } from "@/ai/graph/nodes/analyzeBusiness";
import { createStrategy } from "@/ai/graph/nodes/createStrategy";
import { createDesignSystem } from "@/ai/graph/nodes/createDesignSystem";
import { createSitemap } from "@/ai/graph/nodes/createSitemap";
import { createPagePlans } from "@/ai/graph/nodes/createPagePlans";
import { generateContent } from "@/ai/graph/nodes/generateContent";
import { generateProducts } from "@/ai/graph/nodes/generateProducts";
import { buildWebsiteHTML } from "@/ai/graph/nodes/buildWebsiteHTML";
import { validateWebsite } from "@/ai/graph/nodes/validateWebsite";
import { reviseWebsite } from "@/ai/graph/nodes/reviseWebsite";

type Logger = (entry: { nodeName: string; status: "start" | "success" | "error"; data?: unknown }) => void;

const GraphState = Annotation.Root({
  brief: Annotation<WebsiteBrief>(),
  designVariant: Annotation<DesignVariant>(),
  businessAnalysis: Annotation<WebsiteGraphState["businessAnalysis"]>(),
  strategy: Annotation<WebsiteGraphState["strategy"]>(),
  designSystem: Annotation<WebsiteGraphState["designSystem"]>(),
  sitemap: Annotation<WebsiteGraphState["sitemap"]>(),
  pagePlans: Annotation<WebsiteGraphState["pagePlans"]>(),
  content: Annotation<WebsiteGraphState["content"]>(),
  products: Annotation<WebsiteGraphState["products"]>(),
  website: Annotation<WebsiteGraphState["website"]>(),
  generatedHTML: Annotation<string | undefined>(),
  validation: Annotation<WebsiteGraphState["validation"]>(),
  errors: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  revisionCount: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 0
  }),
  logger: Annotation<Logger | undefined>()
});

function wrap(name: string, node: (state: WebsiteGraphState) => Promise<Partial<WebsiteGraphState>>) {
  return async (state: typeof GraphState.State) => {
    const logger = state.logger as unknown as Logger | undefined;
    logger?.({ nodeName: name, status: "start" });
    try {
      const result = await node(state as unknown as WebsiteGraphState);
      logger?.({ nodeName: name, status: "success", data: result });
      return result as Record<string, unknown>;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger?.({ nodeName: name, status: "error", data: { message } });
      const baseError = { errors: [`${name}: ${message}`] } as Record<string, unknown>;
      if (name === "reviseWebsite") {
        return {
          ...baseError,
          revisionCount: (state.revisionCount ?? 0) + 1
        };
      }
      return baseError;
    }
  };
}

const router = (state: typeof GraphState.State) => {
  // If HTML was generated (new path) — always go to END (validation already ran)
  if (state.generatedHTML) return END;
  // If old JSON website was generated — check validation
  if (state.website && state.validation?.ok) return END;
  // If there are errors AND nothing was generated — stop
  if (state.errors?.length && !state.generatedHTML && !state.website) return END;
  // If validation failed and revision limit not hit — revise
  if ((state.revisionCount ?? 0) >= 2) return END;
  return "reviseWebsite";
};

// ── GRAPH WITH PARALLEL BRANCHES ──────────────────────────────────────────────
// generateContent and generateProducts run IN PARALLEL after createPagePlans,
// then both converge into createDesignSystem before HTML generation.
const graph = new StateGraph(GraphState)
  .addNode("analyzeBusiness", wrap("analyzeBusiness", analyzeBusiness))
  .addNode("createStrategy", wrap("createStrategy", createStrategy))
  .addNode("createSitemap", wrap("createSitemap", createSitemap))
  .addNode("createPagePlans", wrap("createPagePlans", createPagePlans))
  .addNode("generateContent", wrap("generateContent", generateContent))
  .addNode("generateProducts", wrap("generateProducts", generateProducts))
  .addNode("createDesignSystem", wrap("createDesignSystem", createDesignSystem))
  .addNode("buildWebsiteHTML", wrap("buildWebsiteHTML", buildWebsiteHTML as (state: WebsiteGraphState) => Promise<Partial<WebsiteGraphState>>))
  .addNode("validateWebsite", wrap("validateWebsite", validateWebsite))
  .addNode("reviseWebsite", wrap("reviseWebsite", reviseWebsite))
  // Sequential: START → analyzeBusiness → createStrategy → createSitemap → createPagePlans
  .addEdge(START, "analyzeBusiness")
  .addEdge("analyzeBusiness", "createStrategy")
  .addEdge("createStrategy", "createSitemap")
  .addEdge("createSitemap", "createPagePlans")
  // PARALLEL: createPagePlans fans out to generateContent AND generateProducts
  .addEdge("createPagePlans", "generateContent")
  .addEdge("createPagePlans", "generateProducts")
  // CONVERGE: both feed into createDesignSystem (waits for both to complete)
  .addEdge("generateContent", "createDesignSystem")
  .addEdge("generateProducts", "createDesignSystem")
  // Sequential: createDesignSystem → buildWebsiteHTML → validateWebsite
  .addEdge("createDesignSystem", "buildWebsiteHTML")
  .addEdge("buildWebsiteHTML", "validateWebsite")
  .addConditionalEdges("validateWebsite", router)
  .addEdge("reviseWebsite", "validateWebsite")
  .compile();

export async function runEcommerceGraph(args: { brief: WebsiteBrief; designVariant: DesignVariant; logger?: Logger }) {
  const result = await graph.invoke(
    {
      brief: args.brief,
      designVariant: args.designVariant,
      revisionCount: 0,
      logger: args.logger
    },
    {
      recursionLimit: 100
    }
  );

  return result as unknown as WebsiteGraphState;
}
