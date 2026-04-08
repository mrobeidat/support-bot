import type { ToolDefinition } from "../providers/types.js";
import { retrieve } from "../rag/retrieve.js";

export const searchKBDefinition: ToolDefinition = {
  name: "search_knowledge_base",
  description:
    "Search the company knowledge base for information about products, policies, shipping, returns, pricing, accounts, and support. Returns relevant articles and sections.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query — what the customer is asking about",
      },
    },
    required: ["query"],
  },
};

export async function searchKnowledgeBase(
  args: Record<string, unknown>
): Promise<string> {
  const query = String(args.query);
  const results = await retrieve(query, 3);

  if (results.length === 0) {
    return JSON.stringify({
      found: false,
      message: "No relevant articles found in the knowledge base.",
    });
  }

  return JSON.stringify({
    found: true,
    results: results.map((r) => ({
      source: r.source,
      content: r.content,
      relevanceScore: r.score.toFixed(3),
    })),
  });
}
