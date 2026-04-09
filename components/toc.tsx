'use client';

import { useEffect, useState } from 'react';

export interface TocHeading {
  id: string;
  title: string;
  level: number;
}

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -75% 0px', threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="py-8 pl-6">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-dimmed)]">
        On this page
      </h4>
      <ul className="space-y-1 border-l border-[var(--border)]">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`relative block border-l-2 py-1 text-[0.8rem] leading-snug transition-colors ${
                  heading.level === 3 ? 'pl-6' : 'pl-4'
                } ${
                  isActive
                    ? 'border-primary-500 text-primary-600 font-medium dark:text-primary-400'
                    : 'border-transparent text-[var(--text-dimmed)] hover:text-[var(--text-default)] hover:border-[var(--border-accent)]'
                }`}
                style={{ marginLeft: '-2px' }}
              >
                {heading.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
