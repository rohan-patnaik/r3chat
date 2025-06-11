import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];

export interface ConversationWithLastMessage extends Conversation {
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
}

export async function getConversations(userId: string): Promise<ConversationWithLastMessage[]> {
  const supabase = await createClient();

  // Get conversations with their latest message
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *,
      messages (
        content,
        created_at,
        role
      )
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Failed to fetch conversations");
  }

  // Process conversations to include last message info
  const processedConversations: ConversationWithLastMessage[] = conversations.map(conv => {
    const messages = conv.messages as Message[];
    const messageCount = messages.length;
    
    if (messageCount > 0) {
      // Sort messages by created_at and get the latest one
      const sortedMessages = messages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestMessage = sortedMessages[0];
      
      return {
        ...conv,
        messages: undefined, // Remove messages array from response
        lastMessage: latestMessage.content.slice(0, 100) + (latestMessage.content.length > 100 ? "..." : ""),
        lastMessageTime: latestMessage.created_at,
        messageCount,
      };
    }

    return {
      ...conv,
      messages: undefined,
      lastMessage: "No messages yet",
      lastMessageTime: conv.created_at,
      messageCount: 0,
    };
  });

  return processedConversations;
}

export async function getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
  const supabase = await createClient();

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }

  return conversation;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }

  return messages || [];
}