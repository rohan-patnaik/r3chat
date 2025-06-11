"use client";

import { useState, useEffect, useRef } from "react";
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
  StopCircleIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
  ArrowLeftIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { useChatStream } from "@/lib/hooks/useChatStream";
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

const AVAILABLE_MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "anthropic" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-2.5-flash-preview-05-20", label: "Gemini 2.5 Flash Preview 05-20", provider: "google" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "google" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "google" },
];

export default function ChatLayout() {
  const router = useRouter();
  const supabase = createClient();
  
  const [chatState, setChatState] = useState<ChatState>({ type: 'home' });
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { 
    conversations, 
    loading: conversationsLoading, 
    refetch,
    deleteConversation,
    renameConversation
  } = useConversations();

  const {
    messages: streamMessages,
    isStreaming,
    error: streamError,
    sendMessage,
    abortStream,
    resetMessages,
    setInitialMessages
  } = useChatStream({
    onConversationCreated: (conversationId) => {
      setChatState(prev => ({ ...prev, conversationId }));
      refetch();
    },
    onMessageComplete: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Stream error:", error);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamMessages]);

  // Focus input when entering new chat mode
  useEffect(() => {
    if (chatState.type === 'new' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatState.type]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const content = inputValue.trim();
    setInputValue("");

    await sendMessage(
      content,
      selectedModel,
      chatState.conversationId,
      chatState.messages || []
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNewChat = () => {
    setChatState({ type: 'new' });
    resetMessages();
  };

  const handleConversationClick = async (conversation: ConversationWithLastMessage) => {
    try {
      // Fetch messages for this conversation
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setChatState({
        type: 'existing',
        conversationId: conversation.id,
        conversation,
        messages: messages || []
      });

      setInitialMessages(messages || []);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleBackToHome = () => {
    setChatState({ type: 'home' });
    resetMessages();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      await deleteConversation(conversationId);
      if (chatState.conversationId === conversationId) {
        setChatState({ type: 'home' });
        resetMessages();
      }
    }
  };

  const handleRenameStart = (conversation: ConversationWithLastMessage) => {
    setEditingConversationId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleRenameCancel = () => {
    setEditingConversationId(null);
    setEditingTitle("");
  };

  const handleRenameSubmit = async (conversationId: string) => {
    if (editingTitle.trim()) {
      await renameConversation(conversationId, editingTitle.trim());
      if (chatState.conversationId === conversationId) {
        setChatState(prev => ({
          ...prev,
          conversation: prev.conversation ? {
            ...prev.conversation,
            title: editingTitle.trim()
          } : undefined
        }));
      }
    }
    setEditingConversationId(null);
    setEditingTitle("");
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered conversations by date
  const groupedConversations = groupConversationsByDate(filteredConversations);

  const selectedModelLabel = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.label || selectedModel;

  const renderChatHeader = () => {
    switch (chatState.type) {
      case 'new':
        return (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5 text-accent-500" />
              <span className="font-medium text-text-primary">New Chat</span>
            </div>
          </div>
        );
      case 'existing':
        return (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5 text-accent-500" />
              <span className="font-medium text-text-primary">
                {chatState.conversation?.title}
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="w-5 h-5 text-accent-500" />
            <span className="font-medium text-text-primary">R3Chat</span>
          </div>
        );
    }
  };

  const renderMessages = () => {
    const messagesToShow = chatState.type === 'home' ? [] : streamMessages;

    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messagesToShow.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-accent-500 text-white"
                  : "bg-surface-1 text-text-primary border border-border-subtle"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {streamError && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg">
              Error: {streamError}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const renderHomeContent = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto">
          <MessageSquareIcon className="w-8 h-8 text-accent-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome to R3Chat</h1>
        <p className="text-text-secondary max-w-md">
          Start a new conversation or continue with an existing one from the sidebar.
        </p>
      </div>

      <div className="grid gap-3 w-full max-w-md">
        <Button onClick={handleNewChat} className="justify-start h-auto p-4">
          <PlusIcon className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Start New Chat</div>
            <div className="text-sm opacity-80">Begin a conversation with AI</div>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {[
          "Help me write a professional email",
          "Explain quantum computing simply",
          "Create a workout plan for beginners",
          "Plan a 3-day trip to Tokyo"
        ].map((prompt, index) => (
          <button
            key={index}
            onClick={() => {
              setInputValue(prompt);
              handleNewChat();
            }}
            className="p-4 text-left bg-surface-1 hover:bg-surface-2 rounded-lg border border-border-subtle transition-colors"
          >
            <div className="text-sm text-text-primary font-medium">{prompt}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-0">
      {/* Left Sidebar */}
      <div className="w-80 bg-surface-1 border-r border-border-subtle flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5 text-accent-500" />
              <span className="font-semibold text-text-primary">R3Chat</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/settings")}
              className="text-text-secondary hover:text-text-primary"
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            onClick={handleNewChat}
            className="w-full justify-start"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="w-5 h-5 animate-spin text-text-secondary" />
            </div>
          ) : Object.keys(groupedConversations).length === 0 ? (
            <div className="p-4 text-center text-text-secondary text-sm">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
                <div key={dateGroup}>
                  <div className="px-4 py-2 text-xs font-medium text-text-secondary uppercase tracking-wide sticky top-0 bg-surface-1">
                    {dateGroup}
                  </div>
                  {convs.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group mx-2 rounded-lg hover:bg-surface-2 transition-colors ${
                        chatState.conversationId === conversation.id ? 'bg-surface-2' : ''
                      }`}
                    >
                      {editingConversationId === conversation.id ? (
                        <div className="p-3">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSubmit(conversation.id);
                              } else if (e.key === 'Escape') {
                                handleRenameCancel();
                              }
                            }}
                            onBlur={() => handleRenameSubmit(conversation.id)}
                            className="w-full px-2 py-1 bg-surface-0 border border-border-subtle rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Main conversation area - clickable */}
                          <div
                            onClick={() => handleConversationClick(conversation)}
                            className="w-full p-3 cursor-pointer flex items-start justify-between"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="font-medium text-text-primary text-sm truncate">
                                {conversation.title}
                              </div>
                              {conversation.lastMessage && (
                                <div className="text-xs text-text-secondary truncate mt-1">
                                  {conversation.lastMessage}
                                </div>
                              )}
                              <div className="text-xs text-text-secondary mt-1">
                                {formatRelativeTime(conversation.updated_at)}
                              </div>
                            </div>
                            
                            {/* Action buttons - separate from main click area */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameStart(conversation);
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-surface-0 cursor-pointer"
                              >
                                <PencilIcon className="w-3 h-3" />
                              </div>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conversation.id);
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-red-400 hover:bg-surface-0 cursor-pointer"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border-subtle">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-text-secondary hover:text-text-primary"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border-subtle bg-surface-1">
          {renderChatHeader()}
        </div>

        {/* Chat Content */}
        {chatState.type === 'home' ? renderHomeContent() : renderMessages()}

        {/* Input Area - Show only for new chat or existing chat */}
        {(chatState.type === 'new' || chatState.type === 'existing') && (
          <div className="p-4 border-t border-border-subtle bg-surface-1">
            {/* Model Selector */}
            <div className="mb-3">
              <div className="relative inline-block">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <span className="text-xs">{selectedModelLabel}</span>
                  <ChevronDownIcon className="w-3 h-3 ml-1" />
                </Button>
                
                {showModelDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 bg-surface-2 border border-border-subtle rounded-lg shadow-lg z-10 min-w-48">
                    {AVAILABLE_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-0 first:rounded-t-lg last:rounded-b-lg ${
                          selectedModel === model.id
                            ? 'text-accent-500'
                            : 'text-text-primary'
                        }`}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isStreaming}
                  className="w-full px-4 py-3 bg-surface-2 border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-500/50 resize-none min-h-[48px] max-h-32"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '48px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>

              {/* Send/Stop Button */}
              {isStreaming ? (
                <Button
                  onClick={abortStream}
                  size="sm"
                  variant="outline"
                  className="px-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <StopCircleIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="px-3"
                >
                  <SendIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}