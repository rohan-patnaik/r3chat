// src/lib/hooks/useChatStream.ts

import { useState, useCallback, useRef } from "react";
import { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface StreamMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
}

interface UseChatStreamOptions {
  onConversationCreated?: (conversationId: string) => void;
  onMessageComplete?: () => void;
  onError?: (error: string) => void;
}

export function useChatStream(options: UseChatStreamOptions = {}) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (prompt: string, conversationId?: string, model?: string) => {
      if (isStreamingRef.current) return;

      setIsStreaming(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      // Add user message to UI immediately
      const newUserMessage: StreamMessage = { role: "user", content: prompt };
      setMessages((prev) => [...prev, newUserMessage]);

      // Create assistant message placeholder
      const assistantPlaceholder: StreamMessage = {
        role: "assistant",
        content: "",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      // **FIX:** Send `prompt` instead of a `messages` array.
      const body = {
        prompt: prompt,
        model: model,
        conversationId,
      };

      try {
        const response = await fetch("/api/messages/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          // Try to get error message from response body
          let errorBody;
          try {
            errorBody = await response.json();
          } catch (e) {
            // If we can't parse JSON, use the status text
            errorBody = { error: response.statusText };
          }
          throw new Error(
            errorBody.error || `Request failed with status ${response.status}`,
          );
        }

        if (!response.body) {
          throw new Error("Response body is empty");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantMessageId: number | undefined = undefined;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonString = line.substring(6);
              if (!jsonString) continue;

              console.log("🔍 SSE Line:", jsonString);
              const parsed = JSON.parse(jsonString);
              console.log("🔍 Parsed SSE:", parsed);

              if (parsed.type === "start") {
                console.log("🟢 Stream started");
                assistantMessageId = parsed.messageId;
                if (parsed.isFirstMessage && options.onConversationCreated) {
                  options.onConversationCreated(parsed.conversationId);
                }
                // Update assistant message with ID
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.isStreaming ? { ...msg, id: assistantMessageId } : msg,
                  ),
                );
              } else if (parsed.type === "token") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + parsed.content }
                      : msg,
                  ),
                );
              } else if (parsed.type === "done") {
                console.log("✅ Stream completed");
                if (options.onMessageComplete) {
                  options.onMessageComplete();
                }
              } else if (parsed.type === "error") {
                console.error("Stream error:", parsed.message);
                setError(parsed.message);
                if (options.onError) {
                  options.onError(parsed.message);
                }
                // Mark assistant message as failed
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          isError: true,
                          content: `Error: ${parsed.message}`,
                        }
                      : msg,
                  ),
                );
              }
            }
          }
        }
      } catch (e: any) {
        if (e.name === "AbortError") {
          console.log("Stream aborted by user.");
          // Stream was aborted, remove the streaming assistant message
          setMessages((prev) => prev.filter((msg) => !msg.isStreaming));
          return;
        }
        console.error("Send message error:", e);
        setError(e.message);
        if (options.onError) {
          options.onError(e.message);
        }
        // Mark assistant message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.isStreaming
              ? { ...msg, isError: true, content: `Error: ${e.message}` }
              : msg,
          ),
        );
      } finally {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, isStreaming: false })),
        );
        abortControllerRef.current = null;
      }
    },
    [options.onConversationCreated, options.onMessageComplete, options.onError],
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    setMessages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
  };
}