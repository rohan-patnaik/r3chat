import { useState, useCallback, useRef } from "react";
import { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface StreamMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      model: string,
      conversationId?: string,
      existingMessages: Message[] = []
    ) => {
      if (isStreaming) return;

      setIsStreaming(true);
      setError(null);

      // Add user message immediately
      const userMessage: StreamMessage = {
        role: "user",
        content,
      };

      setMessages(prev => [...prev, userMessage]);

      // Create assistant message placeholder
      const assistantMessage: StreamMessage = {
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/messages/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            model,
            messages: existingMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            content,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If we can't parse JSON, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        // Check if response body exists
        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                console.log("🔍 SSE Line:", data);
                if (!data) continue;
                
                try {
                  const parsed = JSON.parse(data);
                  console.log("🔍 Parsed SSE:", parsed);

                  switch (parsed.type) {
                    case "start":
                      console.log("🟢 Stream started");
                      if (parsed.isFirstMessage && options.onConversationCreated) {
                        options.onConversationCreated(parsed.conversationId);
                      }
                      // Update assistant message with ID
                      setMessages(prev =>
                        prev.map((msg, index) =>
                          index === prev.length - 1
                            ? { ...msg, id: parsed.messageId }
                            : msg
                        )
                      );
                      break;

                    case "token":
                      console.log("🔤 Token received:", parsed.content);
                      setMessages(prev =>
                        prev.map((msg, index) =>
                          index === prev.length - 1
                            ? { ...msg, content: msg.content + parsed.content }
                            : msg
                        )
                      );
                      break;

                    case "done":
                      console.log("✅ Stream completed");
                      setMessages(prev =>
                        prev.map((msg, index) =>
                          index === prev.length - 1
                            ? { ...msg, isStreaming: false }
                            : msg
                        )
                      );
                      if (options.onMessageComplete) {
                        options.onMessageComplete();
                      }
                      break;

                    case "error":
                      throw new Error(parsed.error || "Unknown streaming error");
                  }
                } catch (parseError) {
                  console.error("Failed to parse SSE data:", parseError, "Raw data:", data);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error("Send message error:", error);
        
        if (error instanceof Error && error.name === "AbortError") {
          // Stream was aborted, remove the streaming assistant message
          setMessages(prev => prev.slice(0, -1));
        } else {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          setError(errorMessage);
          if (options.onError) {
            options.onError(errorMessage);
          }
          // Mark assistant message as failed
          setMessages(prev =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, content: `Error: ${errorMessage}`, isStreaming: false }
                : msg
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, options]
  );

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const resetMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const setInitialMessages = useCallback((initialMessages: Message[]) => {
    setMessages(
      initialMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }))
    );
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    abortStream,
    resetMessages,
    setInitialMessages,
  };
}