import { useState, useEffect, useCallback } from "react";
import { ConversationWithLastMessage } from "@/lib/supabase/queries";

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/conversations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data: ConversationWithLastMessage[] = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Optimistic update - remove from UI immediately
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // Success - the optimistic update stays
    } catch (err) {
      console.error('Error deleting conversation:', err);
      
      // Revert optimistic update on error
      await fetchConversations();
      
      throw err; // Re-throw so the UI can handle the error
    }
  }, [fetchConversations]);

  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    // Store original conversations before optimistic update
    const originalConversations = conversations;
    
    try {
      // Optimistic update - update title in UI immediately
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle, updated_at: new Date().toISOString() }
            : conv
        )
      );
      
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rename conversation');
      }
      
      // Success - the optimistic update stays
    } catch (err) {
      console.error('Error renaming conversation:', err);
      
      // Revert optimistic update on error
      setConversations(originalConversations);
      
      throw err; // Re-throw so the UI can handle the error
    }
  }, [conversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    deleteConversation,
    renameConversation,
  };
}