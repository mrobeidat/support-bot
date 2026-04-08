import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";

// ─── Types ───
interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

interface Order {
  orderId: string;
  customer: string;
  status: string;
  items: string[];
  total: number;
  trackingNumber?: string | null;
  estimatedDelivery?: string;
  shippedDate?: string | null;
  deliveredDate?: string;
  cancelledDate?: string;
  refundStatus?: string;
}

interface Chunk {
  content: string;
  source: string;
  embedding: number[];
}

interface SearchResult {
  content: string;
  source: string;
  score: number;
}

// ─── In-memory state (per cold start) ───
let vectorStore: Chunk[] = [];
let isIngested = false;
let ticketCounter = 1000;

// Simple conversation store (resets on cold start)
const sessions = new Map<string, Anthropic.MessageParam[]>();

// ─── RAG: Simple keyword embeddings ───
const VOCAB = [
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

function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  const vector = VOCAB.map((v) => {
    const count = words.filter((w) => w.includes(v) || v.includes(w)).length;
    return count;
  });
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / magnitude);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}

function searchStore(query: string, topK = 3): SearchResult[] {
  const qEmbed = simpleEmbed(query);
  const results = vectorStore.map((chunk) => ({
    content: chunk.content,
    source: chunk.source,
    score: cosineSimilarity(qEmbed, chunk.embedding),
  }));
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK).filter((r) => r.score > 0.1);
}

// ─── RAG: Ingest knowledge base ───
function ingestKnowledgeBase() {
  if (isIngested) return;

  const kbDir = join(process.cwd(), "src/data/knowledge-base");
  const files = readdirSync(kbDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const content = readFileSync(join(kbDir, file), "utf-8");
    const source = basename(file);
    let title = "";
    const titleMatch = content.match(/^# (.+)/m);
    if (titleMatch) title = titleMatch[1];

    const sections = content.split(/(?=^## )/m);
    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed || (trimmed.startsWith("# ") && !trimmed.startsWith("## "))) continue;
      const chunkContent = title ? `${title}\n\n${trimmed}` : trimmed;
      vectorStore.push({
        content: chunkContent,
        source,
        embedding: simpleEmbed(chunkContent),
      });
    }
    if (vectorStore.length === 0 && content.trim()) {
      vectorStore.push({
        content: content.trim(),
        source,
        embedding: simpleEmbed(content.trim()),
      });
    }
  }

  isIngested = true;
  console.log(`[RAG] Ingested ${vectorStore.length} chunks`);
}

// ─── Load orders ───
function loadOrders(): Order[] {
  const ordersPath = join(process.cwd(), "src/data/orders.json");
  return JSON.parse(readFileSync(ordersPath, "utf-8"));
}

// ─── Tool implementations ───
function searchKnowledgeBase(query: string): string {
  const results = searchStore(query, 3);
  if (results.length === 0) {
    return JSON.stringify({ found: false, message: "No relevant articles found." });
  }
  return JSON.stringify({
    found: true,
    results: results.map((r) => ({
      source: r.source,
      content: r.content,
      relevanceScore: r.score.toFixed(3),
    })),
  });
}

function checkOrder(orderId: string): string {
  const orders = loadOrders();
  const order = orders.find((o) => o.orderId.toUpperCase() === orderId.toUpperCase());
  if (!order) {
    return JSON.stringify({ found: false, message: `No order found with ID ${orderId}.` });
  }
  return JSON.stringify({
    found: true,
    ...order,
    total: `$${order.total.toFixed(2)}`,
    trackingNumber: order.trackingNumber ?? "Not yet assigned",
    estimatedDelivery: order.estimatedDelivery ?? "TBD",
  });
}

function createTicket(subject: string, description: string, priority: string): string {
  ticketCounter++;
  return JSON.stringify({
    success: true,
    ticketId: `TKT-${ticketCounter}`,
    subject,
    priority,
    message: `Ticket TKT-${ticketCounter} created. A specialist will follow up within 4 hours.`,
  });
}

function escalateToHuman(reason: string): string {
  return JSON.stringify({
    success: true,
    message: "Transferred to a human agent. Estimated wait: 2 minutes.",
    reason,
  });
}

// ─── Tool definitions ───
const tools: Anthropic.Tool[] = [
  {
    name: "search_knowledge_base",
    description: "Search the company knowledge base for information about products, policies, shipping, returns, pricing, accounts, and support.",
    input_schema: {
      type: "object" as const,
      properties: { query: { type: "string", description: "What to search for" } },
      required: ["query"],
    },
  },
  {
    name: "check_order",
    description: "Look up the status of a customer order by order ID.",
    input_schema: {
      type: "object" as const,
      properties: { order_id: { type: "string", description: "The order ID (e.g., ORD-12345)" } },
      required: ["order_id"],
    },
  },
  {
    name: "create_ticket",
    description: "Create a support ticket for issues that need follow-up.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: { type: "string", description: "Brief subject line" },
        description: { type: "string", description: "Detailed description" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
      },
      required: ["subject", "description", "priority"],
    },
  },
  {
    name: "escalate_to_human",
    description: "Transfer conversation to a human agent when customer is upset or issue is too complex.",
    input_schema: {
      type: "object" as const,
      properties: { reason: { type: "string", description: "Why escalating" } },
      required: ["reason"],
    },
  },
];

