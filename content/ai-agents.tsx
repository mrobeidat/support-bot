import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';

export function AIAgentsContent() {
  return (
    <>
      <h2 id="what-is-an-ai-agent">What Is an AI Agent?</h2>
      <p>
        An <strong>AI agent</strong> is a system that uses a large language model (LLM) as its
        reasoning engine to decide what actions to take and in what order. Unlike a simple chatbot
        that just generates text responses, an agent can <strong>observe</strong> its environment,
        <strong>reason</strong> about what to do, and <strong>act</strong> by calling external tools.
      </p>
      <p>
        Think of it this way: a chatbot is like a customer service rep who can only talk. An agent is
        like a rep who can talk <em>and</em> look up your order, issue a refund, update your address,
        and escalate to a human &mdash; all within the same conversation.
      </p>

      <h3 id="agent-vs-chatbot">Agent vs. Chatbot</h3>
      <ul>
        <li>
          <strong>Chatbot:</strong> Input &rarr; LLM &rarr; Text response. No tools, no memory
          beyond the conversation, no ability to take action.
        </li>
        <li>
          <strong>Agent:</strong> Input &rarr; LLM reasons &rarr; Calls tools &rarr; Observes
          results &rarr; Reasons again &rarr; Responds (or takes more actions). Has tool access,
          contextual knowledge, and can loop until the task is done.
        </li>
      </ul>

      <h2 id="react-pattern">The ReAct Pattern</h2>
      <p>
        The most common agent architecture is the <strong>ReAct</strong> (Reason + Act) pattern. The
        agent operates in a loop:
      </p>
      <ol>
        <li><strong>Reason:</strong> The LLM thinks about what to do next based on the user&apos;s request and any observations so far.</li>
        <li><strong>Act:</strong> The LLM calls a tool (e.g., search knowledge base, look up order).</li>
        <li><strong>Observe:</strong> The tool returns a result, which gets added to the conversation context.</li>
        <li><strong>Repeat</strong> until the agent has enough information to give a final answer.</li>
      </ol>

      <CodeBlock
        filename="agent-loop.ts"
        language="typescript"
        code={`import { generateText } from 'ai';

async function agentLoop(userMessage: string, tools: Tools) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    const response = await generateText({
      model: openai('gpt-4o'),
      messages,
      tools,
    });

    // If the model wants to call a tool
    if (response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        const result = await executeTool(
          toolCall.name,
          toolCall.args
        );

        // Add tool result back to context
        messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          toolCallId: toolCall.id,
        });
      }
      iterations++;
    } else {
      // No more tool calls — return final answer
      return response.text;
    }
  }

  return "I've reached my limit. Let me hand this off.";
}`}
      />

      <Callout type="info" title="Why a Loop?">
        <p>
          Agents rarely solve problems in one step. A support agent might first search the knowledge
          base, then look up the customer&apos;s account, then check their subscription status
          &mdash; each step informing the next. The loop lets the LLM chain together as many steps
          as needed.
        </p>
      </Callout>

      <h2 id="agent-architecture">Agent Architecture</h2>
      <p>
        A production agent has several key components working together. Here&apos;s how they fit:
      </p>

      <CodeBlock
        language="text"
        code={`┌─────────────────────────────────────────────┐
│                  AI Agent                    │
│                                              │
│  ┌──────────────┐    ┌───────────────────┐   │
│  │ System Prompt │    │  Context Window   │   │
│  │ (personality, │    │  (conversation +  │   │
│  │  rules, tone) │    │   tool results)   │   │
│  └──────┬───────┘    └────────┬──────────┘   │
│         │                     │               │
│         ▼                     ▼               │
│  ┌──────────────────────────────────────┐    │
│  │            LLM (GPT-4o)             │    │
│  │     Reasoning & Decision Engine      │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│         ┌───────┴────────┐                    │
│         ▼                ▼                    │
│  ┌────────────┐  ┌──────────────┐            │
│  │   Tools     │  │  Knowledge   │            │
│  │ (actions)   │  │  Base (RAG)  │            │
│  └────────────┘  └──────────────┘            │
│   - Look up order   - Product docs           │
│   - Issue refund     - FAQ articles           │
│   - Send email       - Policy docs            │
│   - Escalate         - Troubleshooting        │
└─────────────────────────────────────────────┘`}
      />

      <h2 id="agents-in-support">Agents in Customer Support</h2>
      <p>
        In the OpenCX context, AI agents handle customer conversations by combining several
        capabilities:
      </p>
      <ul>
        <li>
          <strong>Knowledge retrieval (RAG):</strong> Search product documentation and help articles
          to answer questions accurately, rather than hallucinating answers.
        </li>
        <li>
          <strong>Tool calling:</strong> Take real actions like looking up orders, updating accounts,
          processing refunds, or creating support tickets.
        </li>
        <li>
          <strong>Conversation management:</strong> Maintain context across a conversation, handle
          follow-up questions, and know when to escalate to a human agent.
        </li>
        <li>
          <strong>Multi-channel:</strong> Work across chat widgets, email, Slack, and other channels
          with consistent behavior.
        </li>
      </ul>

      <h2 id="key-concepts">Key Concepts</h2>

      <h3 id="autonomy">Autonomy</h3>
      <p>
        How much freedom the agent has to act on its own. In support, this is carefully calibrated
        &mdash; an agent might autonomously answer product questions but require confirmation before
        issuing a refund over $100.
      </p>

      <h3 id="tool-calling">Tool Calling</h3>
      <p>
        The mechanism by which the LLM requests to execute external functions. The model outputs a
        structured JSON object with the tool name and parameters, your code executes it, and the
        result goes back to the model. This is how agents take action in the real world.
      </p>

      <h3 id="context-window">Context Window</h3>
      <p>
        The maximum amount of text (tokens) the LLM can process at once. This includes the system
        prompt, conversation history, tool results, and retrieved documents. GPT-4o has a 128K token
        context window. Managing this effectively is critical &mdash; if you stuff too much in, the
        model loses focus; too little, and it lacks information.
      </p>

      <h3 id="max-iterations">Max Iterations</h3>
      <p>
        A safety limit on how many reasoning/action loops the agent can perform. Without this, a
        confused agent could loop forever, burning tokens and time. Typical limits are 5&ndash;15
        iterations. If the agent hits the limit, it should gracefully hand off to a human.
      </p>

      <Callout type="tip" title="Interview Tip">
        <p>
          When discussing agents, emphasize the <strong>ReAct loop</strong> &mdash; it shows you
          understand the core mechanism. Be ready to explain why agents need a loop (multi-step
          reasoning), why max iterations matter (cost and safety), and how agents differ from simple
          prompt-response chatbots. If asked to whiteboard an agent, draw the architecture diagram
          above and walk through a concrete example like &quot;customer asks for a refund.&quot;
        </p>
      </Callout>
    </>
  );
}

export const aiAgentsPages = {
  'ai-agents': {
    title: 'AI Agents',
    description: 'How AI agents work: the ReAct pattern, architecture, and key concepts for customer support.',
    section: 'Core Concepts',
    headings: [
      { id: 'what-is-an-ai-agent', title: 'What Is an AI Agent?', level: 2 },
      { id: 'agent-vs-chatbot', title: 'Agent vs. Chatbot', level: 3 },
      { id: 'react-pattern', title: 'The ReAct Pattern', level: 2 },
      { id: 'agent-architecture', title: 'Agent Architecture', level: 2 },
      { id: 'agents-in-support', title: 'Agents in Customer Support', level: 2 },
      { id: 'key-concepts', title: 'Key Concepts', level: 2 },
      { id: 'autonomy', title: 'Autonomy', level: 3 },
      { id: 'tool-calling', title: 'Tool Calling', level: 3 },
      { id: 'context-window', title: 'Context Window', level: 3 },
      { id: 'max-iterations', title: 'Max Iterations', level: 3 },
    ],
    content: AIAgentsContent,
  },
};
