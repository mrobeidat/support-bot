# Tools and Actions

## What Are Tools?

Tools (also called "function calling" or "actions") are functions that an AI agent can invoke to interact with external systems. The LLM doesn't execute the tools directly — it outputs a structured request (JSON) saying "I want to call this tool with these arguments," and the host application executes it.

This is the key mechanism that makes AI agents useful beyond just generating text. An agent with tools can:
- Search a knowledge base
- Look up customer orders
- Create support tickets
- Send messages
- Call third-party APIs (Zendesk, Intercom, HubSpot)
- Query databases

## How Tool Calling Works

### Step 1: Define Tools

You describe each tool using a JSON Schema. This tells the LLM what tools are available, what they do, and what parameters they accept:

```json
{
  "name": "search_knowledge_base",
  "description": "Search the company knowledge base for relevant help articles",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query"
      }
    },
    "required": ["query"]
  }
}
```

### Step 2: LLM Decides to Use a Tool

When the LLM processes a message, it can either:
- Respond directly with text (if it has enough info)
- Request to call one or more tools (if it needs more info)

The LLM returns something like:
```json
{
  "tool_calls": [{
    "id": "call_123",
    "name": "search_knowledge_base",
    "arguments": { "query": "return policy for damaged items" }
  }]
}
```

### Step 3: Execute and Return

Your code executes the tool and sends the result back to the LLM:
```json
{
  "role": "tool",
  "tool_call_id": "call_123",
  "content": "Return Policy: Items can be returned within 30 days..."
}
```

### Step 4: LLM Generates Final Response

The LLM now has the tool result and can compose an accurate, grounded response to the customer.

## Common Tools for Customer Support Agents

### Knowledge Base Search
- Searches help articles, FAQs, product docs
- Uses RAG (vector search) for semantic matching
- Returns relevant sections with source citations

### Order/Account Lookup
- Looks up customer info by email, order ID, etc.
- Returns status, details, history
- Often integrates with your own database or CRM

### Ticket Management
- Creates, updates, or closes support tickets
- Assigns priority and category
- Routes to the right team

### Escalation
- Transfers the conversation to a human agent
- Includes context summary so the human doesn't start from scratch

## Integration with Support Platforms

### Zendesk
- REST API for tickets, users, organizations
- Webhooks for real-time events
- AI agent can create/update tickets, search help center articles
- Custom fields and tags for routing

### Intercom
- REST API for conversations, contacts, articles
- Webhooks for conversation events
- AI agent can reply to conversations, tag users, create tickets
- Custom bots and workflows

### HubSpot
- REST API for contacts, tickets, knowledge base
- AI agent can create contacts, log activities, update deals
- CRM integration for full customer context

## Building Good Tools

### Clear Descriptions
The tool description is critical — it's how the LLM decides WHEN to use the tool. Write descriptions that explain:
- What the tool does
- When to use it
- What it returns

Bad: `"description": "Search"`
Good: `"description": "Search the knowledge base for help articles. Use this when the customer asks about policies, features, or how-to questions."`

### Parameter Design
- Use descriptive parameter names
- Include helpful descriptions for each parameter
- Mark required vs optional parameters
- Use enums for constrained values (e.g., priority: "low" | "medium" | "high")

### Error Handling
Tools can fail (API down, invalid input, timeout). Always:
- Return clear error messages the LLM can understand
- Let the LLM decide how to handle the error (retry, fallback, tell the customer)
- Set timeouts to prevent hanging

### Idempotency
Some tools create side effects (creating tickets, sending messages). Make sure:
- The LLM doesn't accidentally call the same tool multiple times
- Destructive actions have confirmation steps
- You log all tool calls for auditing

## What to Say in the Interview

When asked about tools/actions:
- Explain the flow: Define schema → LLM decides → Execute → Return result → LLM responds
- Emphasize that the LLM chooses which tools to use (not hardcoded)
- Talk about tool design: clear descriptions, good parameter schemas
- Mention specific integrations: Zendesk, Intercom, HubSpot APIs
- Discuss error handling and safety (timeouts, idempotency, logging)
- For OpenCX: tools are how the AI agent interacts with customer support systems
