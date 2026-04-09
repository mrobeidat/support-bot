import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NavItem } from '@/lib/navigation';

export function PrevNext({ prev, next }: { prev: NavItem | null; next: NavItem | null }) {
  return (
    <div className="mt-16 grid grid-cols-1 gap-4 border-t border-dashed border-[var(--border)] pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex items-center gap-3 rounded-lg border border-[var(--border)] px-5 py-4 transition-colors hover:border-primary-500/30 hover:bg-[var(--bg-elevated)]"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--text-dimmed)] transition-transform group-hover:-translate-x-0.5 group-hover:text-primary-500" />
          <div>
            <p className="text-xs text-[var(--text-dimmed)]">Previous</p>
            <p className="text-sm font-medium text-[var(--text-highlighted)]">{prev.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex items-center justify-end gap-3 rounded-lg border border-[var(--border)] px-5 py-4 text-right transition-colors hover:border-primary-500/30 hover:bg-[var(--bg-elevated)]"
        >
          <div>
            <p className="text-xs text-[var(--text-dimmed)]">Next</p>
            <p className="text-sm font-medium text-[var(--text-highlighted)]">{next.title}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-dimmed)] transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
