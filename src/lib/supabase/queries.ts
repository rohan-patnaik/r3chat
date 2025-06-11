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
    .from('conversations')
    .select(`
      *,
      messages (
        content,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  // Process conversations to include last message info
  const processedConversations: ConversationWithLastMessage[] = conversations.map(conv => {
    const messages = (conv as any).messages || [];
    
    // Sort messages by created_at and get the latest one
    const sortedMessages = messages.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const lastMessage = sortedMessages[0];
    
    return {
      ...conv,
      lastMessage: lastMessage?.content || undefined,
      lastMessageTime: lastMessage?.created_at || conv.created_at,
      messageCount: messages.length,
      messages: undefined, // Remove messages array from response
    };
  });

  return processedConversations;
}

export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  
  // First delete all messages in the conversation
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
    throw messagesError;
  }

  // Then delete the conversation itself
  const { error: conversationError } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId); // Ensure user can only delete their own conversations

  if (conversationError) {
    console.error('Error deleting conversation:', conversationError);
    throw conversationError;
  }
}

export async function getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  return data;
}

export async function createConversation(userId: string, title: string = "New Chat"): Promise<Conversation> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
}

export async function updateConversationTitle(conversationId: string, userId: string, title: string): Promise<Conversation> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }

  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data || [];
}

export async function createMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  return data;
}