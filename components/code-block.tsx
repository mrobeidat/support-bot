'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group my-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
      {filename && (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
          <span className="text-xs font-medium text-[var(--text-dimmed)] font-mono">
            {filename}
          </span>
          <CopyButton copied={copied} onCopy={handleCopy} />
        </div>
      )}
      <div className="relative">
        {!filename && (
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton copied={copied} onCopy={handleCopy} />
          </div>
        )}
        <pre className="overflow-x-auto p-4 text-[0.8rem] leading-6">
          <code className={`language-${language} font-mono text-[var(--text-default)]`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      onClick={onCopy}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-dimmed)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-default)]"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
