"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  MessageSquareIcon,
  SendIcon,
  SettingsIcon,
  LogOutIcon,
  StopCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  TrashIcon,
  PaperclipIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  formatRelativeTime,
  groupConversationsByDate,
} from "@/lib/utils/date";
import { ConversationWithLastMessage } from "@/lib/supabase/queries";
import { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ChatState {
  type: "home" | "new" | "existing";
  conversationId?: string;
  conversation?: ConversationWithLastMessage;
}

interface ModelOption {
  id: string;
  label: string;
  provider: string;
  isFreemium?: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", isFreemium: true },
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "Anthropic", isFreemium: true },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "Google", isFreemium: true },
];

function hasCreatedAt(
  c: ConversationWithLastMessage,
): c is ConversationWithLastMessage & { created_at: string } {
  return typeof c.created_at === "string";
}

export default function ChatLayout() {
  const [chatState, setChatState] = useState<ChatState>({ type: "home" });
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingConversation, setEditingConversation] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const supabase = createClient();
  
  const { conversations, refetch, deleteConversation, renameConversation } = useConversations();
  const { profile } = useUserProfile();
  
  const {
    sendMessage,
    isStreaming,
    stopStreaming,
    messages: streamMessages,
    setMessages: setStreamMessages,
    error: streamError,
  } = useChatStream({
    onConversationCreated: (conversationId) => {
      setChatState({
        type: "existing",
        conversationId,
      });
      refetch();
    },
    onMessageComplete: () => {
      refetch();
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamMessages]);

  // Sidebar resizing logic
  useEffect(() => {
    const resizer = resizerRef.current;
    const sidebar = sidebarRef.current;
    
    if (!resizer || !sidebar) return;

    let isResizing = false;

    const handleMouseDown = () => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(240, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    resizer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const messageContent = inputValue.trim();
    setInputValue("");

    if (chatState.type === "home") {
      setChatState({ type: "new" });
      setStreamMessages([]);
    }

    await sendMessage(messageContent, chatState.conversationId, selectedModel);
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
    setChatState({ type: "home" });
    setMessages([]);
    setStreamMessages([]);
    setInputValue("");
  };

  const handleConversationClick = async (conversation: ConversationWithLastMessage) => {
    setChatState({
      type: "existing",
      conversationId: conversation.id,
      conversation,
    });

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (response.ok) {
        const fetchedMessages = await response.json();
        setMessages(fetchedMessages);
        setStreamMessages(fetchedMessages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleBackToHome = () => {
    setChatState({ type: "home" });
    setMessages([]);
    setStreamMessages([]);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (chatState.conversationId === conversationId) {
        handleBackToHome();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleRenameStart = (conversation: ConversationWithLastMessage) => {
    setEditingConversation(conversation.id);
    setEditTitle(conversation.title || "");
  };

  const handleRenameCancel = () => {
    setEditingConversation(null);
    setEditTitle("");
  };

  const handleRenameSubmit = async (conversationId: string) => {
    if (!editTitle.trim()) return;

    try {
      await renameConversation(conversationId, editTitle.trim());
      setEditingConversation(null);
      setEditTitle("");
    } catch (error) {
      console.error("Failed to update conversation title:", error);
    }
  };

  const filteredConversations = conversations.filter(hasCreatedAt);
  const groupedConversations = groupConversationsByDate(filteredConversations);

  return (
    <div className="flex h-screen bg-surface-0">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface-1 border-b border-subtle flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-9 w-9 rounded-full hover:bg-surface-2 icon-hover"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          
          {chatState.type !== "home" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="h-9 w-9 rounded-full hover:bg-surface-2 icon-hover"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold text-primary">
            {chatState.type === "home"
              ? "R3Chat"
              : chatState.conversation?.title || "New Chat"}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
            className="h-9 w-9 rounded-full hover:bg-surface-2 icon-hover"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4 text-secondary" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`relative flex-shrink-0 bg-surface-1 border-r border-subtle transition-all duration-200 mt-14 ${
          sidebarCollapsed ? "w-0 -ml-1" : ""
        }`}
        style={{ width: sidebarCollapsed ? 0 : `${sidebarWidth}px` }}
      >
        {!sidebarCollapsed && (
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-subtle">
              <Button
                onClick={handleNewChat}
                className="w-full btn-pill flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Chat</span>
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.entries(groupedConversations).map(([dateGroup, convos]) => (
                <div key={dateGroup}>
                  <h3 className="section-header">
                    {dateGroup}
                  </h3>
                  <div className="space-y-1">
                    {convos.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-surface-2 ${
                          chatState.conversationId === conversation.id
                            ? "bg-accent-primary text-white"
                            : ""
                        }`}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        {editingConversation === conversation.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleRenameCancel}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleRenameSubmit(conversation.id);
                              } else if (e.key === "Escape") {
                                handleRenameCancel();
                              }
                            }}
                            className="w-full bg-transparent border-none outline-none text-sm font-medium"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">
                              {conversation.title || "New Chat"}
                            </span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameStart(conversation);
                                }}
                                className="h-6 w-6 rounded-full hover:bg-surface-0/20"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conversation.id);
                                }}
                                className="h-6 w-6 rounded-full hover:bg-red-500/20"
                              >
                                <TrashIcon className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* User Profile - Moved to bottom */}
            <div className="p-4 border-t border-subtle">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-subtle bg-surface-2">
                  {profile?.email ? (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.email)}&background=D2691E&color=fff&size=48`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">U</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {profile?.email?.split("@")[0] || "User"}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      profile?.account_type === "guest" 
                        ? "bg-surface-2 text-secondary" 
                        : "bg-accent-primary text-white"
                    }`}>
                      {profile?.account_type === "guest" ? "Free" : "Pro"}
                    </span>
                    <span className="text-xs text-tertiary">
                      {profile?.credits_left || 0} credits
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-secondary hover:text-primary hover:bg-surface-2"
                title="Sign out"
              >
                <LogOutIcon className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Resizer */}
        {!sidebarCollapsed && (
          <div
            ref={resizerRef}
            className="sidebar-resizer absolute top-0 right-0 h-full"
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 mt-14">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {chatState.type === "home" ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center space-y-6 max-w-md">
                <MessageSquareIcon className="h-16 w-16 text-accent-primary mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-4">
                    Welcome to R3Chat
                  </h2>
                  <p className="text-secondary leading-relaxed">
                    Start a conversation with our powerful AI models. 
                    Choose your preferred model and begin chatting.
                  </p>
                </div>
                <Button
                  onClick={handleNewChat}
                  className="btn-pill px-8 py-3 text-lg"
                >
                  <PlusIcon className="h-5 w-5" />
                  Start New Chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 pb-32">
              {streamMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 ${
                      message.role === "user"
                        ? "message-user"
                        : "message-assistant"
                    } ${message.isError ? "border border-red-500" : ""}`}
                  >
                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </div>
                    {message.isStreaming && (
                      <div className="inline-block w-2 h-5 bg-current animate-pulse ml-1" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="fixed bottom-0 right-0 left-0 lg:left-auto lg:right-4 lg:bottom-4 lg:max-w-3xl lg:mx-auto p-4">
          <div className="chatbox-translucent rounded-xl p-4 space-y-4">
            {/* Main Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isStreaming}
                className="w-full resize-none border-0 bg-transparent text-primary placeholder-text-tertiary focus:outline-none focus:ring-0 pr-16 pb-12"
                style={{ minHeight: '20px', maxHeight: '120px' }}
                rows={1}
              />
            </div>
            
            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-subtle">
              <div className="flex items-center space-x-3">
                {/* Model Selector */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  disabled={isStreaming}
                >
                  {MODEL_OPTIONS.map((model) => (
                    <option
                      key={model.id}
                      value={model.id}
                      disabled={!model.isFreemium && profile?.account_type === "guest"}
                    >
                      {model.label}
                      {!model.isFreemium && profile?.account_type === "guest" ? " (Pro)" : ""}
                    </option>
                  ))}
                </select>

                {/* Attachment Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full hover:bg-surface-2 icon-hover"
                  title="Attach file (.txt, .md)"
                >
                  <PaperclipIcon className="h-4 w-4 text-tertiary" />
                </Button>
              </div>

              {/* Send/Stop Button */}
              <div className="flex items-center space-x-2">
                {profile && (
                  <span className="text-xs text-secondary">
                    {profile.credits_left} credits
                  </span>
                )}
                
                {isStreaming ? (
                  <Button
                    onClick={stopStreaming}
                    size="sm"
                    className="h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    title="Stop generation"
                  >
                    <StopCircleIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    size="sm"
                    className={`h-9 w-9 rounded-full transition-all duration-200 ${
                      inputValue.trim()
                        ? "bg-accent-primary hover:bg-accent-hover text-white hover:scale-105"
                        : "bg-surface-2 text-tertiary cursor-not-allowed"
                    }`}
                    title="Send message"
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {streamError && (
              <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-2">
                {streamError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}