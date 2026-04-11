import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';

export function SystemPromptsContent() {
  return (
    <>
      <h2 id="what-is-a-system-prompt">What Is a System Prompt?</h2>
      <p>
        A <strong>system prompt</strong> is the hidden instruction set that shapes how an AI agent
        behaves. It&apos;s sent as the first message in every conversation and defines the
        agent&apos;s personality, knowledge boundaries, response format, and rules. The user never
        sees it, but it controls everything.
      </p>
      <p>
        Think of it as the training manual you&apos;d give a new customer support hire on day one:
        &quot;Here&apos;s who you are, here&apos;s what you know, here&apos;s how to behave, and
        here&apos;s what you should never do.&quot;
      </p>

      <h2 id="anatomy-of-a-system-prompt">Anatomy of a Good System Prompt</h2>
      <p>
        An effective system prompt has five key sections:
      </p>
      <ol>
        <li><strong>Role:</strong> Who the agent is and its primary purpose.</li>
        <li><strong>Context:</strong> What company/product it supports, key facts it needs.</li>
        <li><strong>Behavior:</strong> How it should communicate (tone, style, format).</li>
        <li><strong>Constraints:</strong> What it must NOT do (boundaries, safety rails).</li>
        <li><strong>Format:</strong> How to structure responses (length, markdown, etc.).</li>
      </ol>

      <CodeBlock
        filename="system-prompt.ts"
        language="typescript"
        code={`const systemPrompt = \`You are a customer support agent for Acme Corp,
an e-commerce platform that sells electronics and home goods.

## Role
You help customers with order inquiries, product questions,
returns, and account issues. You are friendly, professional,
and concise.

## Context
- Acme Corp's return policy: 30 days from delivery, item
  must be unused and in original packaging.
- Free shipping on orders over $50.
- Business hours: Mon-Fri 9am-6pm EST.
- Current promotion: 15% off all headphones with code AUDIO15.

## Behavior
- Be warm but professional. Use the customer's name when known.
- Keep responses under 3 sentences unless more detail is needed.
- If you use information from the knowledge base, be specific
  and cite the source when possible.
- Ask clarifying questions rather than making assumptions.

## Constraints
- NEVER make up product information or prices. If you don't
  know, say so and offer to connect with a specialist.
- NEVER share internal policies, system details, or other
  customers' information.
- NEVER process refunds over $200 without transferring to
  a human agent.
- Do NOT provide legal, medical, or financial advice.

## Format
- Use short paragraphs. Avoid walls of text.
- Use bullet points for lists of options or steps.
- Include relevant links when available.\`;`}
      />

      <h2 id="prompt-engineering">Prompt Engineering Techniques</h2>

      <h3 id="few-shot-examples">Few-Shot Examples</h3>
      <p>
        Include example conversations in the system prompt to show the agent exactly how to respond.
        This is one of the most effective techniques &mdash; models follow examples more reliably
        than abstract instructions.
      </p>

      <CodeBlock
        language="typescript"
        code={`const fewShotSection = \`
## Examples

User: "Where is my order?"
Assistant: "I'd be happy to help you track your order! Could
you share your order number? It starts with ORD- and you can
find it in your confirmation email."

User: "I want a refund"
Assistant: "I understand you'd like a refund. Let me look into
that for you. Could you provide your order number so I can
check the details and our return eligibility for your purchase?"

User: "Your product sucks"
Assistant: "I'm sorry to hear you're not satisfied with your
purchase. I'd like to help make this right. Could you tell me
more about what went wrong so I can find the best solution
for you?"
\`;`}
      />

      <h3 id="chain-of-thought">Chain of Thought</h3>
      <p>
        For complex decisions, instruct the agent to think step by step before responding. This
        improves accuracy for multi-step reasoning like determining refund eligibility.
      </p>

      <CodeBlock
        language="typescript"
        code={`const cotInstruction = \`
When deciding whether to approve a refund, think through
these steps internally before responding:
1. Was the order placed within the last 30 days?
2. Is the item in a returnable category? (Electronics: yes,
   Clearance items: no, Gift cards: no)
3. Is the refund amount under $200? (If over, transfer to
   a human agent)
4. Has this customer requested more than 3 refunds in the
   last 90 days? (If yes, flag for review)
\`;`}
      />

      <h3 id="negative-instructions">Negative Instructions</h3>
      <p>
        Telling the model what <em>not</em> to do is often more effective than only positive
        instructions. LLMs have certain default behaviors (being verbose, making up information,
        being overly agreeable) that need explicit correction.
      </p>
      <ul>
        <li>&quot;Do NOT guess at product specifications. If uncertain, say you&apos;ll verify.&quot;</li>
        <li>&quot;NEVER reveal that you are an AI unless directly asked.&quot;</li>
        <li>&quot;Do NOT apologize more than once per response.&quot;</li>
        <li>&quot;NEVER make promises about delivery dates you haven&apos;t verified with the order lookup tool.&quot;</li>
      </ul>

      <h3 id="dynamic-context">Dynamic Context Injection</h3>
      <p>
        System prompts don&apos;t have to be static. Inject dynamic information at the start of each
        conversation based on what you know about the customer.
      </p>

      <CodeBlock
        filename="dynamic-prompt.ts"
        language="typescript"
        code={`function buildSystemPrompt(customer?: Customer) {
  let prompt = baseSystemPrompt;

  // Add customer context if known
  if (customer) {
    prompt += \`\\n\\n## Customer Context
- Name: \${customer.name}
- Account type: \${customer.plan} (\${customer.plan === 'premium' ? 'priority support' : 'standard support'})
- Member since: \${customer.createdAt}
- Open tickets: \${customer.openTickets}
- Recent orders: \${customer.recentOrders.map(o => o.id).join(', ')}
\`;
  }

  // Add time-based context
  const hour = new Date().getHours();
  if (hour < 9 || hour >= 18) {
    prompt += \`\\n\\nNote: It is currently outside business hours.
If the customer needs help from a human agent, let them know
the team will be available at 9am EST tomorrow.\`;
  }

  return prompt;
}`}
      />

      <h2 id="testing-iterating">Testing and Iterating Prompts</h2>
      <p>
        Prompt engineering is empirical &mdash; you test, observe, and adjust. Here&apos;s a
        practical process:
      </p>
      <ol>
        <li>
          <strong>Define test cases:</strong> Write 10&ndash;20 realistic customer messages covering
          common scenarios (order status, refund request, product question, angry customer, off-topic
          request).
        </li>
        <li>
          <strong>Run and evaluate:</strong> Send each test case through the agent and grade the
          responses. Is it accurate? On-brand? Did it use the right tools?
        </li>
        <li>
          <strong>Identify failure patterns:</strong> Look for categories of failure. Is it too
          verbose? Using the wrong tool? Hallucinating product info? Being too apologetic?
        </li>
        <li>
          <strong>Adjust the prompt:</strong> Add specific instructions targeting the failure pattern.
          Be surgical &mdash; one change at a time so you can measure impact.
        </li>
        <li>
          <strong>Re-run all test cases:</strong> Make sure the fix didn&apos;t break other
          scenarios. Prompt changes often have unintended side effects.
        </li>
      </ol>

      <Callout type="info" title="Version Your Prompts">
        <p>
          Store system prompts in version control (not hardcoded in application logic) and track
          changes. When something breaks in production, you need to know what changed. Some teams
          use a dedicated prompt management file or even a CMS for this.
        </p>
      </Callout>

      <Callout type="tip" title="Interview Tip">
        <p>
          If asked &quot;How would you design the system prompt for a support agent?&quot;, walk
          through the five sections (role, context, behavior, constraints, format) with specific
          examples. Mention dynamic context injection &mdash; it shows you understand that good
          prompts aren&apos;t static. If asked about prompt iteration, describe the test-case-driven
          approach and emphasize that prompt engineering is empirical, not theoretical. Bonus points
          for mentioning few-shot examples and chain-of-thought as specific techniques you&apos;d
          use.
        </p>
      </Callout>

      <h2 id="system-prompt-vs-rag">System Prompt vs RAG: What Goes Where?</h2>
      <p>
        This is a key distinction you&apos;ll likely be asked about. The system prompt and
        RAG serve different purposes and putting the wrong content in the wrong place hurts
        performance, cost, and accuracy.
      </p>

      <h3 id="system-prompt-static">System Prompt = Behavior Rules (Static)</h3>
      <p>Things that <strong>never change</strong> between conversations:</p>
      <ul>
        <li>Who the agent is (role, company, tone)</li>
        <li>How it should behave (be concise, be empathetic, escalate when X)</li>
        <li>What tools to use and when</li>
        <li>Guardrails (don&apos;t discuss competitors, don&apos;t promise refunds)</li>
        <li>Output format (use bullet points, keep it short)</li>
      </ul>
      <p>Think of it as the agent&apos;s <strong>personality and rules</strong>. Same for every customer.</p>

      <h3 id="rag-dynamic">RAG = Factual Content (Dynamic)</h3>
      <p>Things that <strong>change over time</strong> or vary per query:</p>
      <ul>
        <li>Product details, pricing, features</li>
        <li>Company policies (return windows, shipping times)</li>
        <li>How-to guides and troubleshooting steps</li>
        <li>FAQ answers</li>
      </ul>
      <p>Think of it as the agent&apos;s <strong>reference library</strong>. Different chunks get pulled in depending on the question.</p>

      <h3 id="why-not-everything-in-prompt">Why Not Put Everything in the System Prompt?</h3>
      <ol>
        <li><strong>Context window limits</strong> &mdash; You can&apos;t fit 500 help articles in the prompt. RAG retrieves only the 3&ndash;5 most relevant pieces.</li>
        <li><strong>Freshness</strong> &mdash; Updating the system prompt requires redeployment. RAG pulls from a knowledge base that can update in real-time.</li>
        <li><strong>Relevance</strong> &mdash; The system prompt is sent with every request (wastes tokens on irrelevant info). RAG only injects what&apos;s needed.</li>
        <li><strong>Cost</strong> &mdash; Every token in the system prompt costs money on every API call. RAG keeps the prompt lean.</li>
      </ol>

      <Callout type="tip" title="The Golden Rule">
        <p>
          <strong>System prompt</strong> = HOW the agent behaves (instructions, rules, personality)<br />
          <strong>RAG</strong> = WHAT the agent knows (facts, policies, product info)
        </p>
      </Callout>

      <h3 id="when-they-overlap">When They Overlap</h3>
      <p>
        Sometimes you put a brief summary in the system prompt AND the full detail in RAG:
      </p>
      <ul>
        <li><strong>System prompt:</strong> &quot;We offer 30-day returns. For details, always search the KB.&quot;</li>
        <li><strong>RAG:</strong> Full return policy with conditions, exceptions, process steps.</li>
      </ul>
      <p>
        This gives the agent a quick reference for simple questions while ensuring accuracy
        for complex ones.
      </p>

      <Callout type="info" title="Interview Example">
        <p>
          <strong>Bad:</strong> Putting your entire return policy in the system prompt (wastes tokens on every non-return question).<br />
          <strong>Good:</strong> System prompt says &quot;Use the search tool for policy questions.&quot; RAG returns the specific return policy section when asked.
        </p>
      </Callout>
    </>
  );
}