// ─── System prompt ───
const SYSTEM_PROMPT = `You are a friendly and professional customer support agent for TechStore, which sells electronics, accessories, and workspace gear.

## Rules
- ONLY answer using information from the knowledge base (search_knowledge_base tool) or order data (check_order tool). Do NOT make up information.
- If you cannot find the answer, say "I don't have information about that" and offer to connect with a specialist.
- Always search the knowledge base first before answering policy or product questions.
- When a customer asks about a specific order, use check_order.
- If a customer is upset or asks for a human, use escalate_to_human immediately.
- When creating a ticket, confirm the ticket ID with the customer.

## Tool Usage
- search_knowledge_base: policies, products, pricing, shipping, returns
- check_order: order status, tracking, delivery
- create_ticket: issues needing follow-up
- escalate_to_human: angry customer, complex issue, customer requests human

## Style
- Concise but complete. Use bullet points for lists.
- Friendly, professional, helpful tone.
- Include specific details from the knowledge base.`;

// ─── Execute tool ───
function executeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "search_knowledge_base":
      return searchKnowledgeBase(String(input.query));
    case "check_order":
      return checkOrder(String(input.order_id));
    case "create_ticket":
      return createTicket(String(input.subject), String(input.description), String(input.priority));
    case "escalate_to_human":
      return escalateToHuman(String(input.reason));
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ─── Main handler ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, sessionId = "default" } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  // Ingest KB on first call
  ingestKnowledgeBase();

  const apiKey = process.env.ANTHROPIC_API_KEY?.replace(/\s+/g, "");
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const client = new Anthropic({ apiKey });

  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  const history = sessions.get(sessionId)!;

  // Add user message
  history.push({ role: "user", content: message });

  const toolsUsed: { name: string; args: Record<string, unknown>; result: unknown }[] = [];

  try {
    // Agent loop
    for (let i = 0; i < 10; i++) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: history,
        tools,
      });

      if (response.stop_reason === "end_turn") {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");

        history.push({ role: "assistant", content: response.content });
        return res.json({ text, toolsUsed });
      }

      if (response.stop_reason === "tool_use") {
        // Add assistant message with tool calls
        history.push({ role: "assistant", content: response.content });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type === "tool_use") {
            const result = executeTool(block.name, block.input as Record<string, unknown>);
            toolsUsed.push({
              name: block.name,
              args: block.input as Record<string, unknown>,
              result: JSON.parse(result),
            });
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result,
            });
          }
        }

        history.push({ role: "user", content: toolResults });
      }
    }

    return res.json({
      text: "I apologize, but I'm having trouble. Let me connect you with a human agent.",
      toolsUsed,
    });
  } catch (error) {
    console.error("[Error]", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
