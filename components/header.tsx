'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Brain, Database, Wrench, MessageSquare, GraduationCap, Github } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const docsNav = [
  { title: 'AI Agents', href: '/docs/ai-agents', icon: Brain },
  { title: 'RAG', href: '/docs/rag', icon: Database },
  { title: 'Tools', href: '/docs/tools-actions', icon: Wrench },
  { title: 'Prompts', href: '/docs/system-prompts', icon: MessageSquare },
  { title: 'Interview', href: '/docs/interview-prep', icon: GraduationCap },
];

export function Header() {
  const pathname = usePathname();
  const isDocsPage = pathname.startsWith('/docs');

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white transition-transform group-hover:scale-105">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <span className="text-[0.95rem] font-bold text-[var(--text-highlighted)] tracking-tight">
            TechStore
          </span>
          <span className="hidden sm:inline rounded-md bg-[var(--bg-muted)] px-2 py-0.5 text-xs font-medium text-[var(--text-dimmed)]">
            v1.0
          </span>
        </Link>

        {/* Desktop docs nav */}
        {isDocsPage && (
          <nav className="hidden lg:flex items-center gap-1">
            {docsNav.map((navItem) => {
              const isActive = pathname.startsWith(
                navItem.href.split('/').slice(0, 3).join('/')
              );
              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-default)]'
                  }`}
                >
                  <navItem.icon className="h-4 w-4" />
                  {navItem.title}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:text-[var(--text-default)] hover:bg-[var(--bg-muted)]"
          >
            <Github className="h-[1.1rem] w-[1.1rem]" />
          </a>
        </div>
      </div>
    </header>
  );
}
