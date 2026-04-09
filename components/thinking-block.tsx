'use client';

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronDown, Search, Sparkles, FileText, Check } from 'lucide-react';

export interface ThinkingStep {
  id: string;
  label: string;
  status: 'in_progress' | 'completed';
  durationMs?: number;
  detail?: string;
}

export interface ThinkingSource {
  file: string;
  section: string;
  score: number;
}

interface ThinkingBlockProps {
  steps: ThinkingStep[];
  sources: ThinkingSource[];
  totalMs?: number;
  isActive: boolean;
}

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30 };
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

function fmt(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function ThinkingBlock({ steps, sources, totalMs, isActive }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(true);
  const isDone = !isActive && totalMs != null;
  const showBody = expanded || isActive;

  return (
    <div className="flex justify-start">
      <LayoutGroup>
        {/* Single animated glass element */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: EASE } }}
          className="liquid-glass max-w-[92%] w-full cursor-pointer select-none"
          onClick={() => isDone && setExpanded((v) => !v)}
        >
          {/* Header row — z-10 to stay above the ::before specular overlay */}
          <motion.div layout="position" className="flex items-center justify-between px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              {isActive ? (
                <Sparkles className="h-3.5 w-3.5 text-primary-400 thinking-sparkle" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
              )}
              <span className="text-[12px] font-medium text-[var(--text-highlighted)]">
                {isActive ? (
                  <span className="thinking-shimmer-text">Thinking</span>
                ) : (
                  `Thought for ${fmt(totalMs ?? 0)}`
                )}
              </span>
            </div>
            {isDone && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-dimmed)]" />
              </motion.div>
            )}
          </motion.div>

          {/* Body — animates as part of the same glass element */}
          <AnimatePresence initial={false}>
            {showBody && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="px-3.5 pb-3">
                  {steps.map((step, i) => (
                    <div key={step.id + '-' + i}>
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, ease: EASE, delay: i * 0.05 }}
                        className="flex items-center gap-2 py-1"
                      >
                        {/* Status dot */}
                        {step.status === 'in_progress' ? (
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16">
                              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-400/25" />
                              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="38" strokeDashoffset="28" strokeLinecap="round" className="text-primary-400" />
                            </svg>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={SPRING}
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-500"
                          >
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}

                        {/* Label + detail + duration */}
                        <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {step.id === 'search' ? (
                              <Search className="h-3 w-3 shrink-0 text-[var(--text-dimmed)]" />
                            ) : (
                              <Sparkles className="h-3 w-3 shrink-0 text-[var(--text-dimmed)]" />
                            )}
                            <span className="text-[11px] text-[var(--text-default)] truncate">
                              {step.label}
                            </span>
                            {step.detail && step.status === 'completed' && (
                              <span className="text-[10px] text-[var(--text-dimmed)] shrink-0">
                                · {step.detail}
                              </span>
                            )}
                          </div>
                          {step.durationMs != null && step.status === 'completed' && (
                            <span className="text-[10px] font-mono text-[var(--text-dimmed)] shrink-0">
                              {fmt(step.durationMs)}
                            </span>
                          )}
                        </div>
                      </motion.div>

                      {/* Sources */}
                      {step.id === 'search' && step.status === 'completed' && sources.length > 0 && (
                        <div className="ml-6 border-l border-white/10 pl-2.5 py-0.5 mb-0.5">
                          {sources.map((src, j) => (
                            <motion.div
                              key={j}
                              initial={{ opacity: 0, y: -3 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: EASE, delay: 0.08 + j * 0.04 }}
                              className="flex items-center gap-1.5 py-[2px]"
                            >
                              <FileText className="h-2.5 w-2.5 shrink-0 text-[var(--text-dimmed)]" />
                              <span className="text-[10px] text-[var(--text-muted)] truncate">{src.file}</span>
                              <span className="text-[9px] text-[var(--text-dimmed)]">→</span>
                              <span className="text-[10px] text-[var(--text-muted)] truncate">{src.section}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
