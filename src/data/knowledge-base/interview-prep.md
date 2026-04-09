# Interview Preparation for OpenCX Customer Engineer

## About the Role

The Customer Engineer role at OpenCX is a hybrid position: part engineer, part customer-facing technical advisor. You are the bridge between enterprise customers and the product.

Key responsibilities:
- Primary technical contact for enterprise customers
- Lead onboarding and implementation
- Debug complex issues in live environments
- Write and ship production code (Node.js/TypeScript)
- Help customers optimize their AI agents through prompt engineering
- Collaborate with Product Engineering on customer-driven improvements

This is NOT pure support, and NOT pure internal development. It's both.

## What OpenCX Likely Does

OpenCX is an AI-native customer communication platform. Based on the job description:
- They build AI agents for customer support
- These agents integrate with tools like Zendesk, Intercom, HubSpot
- The platform likely provides: AI agent builder, knowledge base management, integration marketplace, analytics
- Customers are enterprise companies that want to automate their support
- Prompt engineering is a core feature — customers configure how their AI agents behave

## Key Topics to Master

### 1. AI Agents
Be ready to explain:
- What an AI agent is and how it differs from a simple chatbot
- The ReAct pattern (Reason → Act → Observe → Repeat)
- How agents use tools/function calling
- Agent loop with iteration limits
- Real-world agent challenges (hallucination, latency, cost)

### 2. RAG (Retrieval-Augmented Generation)
Be ready to explain:
- The full pipeline: chunk → embed → store → retrieve → generate
- Why RAG is essential for accurate responses
- Embeddings and vector similarity search
- Chunking strategies and their tradeoffs
- Common problems and how to fix them

### 3. Tools / Actions
Be ready to explain:
- How tool/function calling works with LLMs
- Tool schema design (JSON Schema, descriptions, parameters)
- Integration with Zendesk, Intercom, HubSpot APIs
- Error handling, idempotency, logging
- How tools enable agents to take real actions

### 4. System Prompts / Prompt Engineering
Be ready to explain:
- Anatomy of a system prompt (role, context, behavior, constraints)
- Prompt engineering techniques (few-shot, CoT, negative instructions)
- How to iterate and test prompts
- How prompt changes affect agent behavior
- Why this is crucial for customer success at OpenCX

## Likely Interview Questions

### Technical Questions
- "Walk me through how an AI agent handles a customer query from start to finish"
- "How does RAG work and why is it important?"
- "How would you debug an AI agent that's giving wrong answers?"
- "What's the difference between an AI agent and a chatbot?"
- "How would you help a customer improve their AI agent's response quality?"
- "Explain function calling / tool use in LLMs"

### Customer-Facing Questions
- "A customer's AI agent is hallucinating. How do you troubleshoot?"
- "How would you onboard a new customer onto the platform?"
- "A customer wants to integrate with Zendesk. Walk me through the process."
- "How do you balance customer requests with engineering priorities?"

### Coding Questions
- "Write a simple RAG retrieval function"
- "Implement a tool definition for an LLM"
- "Debug this API integration code"
- "Write an agent loop that handles tool calls"

## How to Talk About Your Experience

Structure your answers using the STAR method:
- **Situation**: Describe the context
- **Task**: What you needed to do
- **Action**: What you specifically did
- **Result**: What happened, metrics if possible

### Connecting Your Background
- Any experience with APIs and integrations → "I've built/debugged integrations with X"
- Experience with TypeScript/Node.js → "I write production TypeScript daily"
- Customer-facing work → "I've worked directly with customers to resolve technical issues"
- AI/LLM experience → "I've built applications using LLMs, including RAG and tool use"

## Day-of Tips

1. **Be hands-on**: If they ask how something works, explain it like you'd implement it, not like you'd read about it
2. **Show curiosity about the product**: Ask about their agent architecture, how customers configure prompts, what integrations are most popular
3. **Demonstrate customer empathy**: Show you understand that customers need simple, clear answers — not technical lectures
4. **Be honest about gaps**: If you don't know something, say "I haven't worked with that specifically, but here's how I'd approach learning it"
5. **Connect everything to OpenCX**: Every answer should tie back to how it helps their customers succeed

## Quick Reference: Key Terms

- **LLM**: Large Language Model (GPT-4, Claude, etc.)
- **ReAct**: Reasoning + Acting agent pattern
- **RAG**: Retrieval-Augmented Generation
- **Embeddings**: Numerical vectors representing text meaning
- **Vector Store**: Database optimized for similarity search
- **Cosine Similarity**: Math to compare two vectors (closer to 1 = more similar)
- **Chunking**: Splitting documents into smaller pieces for RAG
- **Function Calling**: LLM's ability to invoke external tools
- **System Prompt**: Instructions that define agent behavior
- **Few-Shot**: Including examples in the prompt
- **Chain of Thought (CoT)**: Having the model reason step-by-step
- **Hallucination**: When the LLM makes up false information
- **Grounding**: Ensuring responses are based on real data (via RAG)
- **Context Window**: Maximum input size for the LLM
- **Token**: Basic unit of text the LLM processes (~4 characters)
