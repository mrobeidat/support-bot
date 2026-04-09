'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Info, Bot, Database, Wrench, MessageSquare, GraduationCap,
} from 'lucide-react';
import { navigation } from '@/lib/navigation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Info, Bot, Database, Wrench, MessageSquare, GraduationCap,
};

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-8 py-8 pr-6">
      {navigation.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2.5 px-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-dimmed)]">
            {section.title}
          </h4>
          <ul className="space-y-0.5">
            {section.items.map((navItem) => {
              const Icon = iconMap[navItem.icon] || Info;
              const isActive = pathname === `/docs/${navItem.slug}`;
              return (
                <li key={navItem.slug}>
                  <Link
                    href={`/docs/${navItem.slug}`}
                    onClick={onNavigate}
                    className={`group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-600 font-medium dark:text-primary-400'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-default)]'
                    }`}
                  >
                    <Icon
                      className={`h-[1.125rem] w-[1.125rem] shrink-0 transition-colors ${
                        isActive
                          ? 'text-primary-500 dark:text-primary-400'
                          : 'text-[var(--text-dimmed)] group-hover:text-[var(--text-muted)]'
                      }`}
                    />
                    {navItem.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
