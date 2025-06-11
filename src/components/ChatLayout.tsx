"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  MessageSquareIcon, 
  SendIcon, 
  SearchIcon, 
  SettingsIcon,
  LogOutIcon,
  LoaderIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { formatRelativeTime, groupConversationsByDate } from "@/lib/utils/date";
import { ConversationWithLastMessage } from "@/lib/supabase/queries";
import { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ChatState {
  type: 'home' | 'new' | 'existing';
  conversationId?: string;
  conversation?: ConversationWithLastMessage;
  messages?: Message[];
}

export default function ChatLayout() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatState, setChatState] = useState<ChatState>({ type: 'home' });
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null);
  const [editingConversation, setEditingConversation] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [renamingConversation, setRenamingConversation] = useState<string | null>(null);
  
  const router = useRouter();
  const { conversations, loading, error, refetch, deleteConversation, renameConversation } = useConversations();

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    
    // TODO: Implement message sending with deferred conversation creation
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNewChat = () => {
    setChatState({ type: 'new' });
  };

  const handleConversationClick = (conversation: ConversationWithLastMessage) => {
    setChatState({
      type: 'existing',
      conversationId: conversation.id,
      conversation,
      messages: [] // TODO: Load messages for existing conversation
    });
  };

  const handleBackToHome = () => {
    setChatState({ type: 'home' });
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Prevent conversation click
    setDeleteConfirm(conversationId);
  };

  const handleDeleteConfirm = async (conversationId: string) => {
    try {
      setDeletingConversation(conversationId);
      await deleteConversation(conversationId);
      
      // If we're currently viewing the deleted conversation, go back to home
      if (chatState.conversationId === conversationId) {
        setChatState({ type: 'home' });
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      // You could add a toast notification here
    } finally {
      setDeletingConversation(null);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleRenameClick = (e: React.MouseEvent, conversation: ConversationWithLastMessage) => {
    e.stopPropagation(); // Prevent conversation click
    setEditingConversation(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleRenameSubmit = async (conversationId: string) => {
    if (!editTitle.trim()) {
      handleRenameCancel();
      return;
    }

    try {
      setRenamingConversation(conversationId);
      await renameConversation(conversationId, editTitle.trim());
      
      // Update current chat state if we're viewing this conversation
      if (chatState.conversationId === conversationId) {
        setChatState(prev => ({
          ...prev,
          conversation: prev.conversation ? {
            ...prev.conversation,
            title: editTitle.trim()
          } : prev.conversation
        }));
      }
      
      setEditingConversation(null);
      setEditTitle("");
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      // You could add a toast notification here
    } finally {
      setRenamingConversation(null);
    }
  };

  const handleRenameCancel = () => {
    setEditingConversation(null);
    setEditTitle("");
  };

  const handleRenameKeyPress = (e: React.KeyboardEvent, conversationId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit(conversationId);
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered conversations by date
  const groupedConversations = groupConversationsByDate(filteredConversations);

  const renderChatContent = () => {
    switch (chatState.type) {
      case 'new':
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-semibold text-primary mb-4">
                How can I help you today?
              </h1>
              <p className="text-secondary mb-8">
                Start a conversation with me and I'll do my best to assist you.
              </p>
              
              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setMessage("Explain quantum computing in simple terms")}
                  className="p-4 border border-subtle rounded-lg text-left hover:bg-surface-1 transition-colors"
                >
                  <div className="font-medium text-primary">Explain a concept</div>
                  <div className="text-sm text-secondary">Quantum computing in simple terms</div>
                </button>
                <button 
                  onClick={() => setMessage("Help me debug this Python code")}
                  className="p-4 border border-subtle rounded-lg text-left hover:bg-surface-1 transition-colors"
                >
                  <div className="font-medium text-primary">Debug code</div>
                  <div className="text-sm text-secondary">Help with Python debugging</div>
                </button>
                <button 
                  onClick={() => setMessage("Generate a data analysis plan")}
                  className="p-4 border border-subtle rounded-lg text-left hover:bg-surface-1 transition-colors"
                >
                  <div className="font-medium text-primary">Data analysis</div>
                  <div className="text-sm text-secondary">Create an analysis plan</div>
                </button>
                <button 
                  onClick={() => setMessage("Write a technical documentation")}
                  className="p-4 border border-subtle rounded-lg text-left hover:bg-surface-1 transition-colors"
                >
                  <div className="font-medium text-primary">Write docs</div>
                  <div className="text-sm text-secondary">Technical documentation</div>
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'existing':
        return (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-subtle p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className="p-2 hover:bg-surface-1 rounded-lg transition-colors md:hidden"
                >
                  ←
                </button>
                <MessageSquareIcon className="w-5 h-5 text-secondary" />
                <h2 className="font-medium text-primary">
                  {chatState.conversation?.title}
                </h2>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                {chatState.messages && chatState.messages.length > 0 ? (
                  <div className="space-y-6">
                    {chatState.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-accent text-white' 
                            : 'bg-surface-1 text-primary'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-secondary py-12">
                    Start the conversation by sending a message below.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default: // 'home'
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-semibold text-primary mb-4">
                Welcome to R3Chat
              </h1>
              <p className="text-secondary mb-8">
                Your fast, privacy-respecting AI chat assistant. Start a new conversation or continue an existing one.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleNewChat}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex surface-0">
      {/* Left Sidebar */}
      <div className="w-80 surface-1 border-r border-subtle flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-primary">R3Chat</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-secondary hover:text-primary"
            >
              <LogOutIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={handleNewChat}
            className="w-full bg-accent hover:bg-accent-hover text-white"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-subtle">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 surface-0 border border-subtle rounded-lg text-primary placeholder-tertiary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          ) : Object.keys(groupedConversations).length === 0 ? (
            <div className="p-4 text-center text-secondary">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedConversations).map(([group, convs]) => (
                <div key={group} className="mb-6">
                  <div className="px-3 py-2 text-xs font-medium text-tertiary uppercase tracking-wider">
                    {group}
                  </div>
                  <div className="space-y-1">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          chatState.conversationId === conversation.id
                            ? 'bg-accent/10 border-l-2 border-accent'
                            : 'hover:bg-surface-0'
                        }`}
                        onClick={() => !editingConversation && handleConversationClick(conversation)}
                        onMouseEnter={() => setHoveredConversation(conversation.id)}
                        onMouseLeave={() => setHoveredConversation(null)}
                      >
                        <MessageSquareIcon className="w-4 h-4 text-secondary mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {editingConversation === conversation.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => handleRenameKeyPress(e, conversation.id)}
                                className="flex-1 px-2 py-1 text-sm bg-surface-0 border border-subtle rounded text-primary focus:outline-none focus:border-accent"
                                autoFocus
                                disabled={renamingConversation === conversation.id}
                              />
                              <button
                                onClick={() => handleRenameSubmit(conversation.id)}
                                disabled={renamingConversation === conversation.id}
                                className="p-1 text-green-400 hover:text-green-300 transition-colors"
                              >
                                {renamingConversation === conversation.id ? (
                                  <LoaderIcon className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckIcon className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={handleRenameCancel}
                                disabled={renamingConversation === conversation.id}
                                className="p-1 text-secondary hover:text-red-400 transition-colors"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-primary truncate">
                                {conversation.title}
                              </div>
                              {conversation.lastMessage && (
                                <div className="text-sm text-secondary truncate">
                                  {conversation.lastMessage}
                                </div>
                              )}
                              <div className="text-xs text-tertiary">
                                {formatRelativeTime(conversation.lastMessageTime || conversation.created_at)}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        {hoveredConversation === conversation.id && editingConversation !== conversation.id && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleRenameClick(e, conversation)}
                              className="p-1 text-secondary hover:text-accent transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, conversation.id)}
                              disabled={deletingConversation === conversation.id}
                              className="p-1 text-secondary hover:text-red-400 transition-colors"
                            >
                              {deletingConversation === conversation.id ? (
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                              ) : (
                                <TrashIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-primary truncate">User</div>
              <div className="text-xs text-secondary">Free Plan</div>
            </div>
            <Button variant="ghost" size="sm" className="text-secondary hover:text-primary">
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Content */}
        {renderChatContent()}

        {/* Input Area - Show only for new chat or existing chat */}
        {(chatState.type === 'new' || chatState.type === 'existing') && (
          <div className="border-t border-subtle p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3">
                {/* Model Selector */}
                <select className="px-3 py-2 surface-1 border border-subtle rounded-lg text-primary text-sm focus:outline-none focus:border-accent">
                  <option>GPT-4</option>
                  <option>Claude 3</option>
                  <option>Gemini Pro</option>
                </select>

                {/* Message Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 surface-1 border border-subtle rounded-lg text-primary placeholder-tertiary focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-3"
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-1 border border-subtle rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Delete Conversation
            </h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={handleDeleteCancel}
                className="text-secondary hover:text-primary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteConfirm(deleteConfirm)}
                disabled={deletingConversation === deleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deletingConversation === deleteConfirm ? (
                  <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TrashIcon className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}