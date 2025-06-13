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
  TrashIcon,
  PaperclipIcon,
  MenuIcon,
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

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (chatState.conversationId === conversationId) {
        setChatState({ type: "home" });
        setMessages([]);
        setStreamMessages([]);
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
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`relative flex-shrink-0 bg-surface-1 border-r border-subtle transition-all duration-300 ${
          sidebarCollapsed ? "w-0" : ""
        }`}
        style={{ width: sidebarCollapsed ? 0 : `${sidebarWidth}px` }}
      >
        {!sidebarCollapsed && (
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(true)}
                    className="h-8 w-8 p-0 btn-ghost"
                  >
                    <MenuIcon className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl font-bold text-primary">R3Chat</h1>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/settings")}
                    className="h-8 w-8 p-0 btn-ghost"
                    title="Settings"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleNewChat}
                className="w-full btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Conversations List */}
            <div className="sidebar-content">
              {Object.entries(groupedConversations).map(([dateGroup, convos]) => (
                <div key={dateGroup}>
                  {convos.length > 0 && (
                    <>
                      <h3 className="section-header">
                        {dateGroup.charAt(0).toUpperCase() + dateGroup.slice(1)}
                      </h3>
                      <div className="space-y-1 mb-4">
                        {convos.map((conversation) => (
                          <div
                            key={conversation.id}
                            className={`conversation-item group ${
                              chatState.conversationId === conversation.id ? "active" : ""
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
                                <span className="text-sm font-medium truncate flex-1">
                                  {conversation.title || "New Chat"}
                                </span>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRenameStart(conversation);
                                    }}
                                    className="h-6 w-6 p-0 btn-ghost"
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
                                    className="h-6 w-6 p-0 btn-ghost text-error"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* User Profile - At bottom */}
            <div className="p-6 border-t border-subtle bg-surface-0/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-subtle bg-surface-2 flex-shrink-0">
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
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      profile?.account_type === "guest" 
                        ? "bg-surface-2 text-secondary" 
                        : "bg-accent-primary text-white"
                    }`}>
                      {profile?.account_type === "guest" ? "Free" : "Pro"}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                className="w-full btn-ghost justify-start"
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
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent-primary/20 transition-colors"
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Sidebar toggle when collapsed */}
        {sidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(false)}
            className="absolute top-6 left-6 z-10 h-10 w-10 p-0 btn-ghost bg-surface-1/80 backdrop-blur-sm border border-subtle/50"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        )}

        {/* Chat Messages - Full height with proper padding */}
        <div className="flex-1 overflow-y-auto" style={{ paddingTop: sidebarCollapsed ? '80px' : '20px', paddingBottom: '160px' }}>
          {chatState.type === "home" ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center space-y-8 max-w-md">
                <MessageSquareIcon className="h-20 w-20 text-accent-primary mx-auto" />
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-6">
                    Welcome to R3Chat
                  </h2>
                  <p className="text-secondary leading-relaxed text-lg">
                    Start a conversation with our powerful AI models. 
                    Choose your preferred model and begin chatting.
                  </p>
                </div>
                <Button
                  onClick={handleNewChat}
                  className="btn-primary px-8 py-4 text-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6">
              {streamMessages.map((message, index) => (
                <div key={message.id || index}>
                  <div
                    className={`${
                      message.role === "user"
                        ? "message-user"
                        : "message-assistant"
                    } ${message.isError ? "border border-error" : ""}`}
                  >
                    <div className="whitespace-pre-wrap break-words">
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

        {/* Enhanced Input Area - Fixed at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="max-w-4xl mx-auto">
            <div className="chat-input-container">
              {/* Text Input Area */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isStreaming}
                className="chat-input-textarea"
                rows={1}
              />
              
              {/* Controls Bar */}
              <div className="chat-controls-bar">
                <div className="flex items-center space-x-3">
                  {/* Model Selector */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="btn-secondary"
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
                    className="h-9 w-9 p-0 btn-ghost"
                    title="Attach file (.txt, .md)"
                  >
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Right side controls */}
                <div className="flex items-center space-x-3">
                  {isStreaming ? (
                    <Button
                      onClick={stopStreaming}
                      className="h-9 w-9 p-0 bg-error hover:bg-error/80 text-white border-0"
                      title="Stop generation"
                    >
                      <StopCircleIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`h-9 w-9 p-0 border-0 ${
                        inputValue.trim()
                          ? "btn-primary"
                          : "bg-surface-2 text-muted cursor-not-allowed"
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
                <div className="px-6 pb-4">
                  <div className="text-sm text-error bg-error/10 rounded-lg p-3 border border-error/20">
                    {streamError}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}