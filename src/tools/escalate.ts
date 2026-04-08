import type { ToolDefinition } from "../providers/types.js";

export const escalateDefinition: ToolDefinition = {
  name: "escalate_to_human",
  description:
    "Transfer the conversation to a human support agent. Use this when the customer explicitly asks for a human, is very frustrated, or the issue is too complex.",
  parameters: {
    type: "object",
    properties: {
      reason: {
        type: "string",
        description:
          "Why the conversation is being escalated (for the human agent's context)",
      },
    },
    required: ["reason"],
  },
};

export function escalateToHuman(args: Record<string, unknown>): string {
  // In a real system, this would trigger a handoff in Zendesk/Intercom
  return JSON.stringify({
    success: true,
    message:
      "The conversation has been transferred to a human agent. Estimated wait time: 2 minutes.",
    reason: args.reason,
    queuePosition: Math.floor(Math.random() * 5) + 1,
  });
}
