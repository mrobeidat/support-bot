/**
 * SupportBot — Interactive CLI Chat
 *
 * Entry point for the AI customer support agent.
 * Supports both Anthropic (Claude) and OpenAI (GPT) as LLM providers.
 *
 * Usage:
 *   LLM_PROVIDER=anthropic npx tsx src/index.ts
 *   LLM_PROVIDER=openai npx tsx src/index.ts
 */

import * as readline from "readline";
import type { Message } from "./providers/types.js";
import type { LLMProvider } from "./providers/types.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenAIProvider } from "./providers/openai.js";
import { ingestKnowledgeBase } from "./rag/ingest.js";
import { runAgent } from "./agent.js";

function createProvider(): LLMProvider {
  const providerName = process.env.LLM_PROVIDER ?? "anthropic";

  if (providerName === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      console.error("Error: OPENAI_API_KEY is required when using OpenAI provider");
      process.exit(1);
    }
    return new OpenAIProvider();
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY is required when using Anthropic provider");
    process.exit(1);
  }
  return new AnthropicProvider();
}

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║     TechStore Support Bot                ║");
  console.log("║     AI-Powered Customer Support Agent    ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();

  // Step 1: Initialize the LLM provider
  const provider = createProvider();
  console.log(`[System] Using LLM provider: ${provider.name}`);

  // Step 2: Ingest the knowledge base (RAG)
  console.log("[System] Loading knowledge base...");
  await ingestKnowledgeBase();
  console.log();

  // Step 3: Start the chat loop
  console.log("Type your message and press Enter. Type 'quit' to exit.");
  console.log('Try: "What\'s your return policy?" or "Check order ORD-12345"');
  console.log("─".repeat(50));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const conversationHistory: Message[] = [];

  const prompt = () => {
    rl.question("\nYou: ", async (input) => {
      const userInput = input.trim();

      if (!userInput) {
        prompt();
        return;
      }

      if (userInput.toLowerCase() === "quit" || userInput.toLowerCase() === "exit") {
        console.log("\nGoodbye! Thanks for using TechStore Support.");
        rl.close();
        return;
      }

      if (userInput.toLowerCase() === "/switch") {
        console.log(
          `Current provider: ${provider.name}. Restart with LLM_PROVIDER=openai or LLM_PROVIDER=anthropic to switch.`
        );
        prompt();
        return;
      }

      try {
        console.log("\n[Thinking...]");
        const response = await runAgent(provider, userInput, conversationHistory);

        // Update conversation history
        conversationHistory.push({ role: "user", content: userInput });
        conversationHistory.push({ role: "assistant", content: response.text });

        // Display the response
        console.log(`\nAgent: ${response.text}`);

        if (response.toolsUsed.length > 0) {
          console.log(
            `\n  [Used ${response.toolsUsed.length} tool(s): ${response.toolsUsed.map((t) => t.name).join(", ")}]`
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`\n[Error] ${error.message}`);
        } else {
          console.error("\n[Error] An unexpected error occurred");
        }
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
