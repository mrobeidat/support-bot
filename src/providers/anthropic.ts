import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
  LLMResponse,
  Message,
  ToolDefinition,
} from "./types.js";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY?.replace(/\s+/g, "");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    console.log(`[Anthropic] Key length: ${apiKey.length}, starts with: ${apiKey.substring(0, 15)}...`);
    this.client = new Anthropic({ apiKey });
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    tools: ToolDefinition[]
  ): Promise<LLMResponse> {
    // Convert our generic messages to Anthropic's format
    const anthropicMessages = this.convertMessages(messages);

    // Convert our tool definitions to Anthropic's format
    const anthropicTools = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters as Anthropic.Tool["input_schema"],
    }));

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: anthropicTools,
    });

    // Parse the response
    let text: string | null = null;
    const toolCalls: LLMResponse["toolCalls"] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        text = block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      text,
      toolCalls,
      stopReason: response.stop_reason === "tool_use" ? "tool_use" : "end_turn",
    };
  }

  private convertMessages(
    messages: Message[]
  ): Anthropic.MessageParam[] {
    const result: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === "user") {
        result.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        // Assistant message might contain text + tool calls
        const content: Anthropic.ContentBlockParam[] = [];
        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }
        if (msg.toolCalls) {
          for (const tc of msg.toolCalls) {
            content.push({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.arguments,
            });
          }
        }
        result.push({ role: "assistant", content });
      } else if (msg.role === "tool_result") {
        // Tool results in Anthropic are sent as user messages
        const content: Anthropic.ToolResultBlockParam[] = [];
        if (msg.toolResults) {
          for (const tr of msg.toolResults) {
            content.push({
              type: "tool_result",
              tool_use_id: tr.toolCallId,
              content: tr.result,
            });
          }
        }
        result.push({ role: "user", content });
      }
    }

    return result;
  }
}
