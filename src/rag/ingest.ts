/**
 * RAG: Ingest & Chunk
 *
 * Loads markdown files from the knowledge base, splits them into chunks,
 * and stores them in the vector store.
 *
 * Chunking strategy: split by markdown heading (##). Each chunk is a section
 * with its heading for context. This is a simple but effective approach for
 * structured help articles.
 */

import { readdirSync, readFileSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { addToStore, type Chunk } from "./store.js";
import { embed } from "./embed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_DIR = join(__dirname, "../data/knowledge-base");

interface RawChunk {
  content: string;
  source: string;
}

function chunkMarkdown(content: string, filename: string): RawChunk[] {
  const chunks: RawChunk[] = [];
  const source = basename(filename, ".md");

  // Split by ## headings — each section becomes a chunk
  const sections = content.split(/(?=^## )/m);

  // Get the title (# heading) if present
  let title = "";
  const titleMatch = content.match(/^# (.+)/m);
  if (titleMatch) {
    title = titleMatch[1];
  }

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed || trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      continue; // skip the title-only section
    }

    // Prepend the document title for context
    const chunkContent = title
      ? `${title}\n\n${trimmed}`
      : trimmed;

    chunks.push({
      content: chunkContent,
      source: `${source}.md`,
    });
  }

  // If no ## sections found, use the entire document as one chunk
  if (chunks.length === 0 && content.trim()) {
    chunks.push({
      content: content.trim(),
      source: `${source}.md`,
    });
  }

  return chunks;
}

export async function ingestKnowledgeBase(): Promise<number> {
  const files = readdirSync(KB_DIR).filter((f) => f.endsWith(".md"));
  const allChunks: RawChunk[] = [];

  for (const file of files) {
    const content = readFileSync(join(KB_DIR, file), "utf-8");
    const chunks = chunkMarkdown(content, file);
    allChunks.push(...chunks);
  }

  console.log(`[RAG] Loaded ${files.length} articles, ${allChunks.length} chunks`);

  // Embed all chunks
  const texts = allChunks.map((c) => c.content);
  const embeddings = await embed(texts);

  // Store in vector store
  for (let i = 0; i < allChunks.length; i++) {
    const chunk: Chunk = {
      content: allChunks[i].content,
      source: allChunks[i].source,
      embedding: embeddings[i],
    };
    addToStore(chunk);
  }

  console.log(`[RAG] Embedded and stored ${allChunks.length} chunks`);
  return allChunks.length;
}

// Allow running standalone: npx tsx src/rag/ingest.ts
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ""))) {
  ingestKnowledgeBase().catch(console.error);
}
