import OpenAI from "openai";
import type {
  LLMProvider,
  LLMResponse,
  Message,
  ToolDefinition,
} from "./types.js";

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI(); // uses OPENAI_API_KEY env var
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    tools: ToolDefinition[]
  ): Promise<LLMResponse> {
    // Convert messages to OpenAI's format
    const openaiMessages = this.convertMessages(messages, systemPrompt);

    // Convert tools to OpenAI's function calling format
    const openaiTools: OpenAI.ChatCompletionTool[] = tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      tools: openaiTools,
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Parse tool calls
    const toolCalls: LLMResponse["toolCalls"] = [];
    if (message.tool_calls) {
      for (const tc of message.tool_calls) {
        if (tc.type === "function") {
          toolCalls.push({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments),
          });
        }
      }
    }

    return {
      text: message.content,
      toolCalls,
      stopReason: choice.finish_reason === "tool_calls" ? "tool_use" : "end_turn",
    };
  }

  private convertMessages(
    messages: Message[],
    systemPrompt: string
  ): OpenAI.ChatCompletionMessageParam[] {
    const result: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages) {
      if (msg.role === "user") {
        result.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
          role: "assistant",
          content: msg.content || null,
        };
        if (msg.toolCalls) {
          assistantMsg.tool_calls = msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          }));
        }
        result.push(assistantMsg);
      } else if (msg.role === "tool_result") {
        if (msg.toolResults) {
          for (const tr of msg.toolResults) {
            result.push({
              role: "tool",
              tool_call_id: tr.toolCallId,
              content: tr.result,
            });
          }
        }
      }
    }

    return result;
  }
}
