'use client';

import { TableOfContents, type TocHeading } from '@/components/toc';

export function ClientToc({ headings }: { headings: TocHeading[] }) {
  return <TableOfContents headings={headings} />;
}
