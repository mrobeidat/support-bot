import type { TocHeading } from '@/components/toc';
import { aiAgentsPages } from './ai-agents';
import { ragPages } from './rag';
import { toolsActionsPages } from './tools-actions';
import { systemPromptsPages } from './system-prompts';
import { interviewPrepPages } from './interview-prep';

export interface DocPage {
  title: string;
  description: string;
  section: string;
  headings: TocHeading[];
  content: React.ComponentType;
}

const pages: Record<string, DocPage> = {
  ...aiAgentsPages,
  ...ragPages,
  ...toolsActionsPages,
  ...systemPromptsPages,
  ...interviewPrepPages,
};

export function getDocPage(slug: string): DocPage | undefined {
  return pages[slug];
}

export function getAllSlugs(): string[] {
  return Object.keys(pages);
}
