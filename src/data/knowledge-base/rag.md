# RAG (Retrieval-Augmented Generation)

## What is RAG?

RAG is a technique that improves LLM responses by first retrieving relevant information from a knowledge base, then feeding that information as context to the LLM before it generates a response.

Instead of relying only on what the LLM was trained on (which can be outdated or wrong), RAG grounds the response in your actual data — help articles, product docs, FAQs, policies.

This is critical for customer support because:
- The LLM doesn't know your company's specific policies
- Information changes frequently (pricing, features, processes)
- Responses must be accurate — wrong answers destroy customer trust
- You need the LLM to cite sources, not hallucinate

## The RAG Pipeline

### Step 1: Ingest (Offline / Build Time)

You take your source documents (help articles, docs, FAQs) and prepare them:

1. **Load** the documents (markdown files, web pages, PDFs)
2. **Chunk** them into smaller pieces (paragraphs or sections)
3. **Embed** each chunk — convert text into a numerical vector using an embedding model
4. **Store** the vectors in a vector database

Why chunk? Because LLMs have limited context windows. You can't send the entire knowledge base. Chunking lets you send only the most relevant pieces.

### Step 2: Retrieve (Query Time)

When a customer asks a question:

1. **Embed the query** using the same embedding model
2. **Search** the vector store for chunks whose vectors are closest to the query vector
3. **Return top-K results** (typically 3-5 most relevant chunks)

### Step 3: Generate (Query Time)

1. **Inject** the retrieved chunks into the LLM's prompt as context
2. The LLM generates a response **grounded in the retrieved information**
3. The response can cite which document/section the answer came from

## Embeddings Explained

An embedding converts text into a list of numbers (a vector). Similar texts produce similar vectors.

For example:
- "How do I return an item?" → [0.12, -0.45, 0.78, ...]
- "What's your return policy?" → [0.11, -0.43, 0.80, ...]  (very similar!)
- "What's the weather today?" → [-0.89, 0.22, -0.15, ...]  (very different)

Popular embedding models:
- OpenAI `text-embedding-3-small` (good balance of quality and cost)
- OpenAI `text-embedding-3-large` (higher quality, more expensive)
- Cohere Embed v3
- Open-source: sentence-transformers, BGE

## Vector Similarity Search

To find relevant chunks, we compare vectors using cosine similarity:
- Score of 1.0 = identical meaning
- Score of 0.0 = completely unrelated
- Typically, results above 0.3-0.5 are considered relevant

This is much better than keyword search because it understands meaning:
- Query: "refund" matches chunks about "return policy" and "money back"
- Keyword search would miss "money back" because the word "refund" isn't there

## Chunking Strategies

How you split documents matters a lot:

- **By headers**: Split on ## or ### markdown headers. Best for structured docs.
- **Fixed size**: Split every N tokens (e.g., 500 tokens per chunk). Simple but can break mid-sentence.
- **Semantic**: Split when the topic changes. Best quality but more complex.
- **Recursive**: Try splitting by paragraphs first, then sentences if chunks are too large.

Best practices:
- Include the document title and section header in each chunk for context
- Keep chunks between 200-1000 tokens
- Add some overlap between chunks (e.g., 50 tokens) so information at boundaries isn't lost

## Vector Stores

Where you store the embeddings:

- **In-memory**: Simple array with cosine similarity. Good for small datasets (<10K chunks).
- **Pinecone**: Managed vector database. Easy to use, scales well.
- **Weaviate**: Open-source, self-hosted or managed.
- **pgvector**: PostgreSQL extension. Great if you already use Postgres.
- **Qdrant**: Open-source, fast, good for production.
- **Chroma**: Open-source, developer-friendly, good for prototyping.

## Common RAG Problems

1. **Retrieval misses**: The right chunk isn't in the top-K results. Fix: better chunking, better embeddings, or hybrid search (combine vector + keyword).
2. **Wrong context**: Retrieved chunks are irrelevant. Fix: add a relevance threshold, rerank results.
3. **Hallucination despite context**: The LLM ignores the retrieved content. Fix: stronger system prompt instructions ("only answer based on the provided context").
4. **Stale data**: Knowledge base is outdated. Fix: automated ingestion pipeline that updates when docs change.

## What to Say in the Interview

When asked about RAG:
- Walk through the pipeline: Ingest (chunk → embed → store) then Query (embed query → search → retrieve → generate)
- Explain WHY RAG matters: grounding, accuracy, up-to-date info
- Mention embeddings and how semantic search beats keyword search
- Talk about chunking strategies and why they matter
- Discuss practical challenges: retrieval quality, hallucination, stale data
- For OpenCX context: RAG is how the AI agent knows your company's help articles
