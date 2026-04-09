import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { searchDetailed } from '@/lib/rag';

const SYSTEM_PROMPT = `You are a study assistant helping Yosef prepare for a Customer Engineer interview at OpenCX tomorrow.

IMPORTANT RULES:
1. You MUST ONLY answer based on the study material context provided below. Do NOT use outside knowledge.
2. If the context doesn't cover the question, say: "This isn't covered in the study materials. Check the docs for [relevant topic]."
3. Keep answers focused, clear, and concise — he has limited study time.
4. Use markdown formatting: **bold** for key terms, \`code\` for technical terms, bullet lists for multiple points.
5. When quizzing, ask one question at a time, wait for the answer, then give feedback based on the study material.
6. Always tie answers back to the OpenCX interview context when relevant.

Your topics: AI Agents (ReAct pattern), RAG (retrieval-augmented generation), Tools/Actions (function calling, integrations), System Prompts (prompt engineering).

Format guidelines:
- Use **bold** for important concepts
- Use bullet points for lists
- Use numbered lists for step-by-step processes
- Keep paragraphs short (2-3 sentences max)
- Include a one-line summary at the top of longer answers

CITATION RULES:
- At the end of your answer, add a "📖 Sources" section
- Each context chunk below has a "SOURCE_LINK:" line — use that exact link when citing
- Format: [Section Title](link)
- Only cite sections you actually used in your answer
- Be specific — link to the exact section, not just the page`;

// Maps "source::KB section title" → actual heading ID in the content TSX files
const SECTION_ANCHOR_MAP: Record<string, string> = {
  // ai-agents.md
  'ai-agents::What is an AI Agent?': 'what-is-an-ai-agent',
  'ai-agents::The ReAct Pattern': 'react-pattern',
  'ai-agents::How Agents Work in Customer Support': 'agents-in-support',
  'ai-agents::Key Concepts': 'key-concepts',
  'ai-agents::Agent Architecture': 'agent-architecture',
  'ai-agents::What to Say in the Interview': 'key-concepts',
  // rag.md
  'rag::What is RAG?': 'what-is-rag',
  'rag::The RAG Pipeline': 'rag-pipeline',
  'rag::Embeddings Explained': 'what-is-rag',
  'rag::Vector Similarity Search': 'what-is-rag',
  'rag::Chunking Strategies': 'rag-pipeline',
  'rag::Vector Stores': 'rag-pipeline',
  'rag::Common RAG Problems': 'common-rag-problems',
  'rag::What to Say in the Interview': 'what-is-rag',
  // tools-actions.md
  'tools-actions::What Are Tools?': 'what-are-tools',
  'tools-actions::How Tool Calling Works': 'how-tool-calling-works',
  'tools-actions::Common Tools for Customer Support Agents': 'common-support-tools',
  'tools-actions::Integration with Support Platforms': 'common-support-tools',
  'tools-actions::Building Good Tools': 'building-good-tools',
  'tools-actions::What to Say in the Interview': 'what-are-tools',
  // system-prompts.md
  'system-prompts::What is a System Prompt?': 'what-is-a-system-prompt',
  'system-prompts::Anatomy of a Good System Prompt': 'anatomy-of-a-system-prompt',
  'system-prompts::Prompt Engineering Techniques': 'prompt-engineering',
  'system-prompts::System Prompt for Customer Support Agents': 'anatomy-of-a-system-prompt',
  'system-prompts::Testing and Iterating Prompts': 'testing-and-iterating',
  'system-prompts::What to Say in the Interview': 'what-is-a-system-prompt',
  // interview-prep.md
  'interview-prep::About the Role': 'about-the-role',
  'interview-prep::What OpenCX Likely Does': 'about-the-role',
  'interview-prep::Key Topics to Master': 'key-topics',
  'interview-prep::Likely Interview Questions': 'likely-interview-questions',
  'interview-prep::How to Talk About Your Experience': 'how-to-talk-about-your-experience',
  'interview-prep::Day-of Tips': 'about-the-role',
  'interview-prep::Quick Reference: Key Terms': 'glossary',
};

const sessions = new Map<string, Anthropic.MessageParam[]>();

export async function POST(request: NextRequest) {
  const { message, sessionId: reqSessionId } = await request.json();

  if (!message) {
    return new Response(
      JSON.stringify({ type: 'error', error: 'Message is required' }) + '\n',
      { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ type: 'done', reply: 'ANTHROPIC_API_KEY is not set. Add it to your .env file.', totalMs: 0, sessionId: 'none' }) + '\n',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const sessionId = reqSessionId || crypto.randomUUID();

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  const history = sessions.get(sessionId)!;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      };

      const totalStart = Date.now();

      try {
        // --- Phase 1: RAG Search ---
        emit({ type: 'step', id: 'search', label: 'Vectorizing & searching', status: 'in_progress' });

        const searchStart = Date.now();
        const results = await searchDetailed(message, 3);
        const searchMs = Date.now() - searchStart;

        if (results.length > 0) {
          emit({
            type: 'step',
            id: 'search',
            label: 'Searching study materials',
            status: 'completed',
            durationMs: searchMs,
            detail: `${results.length} section${results.length !== 1 ? 's' : ''} found`,
          });

          for (const r of results) {
            emit({ type: 'source', file: r.source, section: r.section, score: r.score });
          }
        } else {
          emit({
            type: 'step',
            id: 'search',
            label: 'Searching study materials',
            status: 'completed',
            durationMs: searchMs,
            detail: 'no matching sections',
          });
        }

        // --- Phase 2: LLM Generation ---
        emit({ type: 'step', id: 'generate', label: 'Generating answer', status: 'in_progress' });

        const context = results.length > 0
          ? results.map((r) => {
              const anchor = SECTION_ANCHOR_MAP[`${r.source}::${r.section}`] || '';
              const link = anchor ? `/docs/${r.source}#${anchor}` : `/docs/${r.source}`;
              return `SOURCE_LINK: [${r.section}](${link})\n${r.text}`;
            }).join('\n\n---\n\n')
          : 'No relevant information found in the study materials.';

        const systemPrompt = `${SYSTEM_PROMPT}\n\n--- STUDY MATERIAL CONTEXT ---\n${context}\n--- END CONTEXT ---`;

        history.push({ role: 'user', content: message });
        const recentHistory = history.slice(-20);

        const client = new Anthropic({ apiKey });
        const genStart = Date.now();

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: recentHistory,
        });

        const genMs = Date.now() - genStart;

        const reply = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('');

        history.push({ role: 'assistant', content: reply });

        emit({ type: 'step', id: 'generate', label: 'Generating answer', status: 'completed', durationMs: genMs });

        // --- Done ---
        emit({ type: 'done', reply, totalMs: Date.now() - totalStart, sessionId });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        emit({ type: 'error', error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
