import type { ToolDefinition } from "../providers/types.js";

let ticketCounter = 1000;

export const createTicketDefinition: ToolDefinition = {
  name: "create_ticket",
  description:
    "Create a support ticket for issues that need follow-up. Returns the ticket ID for the customer to reference.",
  parameters: {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description: "Brief subject line for the ticket",
      },
      description: {
        type: "string",
        description: "Detailed description of the customer's issue",
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high", "urgent"],
        description: "Ticket priority level",
      },
    },
    required: ["subject", "description", "priority"],
  },
};

export function createTicket(args: Record<string, unknown>): string {
  ticketCounter++;
  const ticketId = `TKT-${ticketCounter}`;

  // In a real system, this would call Zendesk/Intercom/HubSpot API
  return JSON.stringify({
    success: true,
    ticketId,
    subject: args.subject,
    priority: args.priority,
    message: `Ticket ${ticketId} created successfully. A support specialist will follow up within 4 hours.`,
  });
}
