import { Callout } from '@/components/callout';
import { CodeBlock } from '@/components/code-block';

export function RAGContent() {
  return (
    <>
      <h2 id="what-is-rag">What Is RAG?</h2>
      <p>
        <strong>Retrieval-Augmented Generation (RAG)</strong> is a technique that gives an LLM
        access to external knowledge by retrieving relevant documents before generating a response.
        Instead of relying solely on what the model memorized during training, RAG lets you ground
        answers in your actual data &mdash; product docs, help articles, policy documents, etc.
      </p>
      <p>
        Why it matters: LLMs hallucinate. They confidently make things up. RAG dramatically reduces
        hallucination by giving the model real source material to reference. For customer support,
        this is the difference between &quot;I think the return policy is 30 days&quot; and
        &quot;According to our return policy, you have 30 days from the date of purchase.&quot;
      </p>

      <h2 id="rag-pipeline">The RAG Pipeline</h2>
      <p>
        RAG has two phases: an <strong>offline ingestion</strong> phase (done ahead of time) and an
        <strong>online retrieval + generation</strong> phase (at query time).
      </p>

      <h3 id="step-1-ingest">Step 1: Ingest Documents</h3>
      <p>
        Split your documents into chunks, convert each chunk into a vector embedding, and store them
        in a vector database.
      </p>

      <CodeBlock
        filename="ingest.ts"
        language="typescript"
        code={`import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

interface DocumentChunk {
  id: string;
  text: string;
  metadata: { source: string; title: string };
}

async function ingestDocuments(chunks: DocumentChunk[]) {
  for (const chunk of chunks) {
    // Convert text to a vector embedding
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: chunk.text,
    });

    // Store in your vector database
    await vectorStore.upsert({
      id: chunk.id,
      values: embedding,       // [0.023, -0.041, 0.078, ...]
      metadata: {
        text: chunk.text,
        source: chunk.metadata.source,
        title: chunk.metadata.title,
      },
    });
  }
}`}
      />

      <h3 id="step-2-retrieve">Step 2: Retrieve Relevant Chunks</h3>
      <p>
        When a user asks a question, embed their query using the same model, then find the most
        similar document chunks via vector search.
      </p>

      <CodeBlock
        filename="retrieve.ts"
        language="typescript"
        code={`async function retrieveContext(query: string, topK = 5) {
  // Embed the user's question
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Search for similar document chunks
  const results = await vectorStore.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  // Return the text of matching chunks
  return results.matches.map((match) => ({
    text: match.metadata.text,
    source: match.metadata.source,
    score: match.score,  // similarity score (0 to 1)
  }));
}`}
      />

      <h3 id="step-3-generate">Step 3: Generate a Grounded Response</h3>
      <p>
        Pass the retrieved context to the LLM alongside the user&apos;s question so the model can
        answer based on real data.
      </p>

      <CodeBlock
        filename="generate.ts"
        language="typescript"
        code={`import { generateText } from 'ai';

async function answerWithRAG(userQuestion: string) {
  const context = await retrieveContext(userQuestion);

  const contextText = context
    .map((c) => \`[Source: \${c.source}]\\n\${c.text}\`)
    .join('\\n\\n');

  const response = await generateText({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'system',
        content: \`You are a helpful support agent. Answer the
user's question using ONLY the provided context.
If the context doesn't contain the answer, say so.

Context:
\${contextText}\`,
      },
      { role: 'user', content: userQuestion },
    ],
  });

  return response.text;
}`}
      />

      <h2 id="embeddings-explained">Embeddings Explained</h2>
      <p>
        An <strong>embedding</strong> is a list of numbers (a vector) that represents the
        <em>meaning</em> of a piece of text. Texts with similar meanings have vectors that are close
        together in this high-dimensional space.
      </p>
      <ul>
        <li>
          <strong>&quot;How do I return an item?&quot;</strong> and <strong>&quot;What is your return
          policy?&quot;</strong> will have very similar embeddings, even though the words are
          different.
        </li>
        <li>
          <strong>&quot;How do I return an item?&quot;</strong> and <strong>&quot;What are your
          business hours?&quot;</strong> will have very different embeddings.
        </li>
      </ul>
      <p>
        Common embedding models: OpenAI&apos;s <code>text-embedding-3-small</code> (1536
        dimensions, cheap and fast) and <code>text-embedding-3-large</code> (3072 dimensions, more
        accurate). The dimension count is the length of the vector.
      </p>

      <h2 id="vector-similarity">Vector Similarity Search</h2>
      <p>
        To find which documents are most relevant to a query, we compute the <strong>cosine
        similarity</strong> between the query vector and each document vector. Cosine similarity
        measures the angle between two vectors &mdash; a score of 1 means identical direction, 0
        means unrelated.
      </p>

      <CodeBlock
        filename="cosine-similarity.ts"
        language="typescript"
        code={`function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Example usage
const queryVec = await getEmbedding("How do I reset my password?");
const docVec = await getEmbedding("Password reset instructions...");

const similarity = cosineSimilarity(queryVec, docVec);
// => 0.92 (very similar)`}
      />

      <Callout type="info" title="In Practice">
        <p>
          You won&apos;t implement cosine similarity yourself &mdash; vector databases handle this
          for you at scale using approximate nearest neighbor (ANN) algorithms. But understanding how
          it works is important for interviews and debugging relevance issues.
        </p>
      </Callout>

      <h2 id="chunking-strategies">Chunking Strategies</h2>
      <p>
        How you split documents into chunks directly affects retrieval quality. Too large and you
        waste context window space; too small and you lose meaning.
      </p>

      <h3 id="chunking-by-headers">By Headers / Sections</h3>
      <p>
        Split on <code>h1</code>/<code>h2</code>/<code>h3</code> boundaries in your docs. Each
        section becomes one chunk. This is the best approach for structured documentation because
        each chunk is a self-contained topic.
      </p>

      <h3 id="chunking-fixed-size">Fixed Size with Overlap</h3>
      <p>
        Split every N tokens (e.g., 500) with an overlap of M tokens (e.g., 50). Simple and
        predictable, but can cut sentences or ideas in half. The overlap helps preserve context at
        boundaries.
      </p>

      <h3 id="chunking-semantic">Semantic Chunking</h3>
      <p>
        Use the embedding model itself to detect topic shifts. When the similarity between
        consecutive sentences drops below a threshold, start a new chunk. More sophisticated but
        slower to compute at ingestion time.
      </p>

      <Callout type="warning" title="Common Pitfall">
        <p>
          Always include metadata with your chunks &mdash; at minimum the source document title and
          URL. Without metadata, you can&apos;t tell the user <em>where</em> the answer came from,
          and you can&apos;t debug why the wrong chunk was retrieved.
        </p>
      </Callout>

      <h2 id="vector-stores">Vector Stores</h2>
      <p>
        A vector store (or vector database) is optimized for storing and querying high-dimensional
        vectors. Common options:
      </p>
      <ul>
        <li>
          <strong>Pinecone:</strong> Fully managed, serverless option. Easy to set up, scales
          automatically. Popular choice for production RAG systems.
        </li>
        <li>
          <strong>pgvector:</strong> PostgreSQL extension. Great if you already use Postgres &mdash;
          keeps everything in one database. Good for moderate scale.
        </li>
        <li>
          <strong>Weaviate / Qdrant / Milvus:</strong> Open-source vector databases with more
          features (hybrid search, filtering). Good for complex retrieval needs.
        </li>
        <li>
          <strong>In-memory:</strong> Store vectors in a simple array for development and testing.
          Fine for small datasets (under ~10K chunks). Not for production.
        </li>
      </ul>

      <h2 id="common-problems">Common RAG Problems and Fixes</h2>
      <ul>
        <li>
          <strong>Retrieving irrelevant chunks:</strong> Improve chunking (smaller, more focused
          chunks), add metadata filtering, or try a re-ranking step after retrieval.
        </li>
        <li>
          <strong>Missing information:</strong> The answer exists in your docs but wasn&apos;t
          retrieved. Increase <code>topK</code>, try hybrid search (combining vector + keyword
          search), or improve chunk boundaries.
        </li>
        <li>
          <strong>Hallucination despite context:</strong> Strengthen the system prompt with explicit
          instructions like &quot;Only answer from the provided context. If the answer isn&apos;t
          there, say you don&apos;t know.&quot;
        </li>
        <li>
          <strong>Stale information:</strong> Set up a pipeline to re-ingest documents when they
          change. Use document hashes or timestamps to detect updates.
        </li>
        <li>
          <strong>Context window overflow:</strong> You retrieved too many chunks or the chunks are
          too large. Reduce <code>topK</code>, use smaller chunks, or summarize retrieved content
          before passing to the LLM.
        </li>
      </ul>

      <Callout type="tip" title="Interview Tip">
        <p>
          Be ready to draw the full RAG pipeline on a whiteboard: Ingest (chunk &rarr; embed &rarr;
          store) and Query (embed query &rarr; vector search &rarr; inject context &rarr; generate).
          Interviewers love asking &quot;what happens when the knowledge base returns bad
          results?&quot; &mdash; have 2&ndash;3 fixes ready (re-ranking, hybrid search, better
          chunking). Also know the tradeoffs between vector store options.
        </p>
      </Callout>
    </>
  );
}

