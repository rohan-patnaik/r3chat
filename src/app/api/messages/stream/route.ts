// src/app/api/messages/stream/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProvider, generateTitle } from "@/lib/llm/providers";
import { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

function getProviderFromModel(model: string): string {
  if (model.startsWith("gpt")) return "openai";
  if (model.startsWith("claude")) return "anthropic";
  if (model.startsWith("gemini")) return "google";
  throw new Error(`Unknown provider for model: ${model}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, conversationId: currentConversationId } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerName = getProviderFromModel(model);

    const { data: providerKey, error: keyError } = await supabase
      .from("provider_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("provider", providerName)
      .single();

    if (keyError || !providerKey) {
      return NextResponse.json(
        {
          error: `API key not found for provider: ${providerName}. Please check the database.`,
        },
        { status: 400 },
      );
    }

    // **THE FIX: Trim whitespace from the retrieved key**
    const apiKey = providerKey.api_key.trim();

    let conversationId = currentConversationId;
    let isFirstMessage = false;

    if (!conversationId) {
      isFirstMessage = true;
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: "New Chat" })
        .select()
        .single();

      if (convError) {
        throw new Error(`Error creating conversation: ${convError.message}`);
      }
      conversationId = newConversation.id;
    }

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: prompt,
    });

    const { data: history, error: historyError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (historyError) {
      throw new Error(`Error fetching history: ${historyError.message}`);
    }

    const { data: assistantMessage, error: assistantMessageError } =
      await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content: "",
        })
        .select()
        .single();

    if (assistantMessageError) {
      throw new Error(
        `Error creating assistant message: ${assistantMessageError.message}`,
      );
    }

    // Use the trimmed API key
    const provider = createProvider(providerName, apiKey);

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "start",
            conversationId: conversationId,
            messageId: assistantMessage.id,
            isFirstMessage: isFirstMessage,
          })}\n\n`,
        );

        let fullContent = "";
        let hasReceivedTokens = false;

        try {
          const llmStream = provider.streamResponse({
            messages: history.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
            model: model,
          });

          for await (const chunk of llmStream) {
            hasReceivedTokens = true;
            fullContent += chunk;
            controller.enqueue(
              `data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`,
            );
          }

          if (!hasReceivedTokens) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                message:
                  "The model returned an empty response. Check model name and API key permissions.",
              })}\n\n`,
            );
            controller.close();
            return;
          }

          await supabase
            .from("messages")
            .update({ content: fullContent })
            .eq("id", assistantMessage.id);

          if (isFirstMessage) {
            const title = generateTitle(prompt);
            await supabase
              .from("conversations")
              .update({ title: title })
              .eq("id", conversationId);
          }

          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

          controller.enqueue(
            `data: ${JSON.stringify({
              type: "done",
              conversationId: conversationId,
              messageId: assistantMessage.id,
            })}\n\n`,
          );
        } catch (e: any) {
          console.error("Streaming error:", e);
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "error",
              message:
                e.message || "An unexpected error occurred during the stream.",
            })}\n\n`,
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[API /messages/stream] Internal Server Error:", error);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 },
    );
  }
}