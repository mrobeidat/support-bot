/**
 * RAG: Retrieve
 *
 * The query-time part of RAG:
 * 1. Take the user's question
 * 2. Embed it (convert to vector)
 * 3. Search the vector store for similar chunks
 * 4. Return the most relevant chunks
 */

import { embed } from "./embed.js";
import { search, type SearchResult } from "./store.js";

export async function retrieve(
  query: string,
  topK: number = 3
): Promise<SearchResult[]> {
  // Embed the query
  const [queryEmbedding] = await embed([query]);

  // Search for similar chunks
  const results = search(queryEmbedding, topK);

  // Filter out low-relevance results (threshold depends on embedding model)
  const threshold = process.env.OPENAI_API_KEY ? 0.3 : 0.1;
  return results.filter((r) => r.score > threshold);
}
