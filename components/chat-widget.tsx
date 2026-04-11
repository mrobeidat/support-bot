'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { ThinkingBlock, type ThinkingStep, type ThinkingSource } from './thinking-block';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: {
    steps: ThinkingStep[];
    sources: ThinkingSource[];
    totalMs?: number;
  };
}

// --- Markdown renderer (unchanged logic, extracted for clarity) ---

function FormatMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className={`my-2 space-y-1 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} pl-4`}>
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed"><InlineFormat text={item} /></li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      flushList();
      elements.push(<p key={i} className="mt-3 mb-1.5 text-sm font-semibold text-[var(--text-highlighted)]"><InlineFormat text={line.slice(3)} /></p>);
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<p key={i} className="mt-2 mb-1 text-sm font-semibold text-[var(--text-highlighted)]"><InlineFormat text={line.slice(4)} /></p>);
      continue;
    }
    if (/^[-*•]\s/.test(line)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(line.replace(/^[-*•]\s+/, ''));
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }
    flushList();
    if (line.trim() === '') continue;
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`code-${elements.length}`} className="my-2 overflow-x-auto rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] p-3 text-xs leading-5 font-mono text-[var(--text-default)]">
          {codeLines.join('\n')}
        </pre>
      );
      continue;
    }
    elements.push(<p key={i} className="text-sm leading-relaxed"><InlineFormat text={line} /></p>);
  }
  flushList();
  return <div className="space-y-1">{elements}</div>;
}

function InlineFormat({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Match patterns
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity;

    const minIdx = Math.min(linkIdx, boldIdx, codeIdx);

    if (minIdx === Infinity) {
      if (remaining) parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    // Text before the match
    if (minIdx > 0) parts.push(<span key={key++}>{remaining.slice(0, minIdx)}</span>);

    if (minIdx === linkIdx && linkMatch) {
      const href = linkMatch[2];
      const isInternal = href.startsWith('/');
      if (isInternal) {
        parts.push(
          <Link key={key++} href={href} className="font-medium text-primary-500 underline underline-offset-2 hover:text-primary-600 dark:hover:text-primary-400">
            {linkMatch[1]}
          </Link>
        );
      } else {
        parts.push(
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-500 underline underline-offset-2 hover:text-primary-600 dark:hover:text-primary-400">
            {linkMatch[1]}
          </a>
        );
      }
      remaining = remaining.slice(linkIdx + linkMatch[0].length);
    } else if (minIdx === boldIdx && boldMatch) {
      parts.push(<strong key={key++} className="font-semibold text-[var(--text-highlighted)]">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldIdx + boldMatch[0].length);
    } else if (codeMatch) {
      parts.push(<code key={key++} className="rounded bg-[var(--bg-muted)] px-1 py-0.5 text-xs font-mono text-primary-600 dark:text-primary-400">{codeMatch[1]}</code>);
      remaining = remaining.slice(codeIdx + codeMatch[0].length);
    }
  }
  return <>{parts}</>;
}

// --- Main widget ---

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hey Yosef! I'm your study assistant for the OpenCX interview.\n\nI can help you with:\n- **AI Agents** and the ReAct pattern\n- **RAG** pipelines and embeddings\n- **Tools/Actions** and function calling\n- **System Prompts** and prompt engineering\n\nAsk me anything, or say **\"quiz me\"** to test yourself!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Active thinking state (before reply arrives)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [thinkingSources, setThinkingSources] = useState<ThinkingSource[]>([]);

  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : 'session'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingSteps, scrollToBottom]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Listen for "Ask AI" events from doc headings
  const pendingQuestion = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const question = (e as CustomEvent).detail?.question;
      if (!question) return;
      pendingQuestion.current = question;
      setOpen(true);
    };
    window.addEventListener('ask-ai', handler);
    return () => window.removeEventListener('ask-ai', handler);
  }, []);

  // When chat opens with a pending question, send it
  useEffect(() => {
    if (open && pendingQuestion.current && !loading) {
      const q = pendingQuestion.current;
      pendingQuestion.current = null;
      setInput(q);
      // Trigger send on next tick after input is set
      setTimeout(() => {
        inputRef.current?.form?.requestSubmit();
      }, 50);
    }
  }, [open, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    setThinkingSteps([]);
    setThinkingSources([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const accSteps: ThinkingStep[] = [];
      const accSources: ThinkingSource[] = [];
      let totalMs: number | undefined;
      let reply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);

            if (event.type === 'step') {
              const existing = accSteps.findIndex((s) => s.id === event.id);
              const step: ThinkingStep = {
                id: event.id,
                label: event.label,
                status: event.status,
                durationMs: event.durationMs,
                detail: event.detail,
              };
              if (existing >= 0) {
                accSteps[existing] = step;
              } else {
                accSteps.push(step);
              }
              setThinkingSteps([...accSteps]);
            }

            if (event.type === 'source') {
              accSources.push({ file: event.file, section: event.section, score: event.score });
              setThinkingSources([...accSources]);
            }

            if (event.type === 'done') {
              reply = event.reply;
              totalMs = event.totalMs;
            }

            if (event.type === 'error') {
              reply = `Error: ${event.error}`;
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      // Commit: move thinking into the message and add reply
      setThinkingSteps([]);
      setThinkingSources([]);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply || 'No response received.',
          thinking: {
            steps: accSteps,
            sources: accSources,
            totalMs,
          },
        },
      ]);
    } catch {
      setThinkingSteps([]);
      setThinkingSources([]);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to connect. Make sure the server is running.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 active:scale-95"
            aria-label="Open study assistant"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className={
              'fixed z-[60] flex flex-col overflow-hidden ' +
              'inset-0 bg-[var(--bg)] ' +
              'sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(600px,calc(100vh-2.5rem))] sm:w-[420px] sm:rounded-2xl sm:border sm:border-[var(--border)] sm:bg-[var(--bg)]/95 sm:backdrop-blur-xl sm:shadow-2xl'
            }
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-primary-500 px-4 py-3.5 sm:py-3 sm:rounded-t-2xl">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Study Assistant</p>
                <p className="text-[11px] text-white/70 leading-tight">RAG-powered · answers from study docs only</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'assistant' && msg.thinking && msg.thinking.steps.length > 0 && (
                  <div className="mb-2">
                    <ThinkingBlock
                      steps={msg.thinking.steps}
                      sources={msg.thinking.sources}
                      totalMs={msg.thinking.totalMs}
                      isActive={false}
                    />
                  </div>
                )}
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white [&_strong]:text-white [&_code]:bg-white/20 [&_code]:text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-default)]'
                    }`}
                  >
                    <FormatMessage content={msg.content} />
                  </div>
                </div>
              </div>
            ))}

            {loading && thinkingSteps.length > 0 && (
              <div className="mb-2">
                <ThinkingBlock
                  steps={thinkingSteps}
                  sources={thinkingSources}
                  isActive={true}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && !loading && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
              {['What is RAG?', 'Explain ReAct', 'Quiz me on tools', 'Interview tips'].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => inputRef.current?.form?.requestSubmit(), 50);
                  }}
                  className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-primary-500/30 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[var(--border)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about AI Agents, RAG, Tools..."
                disabled={loading}
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[16px] leading-normal text-[var(--text-default)] placeholder:text-[var(--text-dimmed)] outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition-all hover:bg-primary-600 disabled:opacity-40 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
