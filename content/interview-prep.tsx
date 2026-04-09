import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';

export function InterviewPrepContent() {
  return (
    <>
      <h2 id="about-the-role">About the OpenCX Role</h2>
      <p>
        A <strong>Customer Engineer</strong> at an AI-native support company like OpenCX sits at the
        intersection of engineering and customer success. You&apos;re not just writing code and
        you&apos;re not just talking to customers &mdash; you&apos;re doing both.
      </p>
      <p>Day-to-day, you&apos;ll likely:</p>
      <ul>
        <li>Help customers integrate AI agents into their support workflows (chat widgets, helpdesks, CRMs).</li>
        <li>Configure and fine-tune AI agents &mdash; system prompts, tools, knowledge bases, escalation rules.</li>
        <li>Debug issues where the agent gives wrong answers, uses the wrong tool, or fails to escalate properly.</li>
        <li>Build custom tools and integrations for specific customer needs (e.g., connecting to their order management system).</li>
        <li>Advise customers on RAG setup &mdash; what to put in the knowledge base, how to chunk it, how to keep it updated.</li>
        <li>Triage and communicate technical issues between customers and the engineering team.</li>
      </ul>

      <Callout type="info" title="What They&apos;re Looking For">
        <p>
          The ideal candidate understands AI concepts (agents, RAG, tools, prompts) deeply enough to
          explain them to a non-technical customer, and is technical enough to debug integration
          code, write custom tools, and read API documentation. You don&apos;t need to be an ML
          researcher &mdash; you need to be a strong engineer who groks the AI stack.
        </p>
      </Callout>

      <h2 id="key-topics">Key Topics Summary</h2>
      <p>
        Here&apos;s a quick recap of the four core topics. Each has its own dedicated page with full
        details.
      </p>

      <h3 id="recap-agents">AI Agents</h3>
      <p>
        An agent uses an LLM in a <strong>Reason &rarr; Act &rarr; Observe</strong> loop to solve
        multi-step problems. Key components: system prompt, context window, tools, and knowledge
        base. The agent loops until it has a final answer or hits max iterations. In support, agents
        handle customer conversations by combining RAG for knowledge and tools for actions.
      </p>

      <h3 id="recap-rag">RAG (Retrieval-Augmented Generation)</h3>
      <p>
        RAG grounds LLM responses in real data by retrieving relevant documents before generating.
        Pipeline: chunk documents &rarr; embed into vectors &rarr; store in vector DB. At query
        time: embed the question &rarr; find similar chunks &rarr; inject into LLM context. Key
        decisions: chunking strategy, embedding model, vector store, and how many results to
        retrieve.
      </p>

      <h3 id="recap-tools">Tools & Function Calling</h3>
      <p>
        Tools let agents take real actions. The LLM outputs structured JSON requesting a function
        call, your code executes it, and the result goes back to the LLM. Good tools have clear
        descriptions, validated parameters, and graceful error handling. Common support tools: KB
        search, order lookup, refund processing, ticket creation, human handoff.
      </p>

      <h3 id="recap-prompts">System Prompts</h3>
      <p>
        The system prompt defines agent behavior: role, context, behavior rules, constraints, and
        response format. Key techniques: few-shot examples, chain-of-thought reasoning, negative
        instructions, and dynamic context injection. Prompt engineering is empirical &mdash; test
        with real scenarios and iterate.
      </p>

      <h2 id="likely-questions">Likely Interview Questions</h2>

      <h3 id="technical-questions">Technical Questions</h3>
      <ul>
        <li>
          <strong>&quot;Explain how an AI agent works.&quot;</strong> &rarr; Walk through the ReAct
          loop. Draw the architecture (LLM + tools + knowledge base). Give a concrete example:
          customer asks &quot;Where is my order?&quot; and the agent reasons, calls lookupOrder,
          observes the result, and responds.
        </li>
        <li>
          <strong>&quot;What is RAG and why is it important?&quot;</strong> &rarr; LLMs hallucinate
          without grounding. RAG retrieves real documents and injects them as context. Walk through
          the pipeline: ingest (chunk, embed, store) and query (embed, search, generate). Mention
          that this is how you keep a support agent&apos;s answers accurate and up-to-date.
        </li>
        <li>
          <strong>&quot;How does tool calling work?&quot;</strong> &rarr; Four steps: define tools
          with descriptions and schemas, LLM decides which to call, your code executes, result goes
          back. Emphasize that the LLM doesn&apos;t execute code &mdash; it outputs structured JSON
          and your application runs the function.
        </li>
        <li>
          <strong>&quot;How would you design a system prompt for a support agent?&quot;</strong>
          &rarr; Five sections: role, context, behavior, constraints, format. Give an example of
          each. Mention dynamic context injection and few-shot examples.
        </li>
        <li>
          <strong>&quot;What happens when the agent gives a wrong answer?&quot;</strong> &rarr;
          Diagnose: is it a retrieval problem (wrong docs returned) or a generation problem (LLM
          ignored the context)? Fixes: improve chunking, add re-ranking, strengthen the system
          prompt with explicit grounding instructions, add a &quot;confidence threshold&quot; that
          triggers human review.
        </li>
      </ul>

      <h3 id="scenario-questions">Scenario Questions</h3>
      <ul>
        <li>
          <strong>&quot;A customer says the AI gave them wrong pricing info.&quot;</strong> &rarr;
          Acknowledge the issue. Check: is the pricing data in the knowledge base up-to-date? Was
          the right chunk retrieved? Did the system prompt instruct the agent not to guess at
          prices? Fix the root cause (update KB, improve retrieval, add constraint to prompt).
        </li>
        <li>
          <strong>&quot;A customer wants to integrate their custom CRM.&quot;</strong> &rarr; Ask
          about their CRM&apos;s API (REST/GraphQL, authentication, key endpoints). Design a custom
          tool that wraps their API. Test with sample data. Discuss error handling and rate limits.
        </li>
        <li>
          <strong>&quot;The agent keeps calling the wrong tool.&quot;</strong> &rarr; The tool
          descriptions are likely ambiguous. Review and make descriptions more specific about when
          to use (and when NOT to use) each tool. Add negative examples to the system prompt if
          needed.
        </li>
      </ul>

      <h3 id="behavioral-questions">Behavioral Questions</h3>
      <ul>
        <li>
          <strong>&quot;Tell me about a time you debugged a complex technical issue.&quot;</strong>
          &rarr; Use the STAR method (see below). Focus on your systematic approach: how you
          narrowed down the problem, what tools you used, what you learned.
        </li>
        <li>
          <strong>&quot;How do you explain technical concepts to non-technical people?&quot;</strong>
          &rarr; Give a specific example. Use analogies, avoid jargon, check understanding. This is
          a core skill for a Customer Engineer.
        </li>
        <li>
          <strong>&quot;How do you handle a frustrated customer?&quot;</strong> &rarr; Acknowledge
          their frustration, take ownership, focus on the solution. Specific example is better than
          abstract principles.
        </li>
      </ul>

      <h2 id="star-method">How to Talk About Your Experience</h2>
      <p>
        Use the <strong>STAR method</strong> for behavioral questions:
      </p>

      <CodeBlock
        language="text"
        code={`S — Situation:  Set the scene. What was the context?
T — Task:       What was your specific responsibility?
A — Action:     What did you actually do? Be specific.
R — Result:     What was the outcome? Quantify if possible.

Example:
S: "At my previous company, our chatbot was giving customers
    incorrect return policy information about 20% of the time."
T: "I was responsible for investigating and fixing the issue."
A: "I reviewed the retrieval logs and found our knowledge base
    had three overlapping articles about returns with slightly
    different information. I consolidated them into one canonical
    article, re-chunked it by section headers instead of fixed
    size, and added a negative instruction to the system prompt:
    'Never state return deadlines without retrieving the current
    return policy first.'"
R: "Incorrect return policy responses dropped from 20% to under
    2% within a week, and customer satisfaction scores for
    return-related conversations went up 15%."`}
      />

      <h2 id="glossary">Quick Reference Glossary</h2>
      <ul>
        <li><strong>Agent:</strong> An LLM-powered system that reasons, acts (via tools), and observes in a loop.</li>
        <li><strong>RAG:</strong> Retrieval-Augmented Generation &mdash; grounding LLM responses in retrieved documents.</li>
        <li><strong>Embedding:</strong> A vector (list of numbers) representing the meaning of text.</li>
        <li><strong>Vector Store:</strong> A database optimized for storing and searching vectors by similarity.</li>
        <li><strong>Cosine Similarity:</strong> A measure of how similar two vectors are (0 = unrelated, 1 = identical direction).</li>
        <li><strong>Chunk:</strong> A segment of a document stored as a unit in the vector database.</li>
        <li><strong>Tool / Function Calling:</strong> The mechanism by which an LLM requests external function execution.</li>
        <li><strong>System Prompt:</strong> Hidden instructions that define an agent&apos;s behavior and constraints.</li>
        <li><strong>Context Window:</strong> The maximum tokens an LLM can process in one request.</li>
        <li><strong>Token:</strong> A piece of text (~4 characters in English). LLMs process text as tokens.</li>
        <li><strong>Hallucination:</strong> When an LLM generates confident but incorrect information.</li>
        <li><strong>ReAct:</strong> Reason + Act pattern &mdash; the standard agent loop architecture.</li>
        <li><strong>Few-Shot:</strong> Including example inputs/outputs in the prompt to guide behavior.</li>
        <li><strong>Chain of Thought:</strong> Prompting the LLM to think step-by-step before answering.</li>
        <li><strong>Grounding:</strong> Ensuring LLM responses are based on real, retrieved data rather than training knowledge.</li>
        <li><strong>Re-ranking:</strong> A second-pass model that reorders retrieved results by relevance.</li>
        <li><strong>Hybrid Search:</strong> Combining vector (semantic) search with keyword (BM25) search.</li>
        <li><strong>Escalation:</strong> Handing a conversation from the AI agent to a human agent.</li>
        <li><strong>Webhook:</strong> An HTTP callback that notifies your system when an event occurs (e.g., new message).</li>
      </ul>

      <Callout type="tip" title="Day-of Tips">
        <p>
          <strong>Before the interview:</strong> Re-read the AI Agents and RAG pages one more time.
          Practice explaining the ReAct loop and RAG pipeline out loud in under 2 minutes each.
          Have the architecture diagram and RAG pipeline in your head &mdash; you may need to
          whiteboard them.
        </p>
        <p>
          <strong>During the interview:</strong> Think out loud. If you don&apos;t know something,
          say &quot;I&apos;m not sure about that specific detail, but here&apos;s how I&apos;d
          approach figuring it out.&quot; Ask clarifying questions &mdash; it shows good engineering
          instincts. When giving examples, be specific and use real numbers/outcomes.
        </p>
        <p>
          <strong>Key phrases to use:</strong> &quot;In my experience...&quot;, &quot;The tradeoff
          here is...&quot;, &quot;I&apos;d start by...&quot;, &quot;One thing I&apos;ve learned
          is...&quot;. These signal practical knowledge over theoretical.
        </p>
      </Callout>
    </>
  );
}

export const interviewPrepPages = {
  'interview-prep': {
    title: 'Interview Prep Guide',
    description: 'Role overview, likely questions, answer strategies, and a quick-reference glossary.',
    section: 'Interview',
    headings: [
      { id: 'about-the-role', title: 'About the OpenCX Role', level: 2 },
      { id: 'key-topics', title: 'Key Topics Summary', level: 2 },
      { id: 'recap-agents', title: 'AI Agents', level: 3 },
      { id: 'recap-rag', title: 'RAG', level: 3 },
      { id: 'recap-tools', title: 'Tools & Function Calling', level: 3 },
      { id: 'recap-prompts', title: 'System Prompts', level: 3 },
      { id: 'likely-questions', title: 'Likely Interview Questions', level: 2 },
      { id: 'technical-questions', title: 'Technical Questions', level: 3 },
      { id: 'scenario-questions', title: 'Scenario Questions', level: 3 },
      { id: 'behavioral-questions', title: 'Behavioral Questions', level: 3 },
      { id: 'star-method', title: 'How to Talk About Your Experience', level: 2 },
      { id: 'glossary', title: 'Quick Reference Glossary', level: 2 },
    ],
    content: InterviewPrepContent,
  },
};
