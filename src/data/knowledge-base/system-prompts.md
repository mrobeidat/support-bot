# System Prompts and Prompt Engineering

## What is a System Prompt?

A system prompt is the set of instructions given to the LLM at the beginning of every conversation. It defines the AI's identity, behavior, tone, constraints, and capabilities. Think of it as the "programming" of the AI agent — it tells the model WHO it is, WHAT it should do, and HOW it should behave.

In customer support, the system prompt is how you turn a general-purpose LLM into a specialized support agent for your specific company.

## Anatomy of a Good System Prompt

### 1. Role Definition
Tell the model exactly what it is:
```
You are a customer support agent for TechStore, a company that sells electronics and workspace gear.
```

### 2. Context / Knowledge
What information does the agent have access to?
```
You have access to our knowledge base through the search tool. Always search the KB before answering product or policy questions.
```

### 3. Behavioral Instructions
How should it behave?
```
- Be friendly, professional, and empathetic
- Keep responses concise — no more than 3 paragraphs
- If you don't know the answer, say so honestly
- Never make up information — only use what's in the knowledge base
```

### 4. Tool Usage Guidelines
When and how to use available tools:
```
- Use search_knowledge_base when asked about policies, products, or how-to
- Use check_order when the customer mentions an order number
- Use escalate_to_human when the customer is upset or requests a human
```

### 5. Constraints / Guardrails
What the agent should NOT do:
```
- Never share internal information about other customers
- Never promise refunds without checking the policy
- Never discuss competitors or make price comparisons
- If the topic is outside customer support, politely redirect
```

### 6. Output Format
How responses should be structured:
```
- Use bullet points for lists of options
- Include relevant links when referencing help articles
- End with a follow-up question if the issue isn't resolved
```

## Prompt Engineering Techniques

### Be Specific, Not Vague
Bad: "Be helpful"
Good: "When a customer asks about returns, always include: the return window (30 days), required condition (original packaging), and refund timeline (5-10 business days)"

### Use Examples (Few-Shot)
Include example conversations to show the desired behavior:
```
Example:
Customer: "My order hasn't arrived"
Agent: "I'm sorry to hear that! Let me look up your order right away. Could you share your order number? It usually starts with ORD-"
```

### Chain of Thought
For complex decisions, instruct the model to reason step-by-step:
```
Before responding to a complaint:
1. Acknowledge the customer's frustration
2. Search the KB for relevant policy
3. Determine if the issue is covered under warranty/returns
4. Suggest a specific resolution
5. Offer to escalate if the customer isn't satisfied
```

### Negative Instructions
Explicitly state what NOT to do (models respond well to this):
```
NEVER:
- Admit the product is defective unless confirmed by the tool
- Offer discounts or refunds without checking eligibility
- Use technical jargon the customer won't understand
```

### Dynamic Context Injection
Add real-time information to the system prompt:
```
Current date: 2025-01-15
Customer name: Sarah
Customer tier: Premium
Active promotions: 20% off all accessories until Jan 31
```

## System Prompt for Customer Support Agents

A production system prompt for a support agent typically includes:

1. **Company identity**: Name, what you sell, your values
2. **Tone guidelines**: Friendly? Formal? Casual? Match the brand
3. **Knowledge source rules**: "Only answer from KB results, never make up facts"
4. **Escalation triggers**: When to hand off to a human
5. **Sensitive topics**: What to avoid (legal advice, medical, etc.)
6. **Language/locale**: Respond in the customer's language
7. **Personalization**: Use the customer's name, reference their history

## Testing and Iterating Prompts

### Common Issues
- **Too verbose**: Add "Keep responses under 3 sentences" or "Be concise"
- **Too vague**: Add specific examples of desired behavior
- **Ignores tools**: Strengthen tool usage instructions ("You MUST search the KB before answering any policy question")
- **Hallucinating**: Add "If the information isn't in the search results, say 'I don't have that information' and offer to escalate"
- **Wrong tone**: Add more tone examples, use few-shot demonstrations

### A/B Testing Prompts
In production, you can:
- Run multiple prompt versions simultaneously
- Measure resolution rate, customer satisfaction, escalation rate
- Iterate based on real customer interactions
- Track which prompt version performs better on specific issue types

### Prompt Versioning
Treat system prompts like code:
- Version control your prompts
- Document why changes were made
- Roll back if a new version performs worse
- Test with a set of representative customer queries before deploying

## What to Say in the Interview

When asked about system prompts / prompt engineering:
- Walk through the anatomy: role, context, behavior, tools, constraints, format
- Give concrete examples of good vs bad instructions
- Mention techniques: few-shot examples, chain of thought, negative instructions
- Talk about iteration: testing, A/B testing, versioning
- For OpenCX: system prompts are how customers configure their AI agents — a Customer Engineer helps them get this right
- Emphasize that prompt engineering is crucial for AI-native products — small changes in the prompt can dramatically affect agent performance
