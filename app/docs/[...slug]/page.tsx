import { notFound } from 'next/navigation';
import { getDocPage, getAllSlugs } from '@/content';
import { findNavItem, getPrevNext } from '@/lib/navigation';
import { ClientToc } from './client-toc';
import { PrevNext } from '@/components/prev-next';
import { AskAiEnhancer } from '@/components/ask-ai';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug: slug.split('/') }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  const page = getDocPage(slug);
  if (!page) notFound();

  const navInfo = findNavItem(slug);
  const { prev, next } = getPrevNext(slug);
  const Content = page.content;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-8 xl:grid-cols-[1fr_220px]">
      <article className="docs-content animate-fade-in-up py-8 pb-24">
        {navInfo && (
          <p className="mb-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
            {navInfo.section.title}
          </p>
        )}

        <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight tracking-tight text-[var(--text-highlighted)]">
          {page.title}
        </h1>
        <p className="mt-3 text-[clamp(1rem,2vw,1.1rem)] leading-relaxed text-[var(--text-muted)]">
          {page.description}
        </p>

        <hr />

        <AskAiEnhancer>
          <Content />
        </AskAiEnhancer>

        <PrevNext prev={prev} next={next} />
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <ClientToc headings={page.headings} />
        </div>
      </aside>
    </div>
  );
}
