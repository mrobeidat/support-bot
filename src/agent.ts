/**
 * Agent Loop (ReAct Pattern)
 *
 * This is the core of the AI agent. It implements the reasoning loop:
 *
 * 1. Send the conversation + tools to the LLM
 * 2. If the LLM responds with text → return it to the user
 * 3. If the LLM calls a tool → execute the tool → feed the result back → go to step 1
 *
 * The "ReAct" pattern (Reasoning + Acting) lets the LLM:
 * - Reason about what information it needs
 * - Take actions (tool calls) to gather that information
 * - Use the results to form a final answer
 *
 * This is what makes it an "agent" — it autonomously decides what to do.
 */

import type { LLMProvider, Message, ToolCall } from "./providers/types.js";
import { allTools, executeTool } from "./tools/index.js";
import { buildSystemPrompt, defaultConfig } from "./prompts/system.js";

const MAX_ITERATIONS = 10; // Safety limit to prevent infinite loops

interface AgentResponse {
  text: string;
  toolsUsed: { name: string; args: Record<string, unknown>; result: string }[];
}

export async function runAgent(
  provider: LLMProvider,
  userMessage: string,
  conversationHistory: Message[]
): Promise<AgentResponse> {
  const systemPrompt = buildSystemPrompt(defaultConfig);
  const toolsUsed: AgentResponse["toolsUsed"] = [];

  // Add the new user message to history
  const messages: Message[] = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    // Step 1: Send messages + tools to the LLM
    const response = await provider.chat(messages, systemPrompt, allTools);

    // Step 2: If the LLM is done talking (no tool calls), return the text
    if (response.stopReason === "end_turn") {
      return {
        text: response.text ?? "I'm sorry, I couldn't generate a response.",
        toolsUsed,
      };
    }

    // Step 3: The LLM wants to call tools — execute them
    if (response.toolCalls.length > 0) {
      // Add the assistant's message (with tool calls) to history
      messages.push({
        role: "assistant",
        content: response.text ?? "",
        toolCalls: response.toolCalls,
      });

      // Execute each tool call and collect results
      const toolResults = await Promise.all(
        response.toolCalls.map(async (tc: ToolCall) => {
          console.log(`  [Tool] ${tc.name}(${JSON.stringify(tc.arguments)})`);

          const result = await executeTool(tc.name, tc.arguments);

          console.log(`  [Result] ${result.substring(0, 150)}...`);

          toolsUsed.push({
            name: tc.name,
            args: tc.arguments,
            result,
          });

          return {
            toolCallId: tc.id,
            result,
          };
        })
      );

      // Add tool results to the conversation
      messages.push({
        role: "tool_result",
        content: "",
        toolResults,
      });

      // Loop continues — the LLM will process the tool results
    }
  }

  // Safety: if we hit max iterations, return what we have
  return {
    text: "I apologize, but I'm having trouble processing your request. Let me connect you with a human agent.",
    toolsUsed,
  };
}
