import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';

export function ToolsActionsContent() {
  return (
    <>
      <h2 id="what-are-tools">What Are Tools / Function Calling?</h2>
      <p>
        <strong>Tools</strong> (also called <strong>function calling</strong>) let an LLM request
        that your application execute specific functions on its behalf. The model doesn&apos;t run
        code directly &mdash; it outputs a structured JSON request saying &quot;call this function
        with these parameters,&quot; and your application executes it and returns the result.
      </p>
      <p>
        This is how AI agents take real actions: looking up customer data, processing refunds,
        creating tickets, sending emails. Without tools, an agent can only generate text.
      </p>

      <h2 id="how-tool-calling-works">How Tool Calling Works</h2>
      <p>Tool calling follows a 4-step flow:</p>
      <ol>
        <li><strong>Define:</strong> You describe available tools (name, description, parameters) and pass them to the LLM.</li>
        <li><strong>Decide:</strong> The LLM reads the user&apos;s message and decides which tool (if any) to call, outputting structured JSON.</li>
        <li><strong>Execute:</strong> Your application parses the tool call and runs the actual function.</li>
        <li><strong>Return:</strong> The function result goes back to the LLM, which uses it to formulate a response.</li>
      </ol>

      <h3 id="defining-tools">Step 1: Defining Tools</h3>
      <p>
        Tools are defined with a name, description, and a JSON schema for parameters. The
        description is critical &mdash; it&apos;s what the LLM uses to decide when to call the tool.
      </p>

      <CodeBlock
        filename="tool-definitions.ts"
        language="typescript"
        code={`import { tool } from 'ai';
import { z } from 'zod';

const tools = {
  lookupOrder: tool({
    description:
      'Look up a customer order by order ID. ' +
      'Use this when a customer asks about their order status, ' +
      'shipping, or delivery.',
    parameters: z.object({
      orderId: z
        .string()
        .describe('The order ID, e.g. ORD-12345'),
    }),
    execute: async ({ orderId }) => {
      const order = await db.orders.findById(orderId);
      if (!order) return { error: 'Order not found' };
      return {
        status: order.status,
        items: order.items,
        tracking: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
      };
    },
  }),

  issueRefund: tool({
    description:
      'Issue a refund for an order. Only use after confirming ' +
      'with the customer. Requires order ID and reason.',
    parameters: z.object({
      orderId: z.string().describe('The order ID to refund'),
      reason: z.string().describe('Reason for the refund'),
      amount: z
        .number()
        .optional()
        .describe('Partial refund amount. Omit for full refund.'),
    }),
    execute: async ({ orderId, reason, amount }) => {
      const result = await payments.refund({
        orderId,
        reason,
        amount,
      });
      return {
        success: result.success,
        refundId: result.id,
        amount: result.amount,
      };
    },
  }),

  searchKnowledgeBase: tool({
    description:
      'Search the help docs and knowledge base for answers ' +
      'to product questions, policy questions, or how-to guides.',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }) => {
      const results = await rag.search(query, { topK: 5 });
      return results.map((r) => ({
        title: r.title,
        content: r.text,
        source: r.url,
      }));
    },
  }),
};`}
      />

      <h3 id="tool-execution-flow">Steps 2&ndash;4: The Full Flow</h3>
      <p>
        Here&apos;s what happens at runtime when a customer says &quot;Where is my order
        ORD-12345?&quot;:
      </p>

      <CodeBlock
        language="typescript"
        code={`// The LLM sees the user message + tool definitions and outputs:
{
  "tool_calls": [{
    "id": "call_abc123",
    "name": "lookupOrder",
    "arguments": { "orderId": "ORD-12345" }
  }]
}

// Your app executes the tool and gets:
{
  "status": "shipped",
  "tracking": "1Z999AA10123456784",
  "estimatedDelivery": "2025-01-15"
}

// This result goes back to the LLM, which responds:
// "Your order ORD-12345 has been shipped! The tracking
//  number is 1Z999AA10123456784 and it should arrive
//  by January 15th."`}
      />

      <h2 id="common-support-tools">Common Tools for Customer Support</h2>
      <p>
        Most support agents need a core set of tools. Here are the most common ones:
      </p>
      <ul>
        <li>
          <strong>searchKnowledgeBase:</strong> RAG search over help docs and FAQs. The most
          frequently called tool &mdash; used to answer product and policy questions.
        </li>
        <li>
          <strong>lookupOrder / lookupCustomer:</strong> Fetch order status, customer account
          details, subscription info from your database or CRM.
        </li>
        <li>
          <strong>createTicket:</strong> Escalate to a human agent by creating a support ticket with
          context from the conversation.
        </li>
        <li>
          <strong>issueRefund / applyDiscount:</strong> Take financial actions. Usually gated with
          confirmation steps or dollar limits.
        </li>
        <li>
          <strong>updateAccount:</strong> Change email, address, subscription plan, or other account
          details.
        </li>
        <li>
          <strong>sendEmail / sendNotification:</strong> Trigger transactional emails like order
          confirmations or password reset links.
        </li>
        <li>
          <strong>transferToHuman:</strong> Hand off the conversation to a live agent when the AI
          can&apos;t resolve the issue.
        </li>
      </ul>

      <h2 id="integrations">Integration with Support Platforms</h2>

      <h3 id="zendesk">Zendesk</h3>
      <p>
        Zendesk&apos;s REST API lets you manage tickets, users, and organizations. Common
        integrations: create/update tickets via <code>POST /api/v2/tickets</code>, search tickets
        via <code>GET /api/v2/search</code>, and add internal notes. Authentication uses API tokens
        or OAuth. Webhooks notify your agent of new tickets or replies.
      </p>

      <h3 id="intercom">Intercom</h3>
      <p>
        Intercom&apos;s API centers around conversations and contacts. Create replies via
        <code>POST /conversations/{'{id}'}/reply</code>, search contacts, and manage tags.
        Intercom&apos;s webhook events (<code>conversation.user.created</code>,
        <code>conversation.user.replied</code>) trigger your agent to respond. Authentication uses
        access tokens.
      </p>

      <h3 id="hubspot">HubSpot</h3>
      <p>
        HubSpot&apos;s CRM API provides access to contacts, companies, deals, and tickets. Create
        tickets via <code>POST /crm/v3/objects/tickets</code>, look up contacts via
        <code>GET /crm/v3/objects/contacts</code>. HubSpot also offers a Conversations API for
        chat-based support. Uses OAuth 2.0 or private app tokens.
      </p>

      <h2 id="building-good-tools">Building Good Tools</h2>

      <h3 id="clear-descriptions">Write Clear Descriptions</h3>
      <p>
        The tool description is the LLM&apos;s primary way of knowing when to use a tool. Be
        specific about <em>when</em> to use it and what it does.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Bad — too vague
description: 'Get order info'

// Good — tells the LLM exactly when to use it
description:
  'Look up a customer order by order ID (e.g. ORD-12345). ' +
  'Use when the customer asks about order status, shipping, ' +
  'tracking, delivery date, or order contents. ' +
  'Do NOT use for return or refund requests.'`}
      />

      <h3 id="parameter-descriptions">Describe Parameters Clearly</h3>
      <p>
        Use Zod&apos;s <code>.describe()</code> to explain each parameter. Include format examples
        and constraints. This helps the LLM extract the right values from conversation context.
      </p>

      <h3 id="error-handling">Handle Errors Gracefully</h3>
      <p>
        Tools should never throw unhandled errors &mdash; always return structured error responses
        so the LLM can communicate the issue to the customer.
      </p>

      <CodeBlock
        filename="error-handling.ts"
        language="typescript"
        code={`execute: async ({ orderId }) => {
  try {
    const order = await db.orders.findById(orderId);
    if (!order) {
      return {
        error: 'ORDER_NOT_FOUND',
        message: \`No order found with ID \${orderId}\`,
      };
    }
    return { status: order.status, items: order.items };
  } catch (err) {
    return {
      error: 'LOOKUP_FAILED',
      message: 'Unable to look up the order right now.',
    };
  }
}`}
      />

      <Callout type="warning" title="Security Note">
        <p>
          Always validate and sanitize tool inputs on the server side. The LLM generates the
          parameters, so treat them like untrusted user input. Implement rate limits, dollar caps on
          financial actions, and confirmation steps for destructive operations.
        </p>
      </Callout>

      <Callout type="tip" title="Interview Tip">
        <p>
          Expect questions like &quot;How would you design the tools for a support agent?&quot;
          Start with the most common tools (knowledge search, order lookup, ticket creation), then
          discuss safety guardrails (confirmation for destructive actions, dollar limits, error
          handling). Mention that tool descriptions are as important as the tool code itself &mdash;
          they&apos;re the &quot;API docs&quot; for the LLM. If asked about integrations, show you
          know the REST API patterns (endpoints, auth, webhooks) even if you haven&apos;t used that
          specific platform.
        </p>
      </Callout>
    </>
  );
}

export const toolsActionsPages = {
  'tools-actions': {
    title: 'Tools & Function Calling',
    description: 'How LLM tool calling works, common support tools, and integration patterns.',
    section: 'Core Concepts',
    headings: [
      { id: 'what-are-tools', title: 'What Are Tools / Function Calling?', level: 2 },
      { id: 'how-tool-calling-works', title: 'How Tool Calling Works', level: 2 },
      { id: 'defining-tools', title: 'Step 1: Defining Tools', level: 3 },
      { id: 'tool-execution-flow', title: 'Steps 2\u20134: The Full Flow', level: 3 },
      { id: 'common-support-tools', title: 'Common Tools for Customer Support', level: 2 },
      { id: 'integrations', title: 'Integration with Support Platforms', level: 2 },
      { id: 'zendesk', title: 'Zendesk', level: 3 },
      { id: 'intercom', title: 'Intercom', level: 3 },
      { id: 'hubspot', title: 'HubSpot', level: 3 },
      { id: 'building-good-tools', title: 'Building Good Tools', level: 2 },
      { id: 'clear-descriptions', title: 'Write Clear Descriptions', level: 3 },
      { id: 'parameter-descriptions', title: 'Describe Parameters Clearly', level: 3 },
      { id: 'error-handling', title: 'Handle Errors Gracefully', level: 3 },
    ],
    content: ToolsActionsContent,
  },
};
