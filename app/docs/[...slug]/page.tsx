'use client';

import { useParams, notFound } from 'next/navigation';
import { getDocPage } from '@/content';
import { findNavItem, getPrevNext } from '@/lib/navigation';
import { TableOfContents } from '@/components/toc';
import { PrevNext } from '@/components/prev-next';

export default function DocPage() {
  const params = useParams();
  const slugArray = params.slug as string[];
  const slug = slugArray.join('/');

  const page = getDocPage(slug);
  const navInfo = findNavItem(slug);
  const { prev, next } = getPrevNext(slug);

  if (!page) {
    notFound();
  }

  const Content = page.content;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-8 xl:grid-cols-[1fr_220px]">
      {/* Content */}
      <article className="docs-content animate-fade-in-up py-8 pb-24">
        {/* Breadcrumb */}
        {navInfo && (
          <p className="mb-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
            {navInfo.section.title}
          </p>
        )}

        {/* Title */}
        <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight tracking-tight text-[var(--text-highlighted)]">
          {page.title}
        </h1>
        <p className="mt-3 text-[clamp(1rem,2vw,1.1rem)] leading-relaxed text-[var(--text-muted)]">
          {page.description}
        </p>

        <hr />

        {/* Page content */}
        <Content />

        {/* Prev/Next */}
        <PrevNext prev={prev} next={next} />
      </article>

      {/* TOC rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <TableOfContents headings={page.headings} />
        </div>
      </aside>
    </div>
  );
}
