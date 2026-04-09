'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Mobile nav trigger — no z-index here so the drawer's z-[55] isn't trapped */}
      <div className="sticky top-16 flex items-center border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-lg px-4 py-2 lg:hidden">
        <MobileNav />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-r border-[var(--border)]">
            <Sidebar />
          </aside>

          {/* Main content area (page renders content + TOC) */}
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
