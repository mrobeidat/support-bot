import fs from 'fs';
import path from 'path';

// --- Types ---

interface Chunk {
  text: string;
  source: string;
  section: string;
}

interface EmbeddedChunk extends Chunk {
  vector: number[];
}

export interface SearchResult {
  text: string;
  source: string;
  section: string;
  score: number;
}

// --- Cache (persists across requests via Fluid Compute) ---

let cachedChunks: EmbeddedChunk[] | null = null;
let vocabulary: string[] | null = null;
let idfValues: Map<string, number> | null = null;

// --- Chunking ---

function loadAndChunk(): Chunk[] {
  const kbDir = path.join(process.cwd(), 'src', 'data', 'knowledge-base');
  const files = fs.readdirSync(kbDir).filter((f) => f.endsWith('.md'));

  const chunks: Chunk[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(kbDir, file), 'utf-8');
    const docTitle = content.match(/^# (.+)/m)?.[1] || file.replace('.md', '');

    const sections = content.split(/^## /m).slice(1);

    for (const section of sections) {
      const lines = section.split('\n');
      const sectionTitle = lines[0].trim();
      const sectionBody = lines.slice(1).join('\n').trim();

      if (sectionBody.length > 0) {
        chunks.push({
          text: `# ${docTitle}\n## ${sectionTitle}\n${sectionBody}`,
          source: file.replace('.md', ''),
          section: sectionTitle,
        });
      }
    }
  }

  return chunks;
}

// --- TF-IDF Vectorization (real vectors, no API needed) ---

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'this', 'that', 'these',
  'those', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
  'about', 'with', 'from', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
  'and', 'but', 'or', 'nor', 'not', 'only', 'own', 'same', 'than', 'too',
  'very', 'just', 'because', 'also', 'more', 'most', 'other', 'some', 'such',
  'each', 'every', 'all', 'both', 'few', 'any', 'for', 'out', 'off', 'over',
  'you', 'your', 'yours', 'him', 'her', 'its', 'our', 'they', 'them', 'their',
  'tell', 'know', 'think', 'want', 'need', 'like', 'make', 'get', 'got',
  'let', 'say', 'said', 'yes', 'hey', 'please', 'thanks', 'hello',
  'me', 'my', 'i', 'we', 'it', 'he', 'she', 'use', 'used', 'using',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function buildVocabularyAndIdf(chunks: Chunk[]): { vocab: string[]; idf: Map<string, number> } {
  const docFreq = new Map<string, number>();
  const allTokenSets: Set<string>[] = [];

  for (const chunk of chunks) {
    const tokens = new Set(tokenize(chunk.text));
    allTokenSets.push(tokens);
    for (const token of tokens) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  const n = chunks.length;
  const idf = new Map<string, number>();
  const vocab: string[] = [];

  for (const [term, df] of docFreq) {
    // Only keep terms that appear in at least 1 doc but not ALL docs (those have no discriminating power)
    if (df < n) {
      idf.set(term, Math.log((n + 1) / (df + 1)) + 1); // smoothed IDF
      vocab.push(term);
    }
  }

  return { vocab, idf };
}

function textToVector(text: string, vocab: string[], idf: Map<string, number>): number[] {
  const tokens = tokenize(text);
  const tf = new Map<string, number>();

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize TF by max frequency
  const maxTf = Math.max(...tf.values(), 1);

  const vector = new Array(vocab.length).fill(0);

  for (let i = 0; i < vocab.length; i++) {
    const term = vocab[i];
    const termTf = tf.get(term) || 0;
    const termIdf = idf.get(term) || 0;
    vector[i] = (termTf / maxTf) * termIdf;
  }

  return vector;
}

function getEmbeddedChunks(): EmbeddedChunk[] {
  if (cachedChunks) return cachedChunks;

  const chunks = loadAndChunk();

  const { vocab, idf } = buildVocabularyAndIdf(chunks);
  vocabulary = vocab;
  idfValues = idf;

  cachedChunks = chunks.map((chunk) => ({
    ...chunk,
    vector: textToVector(chunk.text, vocab, idf),
  }));

  return cachedChunks;
}

// --- Cosine Similarity ---

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// --- Search ---

const MIN_SIMILARITY = 0.08;

export async function searchDetailed(query: string, topK: number = 3): Promise<SearchResult[]> {
  const chunks = getEmbeddedChunks();

  if (!vocabulary || !idfValues) return [];

  const queryVector = textToVector(query, vocabulary, idfValues);

  // Check if query produced any non-zero vector (has meaningful terms)
  const queryNorm = queryVector.reduce((sum, v) => sum + v * v, 0);
  if (queryNorm === 0) return [];

  const scored = chunks
    .map((chunk) => ({
      text: chunk.text,
      source: chunk.source,
      section: chunk.section,
      score: cosineSimilarity(queryVector, chunk.vector),
    }))
    .filter((r) => r.score >= MIN_SIMILARITY)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export async function searchKnowledgeBase(query: string, topK: number = 3): Promise<string> {
  const results = await searchDetailed(query, topK);

  if (results.length === 0) {
    return 'No relevant information found in the study materials.';
  }

  return results.map((item) => item.text).join('\n\n---\n\n');
}
