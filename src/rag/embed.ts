/**
 * RAG: Embeddings
 *
 * Converts text into vector embeddings using OpenAI's embedding API.
 * We use OpenAI here because they have a dedicated embeddings endpoint.
 * Anthropic doesn't have one, so even when using Claude as the LLM,
 * we use OpenAI for embeddings — this is common in production.
 */

import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI();
  }
  return client;
}

export async function embed(texts: string[]): Promise<number[][]> {
  // If no OpenAI key, fall back to simple TF-IDF-like embeddings
  if (!process.env.OPENAI_API_KEY) {
    console.log("[RAG] No OPENAI_API_KEY — using simple keyword embeddings (less accurate)");
    return texts.map(simpleEmbed);
  }

  const openai = getClient();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}

/**
 * Fallback: simple bag-of-words embedding.
 * Not as good as real embeddings, but works without an API key.
 * Good for demos and understanding the concept.
 */
function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  // Use a fixed vocabulary of common support terms
  const vocab = [
    "shipping", "ship", "delivery", "deliver", "track", "tracking",
    "return", "refund", "exchange", "money", "back",
    "order", "status", "cancel", "cancelled",
    "price", "cost", "discount", "sale", "coupon", "free",
    "account", "password", "login", "email", "security",
    "product", "warranty", "defect", "broken", "damage",
    "help", "support", "contact", "phone", "chat",
    "policy", "rule", "hour", "time", "day", "week",
    "payment", "card", "billing", "charge",
    "international", "express", "standard",
    "student", "military", "bulk", "loyalty",
  ];

  // Count occurrences of each vocab word
  const vector = vocab.map((v) => {
    const count = words.filter((w) => w.includes(v) || v.includes(w)).length;
    return count;
  });

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / magnitude);
}
