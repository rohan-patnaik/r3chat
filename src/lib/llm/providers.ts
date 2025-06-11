// src/lib/llm/providers.ts

import { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export interface LLMRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  model: string;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
  streamResponse(request: LLMRequest): AsyncGenerator<string, void, unknown>;
}

class OpenAIProvider implements LLMProvider {
  name = "openai";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    throw new Error("Not implemented");
  }

  async *streamResponse(
    request: LLMRequest,
  ): AsyncGenerator<string, void, unknown> {
    throw new Error("Not implemented");
  }
}

class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    throw new Error("Not implemented");
  }

  async *streamResponse(
    request: LLMRequest,
  ): AsyncGenerator<string, void, unknown> {
    throw new Error("Not implemented");
  }
}

class GeminiProvider implements LLMProvider {
  name = "google";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    throw new Error("Not implemented");
  }

  async *streamResponse(
    request: LLMRequest,
  ): AsyncGenerator<string, void, unknown> {
    // **THE FIX: Request the stream in SSE format and parse it correctly.**
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const mappedMessages = request.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body = {
      contents: mappedMessages,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API request failed with status ${response.status}: ${errorText}`,
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonString = line.substring(6).trim();
          if (jsonString) {
            try {
              const parsed = JSON.parse(jsonString);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch (e) {
              console.error(
                "Failed to parse JSON from Gemini SSE chunk:",
                jsonString,
              );
            }
          }
        }
      }
    }
  }
}

export function createProvider(provider: string, apiKey: string): LLMProvider {
  switch (provider) {
    case "openai":
      return new OpenAIProvider(apiKey);
    case "anthropic":
      return new AnthropicProvider(apiKey);
    case "google":
      return new GeminiProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function generateTitle(content: string): string {
  const words = content.split(/\s+/);
  return words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
}