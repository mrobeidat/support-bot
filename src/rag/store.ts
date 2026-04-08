/**
 * RAG: In-Memory Vector Store
 *
 * Stores document chunks with their embeddings and supports
 * similarity search using cosine similarity.
 *
 * In production, you'd use a real vector database (Pinecone, Weaviate, ChromaDB).
 * This in-memory version is great for understanding how vector search works.
 */

export interface Chunk {
  content: string;
  source: string;
  embedding: number[];
}

export interface SearchResult {
  content: string;
  source: string;
  score: number;
}

// The "database" — just an array in memory
const store: Chunk[] = [];

export function addToStore(chunk: Chunk): void {
  store.push(chunk);
}

export function clearStore(): void {
  store.length = 0;
}

export function getStoreSize(): number {
  return store.length;
}

/**
 * Cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 means identical direction.
 *
 * This is the core of vector search:
 * - Convert question to a vector
 * - Convert each document chunk to a vector
 * - Find chunks whose vectors point in the most similar direction
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Search the vector store for the most similar chunks to the query embedding.
 * Returns the top-k results sorted by similarity score.
 */
export function search(queryEmbedding: number[], topK: number = 3): SearchResult[] {
  const results: SearchResult[] = store.map((chunk) => ({
    content: chunk.content,
    source: chunk.source,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by similarity (highest first) and return top-k
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}
