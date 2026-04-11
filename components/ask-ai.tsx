'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { createRoot } from 'react-dom/client';

function AskButton({ title }: { title: string }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(
          new CustomEvent('ask-ai', { detail: { question: `Explain "${title}" simply and concisely` } })
        );
      }}
      className="ask-ai-btn"
      aria-label={`Ask AI about ${title}`}
      title="Ask AI about this section"
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>Ask AI</span>
    </button>
  );
}

export function AskAiEnhancer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll('h2[id], h3[id]');
    const cleanups: (() => void)[] = [];

    headings.forEach((heading) => {
      // Skip if already enhanced
      if (heading.querySelector('.ask-ai-btn')) return;

      // Make heading a positioning context
      (heading as HTMLElement).style.position = 'relative';

      // Create mount point
      const mount = document.createElement('span');
      mount.className = 'ask-ai-mount';
      heading.appendChild(mount);

      const root = createRoot(mount);
      root.render(<AskButton title={heading.textContent || ''} />);

      cleanups.push(() => {
        root.unmount();
        mount.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
