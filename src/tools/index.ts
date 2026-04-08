/**
 * Tool Registry & Executor
 *
 * This is the central place where all tools are registered and dispatched.
 * The agent loop calls executeTool() whenever the LLM decides to use a tool.
 */

import type { ToolDefinition } from "../providers/types.js";
import { checkOrderDefinition, checkOrder } from "./check-order.js";
import { createTicketDefinition, createTicket } from "./create-ticket.js";
import { escalateDefinition, escalateToHuman } from "./escalate.js";
import { searchKBDefinition, searchKnowledgeBase } from "./search-kb.js";

// All available tools — the LLM sees these definitions and decides which to call
export const allTools: ToolDefinition[] = [
  searchKBDefinition,
  checkOrderDefinition,
  createTicketDefinition,
  escalateDefinition,
];

// Execute a tool by name with the given arguments
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "search_knowledge_base":
      return searchKnowledgeBase(args);
    case "check_order":
      return checkOrder(args);
    case "create_ticket":
      return createTicket(args);
    case "escalate_to_human":
      return escalateToHuman(args);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
