export interface NavItem {
  title: string;
  slug: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: 'Core Concepts',
    items: [
      { title: 'AI Agents', slug: 'ai-agents', icon: 'Bot' },
      { title: 'RAG', slug: 'rag', icon: 'Database' },
      { title: 'Tools & Actions', slug: 'tools-actions', icon: 'Wrench' },
      { title: 'System Prompts', slug: 'system-prompts', icon: 'MessageSquare' },
    ],
  },
  {
    title: 'Interview',
    items: [
      { title: 'Prep & Questions', slug: 'interview-prep', icon: 'GraduationCap' },
    ],
  },
];

export function getAllSlugs(): string[] {
  return navigation.flatMap((section) => section.items.map((item) => item.slug));
}

export function findNavItem(slug: string) {
  for (const section of navigation) {
    const item = section.items.find((i) => i.slug === slug);
    if (item) return { section, item };
  }
  return undefined;
}

export function getPrevNext(slug: string) {
  const allItems = navigation.flatMap((s) => s.items);
  const idx = allItems.findIndex((i) => i.slug === slug);
  return {
    prev: idx > 0 ? allItems[idx - 1] : null,
    next: idx < allItems.length - 1 ? allItems[idx + 1] : null,
  };
}
