import Link from 'next/link';
import {
  Bot,
  Database,
  Wrench,
  ArrowRight,
  MessageSquare,
  GraduationCap,
  Brain,
  Clock,
} from 'lucide-react';
import { Header } from '@/components/header';

const topics = [
  {
    icon: Bot,
    title: 'AI Agents',
    description: 'ReAct pattern, agent loops, autonomy, tool calling, and how agents power customer support.',
    href: '/docs/ai-agents',
    time: '~90 min',
  },
  {
    icon: Database,
    title: 'RAG',
    description: 'Retrieval-Augmented Generation: embeddings, vector search, chunking, and grounding responses.',
    href: '/docs/rag',
    time: '~90 min',
  },
  {
    icon: Wrench,
    title: 'Tools & Actions',
    description: 'Function calling, tool schemas, Zendesk/Intercom/HubSpot integrations, error handling.',
    href: '/docs/tools-actions',
    time: '~60 min',
  },
  {
    icon: MessageSquare,
    title: 'System Prompts',
    description: 'Prompt engineering, system prompt anatomy, few-shot, chain of thought, testing.',
    href: '/docs/system-prompts',
    time: '~60 min',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary-500/10 blur-[120px] dark:bg-primary-400/8" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400">
              <Brain className="h-4 w-4" />
              OpenCX Customer Engineer Interview
            </div>

            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-[var(--text-highlighted)]">
              Study Guide
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-[clamp(1rem,2vw,1.15rem)] leading-relaxed text-[var(--text-muted)]">
              Everything you need to know about AI Agents, RAG, Tools, and Prompt Engineering.
              Read the docs, then ask the AI assistant to quiz you.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/docs/ai-agents"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-[0.95rem] font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 active:scale-[0.98]"
              >
                Start Studying
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs/interview-prep"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-3 text-[0.95rem] font-semibold text-[var(--text-highlighted)] transition-colors hover:bg-[var(--bg-muted)]"
              >
                <GraduationCap className="h-4 w-4" />
                Interview Prep
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic, i) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="animate-fade-in-up group rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 transition-colors hover:border-primary-500/30 hover:bg-[var(--bg-elevated)]"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex rounded-lg bg-primary-500/10 p-2.5 text-primary-600 group-hover:bg-primary-500/15 dark:text-primary-400">
                  <topic.icon className="h-5 w-5" />
                </div>
                <span className="flex items-center gap-1 text-xs text-[var(--text-dimmed)]">
                  <Clock className="h-3 w-3" />
                  {topic.time}
                </span>
              </div>
              <h3 className="mt-3 text-[0.95rem] font-semibold text-[var(--text-highlighted)]">
                {topic.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                {topic.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Chat hint */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <div className="animate-fade-in-up rounded-xl border border-dashed border-primary-500/30 bg-primary-500/5 p-6 text-center" style={{ animationDelay: '0.5s' }}>
          <MessageSquare className="mx-auto h-6 w-6 text-primary-500 dark:text-primary-400" />
          <h3 className="mt-3 text-sm font-semibold text-[var(--text-highlighted)]">
            AI Study Assistant
          </h3>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Click the chat button in the bottom-right corner to ask questions about any topic.
            The assistant uses RAG to search the study material and give you focused answers.
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6">
        <p className="text-center text-sm text-[var(--text-dimmed)]">
          Good luck tomorrow! You&apos;ve got this.
        </p>
      </footer>
    </div>
  );
}
