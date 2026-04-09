# AI Agents

## What is an AI Agent?

An AI agent is a system where a large language model (LLM) acts as the brain that can reason about problems, make decisions, and take actions autonomously. Unlike a simple chatbot that just generates text, an agent can use tools, call APIs, search databases, and perform multi-step workflows to solve complex tasks.

In the context of customer support (like OpenCX), an AI agent can: understand a customer's question, search the knowledge base, look up their order, create a support ticket, and compose a helpful response — all in one conversation turn.

## The ReAct Pattern

ReAct stands for "Reasoning + Acting." It's the most common pattern for building AI agents.

The loop works like this:
1. **Observe**: The agent receives the customer's message and any previous context
2. **Think**: The LLM reasons about what information it needs and what action to take
3. **Act**: The agent calls a tool (API call, database query, search)
4. **Observe again**: The tool result comes back
5. **Repeat or Respond**: The LLM decides whether it needs more information (loop back to Think) or has enough to give a final answer

This loop continues until the LLM decides it has enough information to respond, or a maximum iteration limit is hit (to prevent infinite loops).

## How Agents Work in Customer Support

In a platform like OpenCX, AI agents are used to:
- **Auto-resolve tickets**: The agent reads the customer's message, searches the knowledge base, and responds without human intervention
- **Triage and route**: The agent classifies the issue and routes it to the right team
- **Assist human agents**: The AI suggests responses, pulls up relevant docs, and pre-fills ticket fields
- **Handle integrations**: The agent interacts with tools like Zendesk, Intercom, or HubSpot on behalf of the customer

## Key Concepts

**Autonomy**: The agent decides which tools to use and in what order. You don't hardcode a fixed workflow — the LLM reasons about the best approach for each unique query.

**Tool Calling / Function Calling**: The mechanism by which the LLM requests to use a specific tool. The LLM outputs a structured JSON object with the tool name and arguments, the system executes the tool, and the result is fed back.

**Context Window**: The maximum amount of text the LLM can process at once. This includes the system prompt, conversation history, tool definitions, and tool results. Managing context is critical for agent performance.

**Max Iterations**: A safety limit on how many tool calls the agent can make per query. Typically 5-10. Prevents infinite loops and controls cost.

**Conversation Memory**: Agents maintain conversation history so they can reference earlier messages. In a stateless serverless environment, this history must be stored externally (Redis, database).

## Agent Architecture

A typical agent has these components:

1. **LLM Provider**: The API that provides reasoning (Claude, GPT-4, etc.)
2. **System Prompt**: Instructions that define the agent's behavior and personality
3. **Tool Registry**: A list of available tools with their schemas
4. **Agent Loop**: The orchestration logic that runs the ReAct cycle
5. **Memory/State**: Conversation history and session management
6. **Guardrails**: Safety checks to prevent harmful or off-topic responses

## What to Say in the Interview

When asked about AI agents:
- Explain the ReAct pattern clearly (Reason → Act → Observe → Repeat)
- Emphasize that agents are autonomous — the LLM decides what to do
- Mention practical concerns: iteration limits, cost management, error handling
- Talk about how agents differ from simple chatbots (multi-step reasoning, tool use)
- Show awareness of challenges: hallucination, latency, context window limits
- Connect it to customer support: auto-resolution, triage, human-agent assist
