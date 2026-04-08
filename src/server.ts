/**
 * Web Server for SupportBot
 *
 * REST API + static HTML frontend.
 * POST /api/chat — send a message, get agent response with tool calls
 */

import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { Message } from "./providers/types.js";
import type { LLMProvider } from "./providers/types.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenAIProvider } from "./providers/openai.js";
import { ingestKnowledgeBase } from "./rag/ingest.js";
import { runAgent } from "./agent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createProvider(): LLMProvider {
  const providerName = process.env.LLM_PROVIDER ?? "anthropic";
  if (providerName === "openai") {
    return new OpenAIProvider();
  }
  return new AnthropicProvider();
}

async function main() {
  const app = express();
  app.use(express.json());
  app.use(express.static(join(__dirname, "../public")));

  const provider = createProvider();
  console.log(`[System] Using LLM provider: ${provider.name}`);

  console.log("[System] Loading knowledge base...");
  await ingestKnowledgeBase();

  // Store conversations by session ID (in-memory, resets on restart)
  const sessions = new Map<string, Message[]>();

  app.post("/api/chat", async (req, res) => {
    const { message, sessionId = "default" } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "message is required" });
      return;
    }

    // Get or create conversation history for this session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId)!;

    try {
      const response = await runAgent(provider, message, history);

      // Update history
      history.push({ role: "user", content: message });
      history.push({ role: "assistant", content: response.text });

      res.json({
        text: response.text,
        toolsUsed: response.toolsUsed.map((t) => ({
          name: t.name,
          args: t.args,
          result: JSON.parse(t.result),
        })),
      });
    } catch (error) {
      console.error("[Error]", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Reset conversation
  app.post("/api/reset", (req, res) => {
    const { sessionId = "default" } = req.body;
    sessions.delete(sessionId);
    res.json({ success: true });
  });

  const port = process.env.PORT ?? 3001;
  app.listen(port, () => {
    console.log(`\n[Server] Running at http://localhost:${port}`);
    console.log("[Server] Open in your browser to start chatting!\n");
  });
}

main().catch(console.error);