export const ragPages = {
  'rag': {
    title: 'Retrieval-Augmented Generation (RAG)',
    description: 'How RAG works: embeddings, vector search, chunking strategies, and building a retrieval pipeline.',
    section: 'Core Concepts',
    headings: [
      { id: 'what-is-rag', title: 'What Is RAG?', level: 2 },
      { id: 'rag-pipeline', title: 'The RAG Pipeline', level: 2 },
      { id: 'step-1-ingest', title: 'Step 1: Ingest Documents', level: 3 },
      { id: 'step-2-retrieve', title: 'Step 2: Retrieve Relevant Chunks', level: 3 },
      { id: 'step-3-generate', title: 'Step 3: Generate a Grounded Response', level: 3 },
      { id: 'embeddings-explained', title: 'Embeddings Explained', level: 2 },
      { id: 'vector-similarity', title: 'Vector Similarity Search', level: 2 },
      { id: 'chunking-strategies', title: 'Chunking Strategies', level: 2 },
      { id: 'chunking-by-headers', title: 'By Headers / Sections', level: 3 },
      { id: 'chunking-fixed-size', title: 'Fixed Size with Overlap', level: 3 },
      { id: 'chunking-semantic', title: 'Semantic Chunking', level: 3 },
      { id: 'vector-stores', title: 'Vector Stores', level: 2 },
      { id: 'common-problems', title: 'Common RAG Problems and Fixes', level: 2 },
    ],
    content: RAGContent,
  },
};
