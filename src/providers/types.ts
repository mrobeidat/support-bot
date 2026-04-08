/**
 * Common interface for LLM providers (Anthropic & OpenAI).
 * This abstraction lets us swap providers without changing the agent logic.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMResponse {
  text: string | null;
  toolCalls: ToolCall[];
  stopReason: "end_turn" | "tool_use";
}

export interface ToolResult {
  toolCallId: string;
  result: string;
}

export interface Message {
  role: "user" | "assistant" | "tool_result";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface LLMProvider {
  name: string;
  chat(
    messages: Message[],
    systemPrompt: string,
    tools: ToolDefinition[]
  ): Promise<LLMResponse>;
}
