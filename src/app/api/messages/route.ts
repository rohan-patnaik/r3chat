import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProvider, generateTitle } from "@/lib/llm/providers";
import { createConversation, createMessage, getMessages } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, model, conversationId } = body;

    if (!message || !model) {
      return NextResponse.json(
        { error: "Message and model are required" },
        { status: 400 }
      );
    }

    let actualConversationId = conversationId;
    let isNewConversation = false;

    // If no conversationId provided, create a new conversation (deferred creation)
    if (!actualConversationId) {
      const newConversation = await createConversation(user.id, "New Chat");
      actualConversationId = newConversation.id;
      isNewConversation = true;
    }

    // Get existing messages for context
    const existingMessages = await getMessages(actualConversationId);
    
    // Create user message
    const userMessage = await createMessage(actualConversationId, 'user', message);

    // Prepare messages for LLM (include conversation history)
    const llmMessages = [
      ...existingMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      }
    ];

    // Get LLM response
    const provider = getProvider(model);
    const llmResponse = await provider.sendMessage(llmMessages, model);

    // Create assistant message
    const assistantMessage = await createMessage(actualConversationId, 'assistant', llmResponse.content);

    // Generate title for new conversations
    if (isNewConversation) {
      try {
        const title = await generateTitle(message, llmResponse.content);
        
        // Update conversation title
        await supabase
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', actualConversationId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error generating title:', error);
        // Continue even if title generation fails
      }
    } else {
      // Update conversation timestamp for existing conversations
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', actualConversationId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      conversationId: actualConversationId,
      userMessage,
      assistantMessage,
      isNewConversation,
    });

  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}