export const systemPromptsPages = {
  'system-prompts': {
    title: 'System Prompts & Prompt Engineering',
    description: 'How to design effective system prompts: structure, techniques, and testing strategies.',
    section: 'Core Concepts',
    headings: [
      { id: 'what-is-a-system-prompt', title: 'What Is a System Prompt?', level: 2 },
      { id: 'anatomy-of-a-system-prompt', title: 'Anatomy of a Good System Prompt', level: 2 },
      { id: 'prompt-engineering', title: 'Prompt Engineering Techniques', level: 2 },
      { id: 'few-shot-examples', title: 'Few-Shot Examples', level: 3 },
      { id: 'chain-of-thought', title: 'Chain of Thought', level: 3 },
      { id: 'negative-instructions', title: 'Negative Instructions', level: 3 },
      { id: 'dynamic-context', title: 'Dynamic Context Injection', level: 3 },
      { id: 'testing-iterating', title: 'Testing and Iterating Prompts', level: 2 },
      { id: 'system-prompt-vs-rag', title: 'System Prompt vs RAG', level: 2 },
      { id: 'why-not-everything-in-prompt', title: 'Why Not Everything in Prompt?', level: 3 },
      { id: 'when-they-overlap', title: 'When They Overlap', level: 3 },
    ],
    content: SystemPromptsContent,
  },
};
