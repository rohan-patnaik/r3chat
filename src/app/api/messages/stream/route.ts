import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProvider, generateTitle } from "@/lib/llm/providers";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, model, messages, content } = body;

    if (!content || !model) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: content and model" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = await createClient(); // Keep the await - this function IS async
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get API key for the provider
    const modelProvider = getProviderFromModel(model);
    const { data: providerKey } = await supabase
      .from("provider_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("provider", modelProvider)
      .single();

    if (!providerKey?.api_key) {
      return new Response(
        JSON.stringify({ error: `API key not found for provider: ${modelProvider}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let actualConversationId = conversationId;
    let isFirstMessage = false;

    // Create conversation if this is a new chat
    if (!conversationId) {
      const title = generateTitle(content);
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

      if (conversationError || !conversation) {
        console.error("Conversation creation error:", conversationError);
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      actualConversationId = conversation.id;
      isFirstMessage = true;
    }

    // Save user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: actualConversationId,
        role: "user",
        content,
      })
      .select()
      .single();

    if (userMessageError || !userMessage) {
      console.error("User message error:", userMessageError);
      return new Response(
        JSON.stringify({ error: "Failed to save user message" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create assistant message placeholder
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: actualConversationId,
        role: "assistant",
        content: "",
      })
      .select()
      .single();

    if (assistantMessageError || !assistantMessage) {
      console.error("Assistant message error:", assistantMessageError);
      return new Response(
        JSON.stringify({ error: "Failed to create assistant message" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize provider
    const provider = createProvider(modelProvider, providerKey.api_key);

    // Create stream
    const encoder = new TextEncoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial data with conversation and message IDs
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "start",
                conversationId: actualConversationId,
                messageId: assistantMessage.id,
                isFirstMessage,
              })}\n\n`
            )
          );

          // Stream the response
          const requestMessages = [...(messages || []), { role: "user" as const, content }];
          
          for await (const chunk of provider.streamResponse({
            messages: requestMessages,
            model,
          })) {
            fullContent += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`)
            );
          }

          // Update the assistant message with full content
          const { error: updateError } = await supabase
            .from("messages")
            .update({ content: fullContent })
            .eq("id", assistantMessage.id);

          if (updateError) {
            console.error("Failed to update assistant message:", updateError);
          }

          // Update conversation timestamp
          const { error: timestampError } = await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", actualConversationId);

          if (timestampError) {
            console.error("Failed to update conversation timestamp:", timestampError);
          }

          // Send completion
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                conversationId: actualConversationId,
                messageId: assistantMessage.id,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown streaming error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal Server Error" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

function getProviderFromModel(model: string): string {
  if (model.startsWith("gpt-")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gemini-")) return "google";
  throw new Error(`Unknown model: ${model}`);
}