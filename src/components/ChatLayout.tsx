"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  PlusIcon,
  MessageSquareIcon,
  SendIcon,
  LogOutIcon,
  StopCircleIcon,
  PencilIcon,
  TrashIcon,
  PaperclipIcon,
  MenuIcon,
  SearchIcon,
  PanelLeftClose,
  PanelRightOpen,
  ZapIcon,      // For Create button
  GlobeIcon,    // For Explore button
  Code2Icon,    // For Code button
  BookOpenCheckIcon, // For Learn button
  ArrowUpIcon, // For Send button
  SettingsIcon, // For Settings button
  SparklesIcon, // For Quality indicator
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import {
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
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI"},
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "Anthropic", },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite", provider: "Google", isFreemium: true  },
  { id: "gemini-2.5-flash-preview-05-20", label: "Gemini 2.5 Flash", provider: "Google", isFreemium: true },
];

function hasCreatedAt(
  c: ConversationWithLastMessage,
): c is ConversationWithLastMessage & { created_at: string } {
  return typeof c.created_at === "string";
}

export default function ChatLayout() {
  const [chatState, setChatState] = useState<ChatState>({ type: "home" });
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash-preview-05-20");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingConversation, setEditingConversation] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // Filter conversations by search term
  const filteredConversations = conversations
    .filter(hasCreatedAt)
    .filter((conv) =>
      !searchTerm ||
      (conv.title || "New Chat").toLowerCase().includes(searchTerm.toLowerCase())
    );
  const groupedConversations = groupConversationsByDate(filteredConversations);

  // Extract user name from Google profile/email
  const userName =
    profile?.display_name ||
    (profile?.email ? profile.email.split("@")[0] : "User");

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
                    <PanelLeftClose className="h-4 w-4 text-text-primary" />
                  </Button>
                  <h1 className="text-[16px] font-bold text-[var(--text-primary)]">R3.chat</h1>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/settings')}
                    className="h-8 w-8 p-0 btn-ghost hover:shadow-sm hover:bg-[rgba(255,255,255,0.1)]"
                    aria-label="Settings"
                  >
                    <SettingsIcon className="h-5 w-5 text-[var(--text-primary)]" />
                  </Button>
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="h-8 w-8 p-0 btn-ghost hover:shadow-sm hover:bg-[rgba(255,255,255,0.1)]"
                    title="Sign out"
                  >
                    <LogOutIcon className="h-5 w-5 text-[var(--text-primary)]" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleNewChat}
                className="w-full text-[var(--text-primary)] bg-transparent border border-[var(--border-subtle)] hover:bg-[var(--accent-primary)] hover:text-white rounded-none h-[32px] mb-4"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              {/* Search Chats Field */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your threads..."
                    className="w-full bg-[rgba(0,0,0,0.2)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-md py-2 pl-10 pr-3"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              </div>
              
              {/* Pinned Section */}
              <div className="mb-4">
                <h3 className="text-[10px] uppercase text-[var(--text-secondary)] font-medium tracking-[0.05em] mt-4 mb-2">Pinned</h3>
                <div className="space-y-1">
                  {/* We'll populate this with pinned conversations in the future */}
                  {/* This is a placeholder for the UI structure */}
                  <div className="text-[var(--text-secondary)] text-xs italic px-2">No pinned conversations yet</div>
                </div>
              </div>
            </div>

            {/* Conversations List */}
            <div className="sidebar-content">
              {Object.entries(groupedConversations).map(([dateGroup, convos]) => (
                <div key={dateGroup}>
                  {convos.length > 0 && (
                    <>
                      <h3 className="text-[10px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] text-left mt-8 mb-2">
                        {dateGroup.charAt(0).toUpperCase() + dateGroup.slice(1)}
                      </h3>
                      <div className="space-y-1 mb-4">
                        {convos.map((conversation) => (
                          <div
                            key={conversation.id}
                            className={`h-[32px] px-3 flex items-center group cursor-pointer ${
                              chatState.conversationId === conversation.id 
                                ? "bg-[##743A36] text-white" 
                                : "hover:bg-[rgba(192,25,118,0.15)]"
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
                                <MessageSquareIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="text-sm font-medium truncate flex-1">
                                  {(conversation.title || "New Chat").split(' ').slice(0, 4).join(' ')}
                                  {(conversation.title || "New Chat").split(' ').length > 4 ? '...' : ''}
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
            <div className="p-6 border-t border-subtle bg-surface-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-subtle bg-surface-2 flex-shrink-0">
                  {profile?.email ? (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=D2691E&color=fff&size=48`}
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
                    {userName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button 
                      onClick={() => router.push('/settings')}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer hover:shadow-md transition-shadow ${
                        profile?.account_type === "guest" 
                          ? "bg-[var(--surface-2)] text-[var(--text-secondary)]" 
                          : "bg-[var(--accent-primary)] text-[var(--btn-primary-text)]"
                      }`}
                    >
                      {profile?.account_type === "guest" ? "Free" : "Pro"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resizer */}
        {!sidebarCollapsed && (
          <div
            ref={resizerRef}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-primary)]/20 transition-colors"
          />
        )}
      </div>

      {/* Sidebar toggle when collapsed */}
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(false)}
          className="fixed top-6 left-6 z-50 h-10 w-10 p-0 bg-[var(--surface-1)]/80 backdrop-blur-sm border border-[var(--border-subtle)]/50"
        >
          <PanelRightOpen className="h-5 w-5 text-[var(--text-primary)]" />
        </Button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Conditional rendering for Welcome Screen OR Message List */}
        {chatState.type === "home" ? (
          // New Empty State Structure
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {/* Personalized Greeting */}
            <h2 className="text-[28px] font-[600] text-[var(--text-primary)] mb-4 text-left w-full max-w-2xl">
              How can I help you, {userName}?
            </h2>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-2xl w-full">
              {/* Button 1: Create */}
              <button
                onClick={() => { setInputValue("Suggest fun activities"); textareaRef.current?.focus(); }}
                className="flex flex-col items-center justify-center p-4 bg-transparent text-[var(--text-primary)] border border-[#3A3633] hover:bg-[#2A2726] hover:border-[##743A36] hover:text-white rounded-lg transition-colors duration-150 space-y-2 h-[96px] w-[128px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
              >
                <ZapIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Create</span>
              </button>
              {/* Button 2: Explore */}
              <button
                onClick={() => { setInputValue("Tell me about historical events"); textareaRef.current?.focus(); }}
                className="flex flex-col items-center justify-center p-4 bg-transparent text-[var(--text-primary)] border border-[#3A3633] hover:bg-[#2A2726] hover:border-[##743A36] hover:text-white rounded-lg transition-colors duration-150 space-y-2 h-[96px] w-[128px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
              >
                <GlobeIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Explore</span>
              </button>
              {/* Button 3: Code */}
              <button
                onClick={() => { setInputValue("Write a python script for"); textareaRef.current?.focus(); }}
                className="flex flex-col items-center justify-center p-4 bg-transparent text-[var(--text-primary)] border border-[#3A3633] hover:bg-[#2A2726] hover:border-[##743A36] hover:text-white rounded-lg transition-colors duration-150 space-y-2 h-[96px] w-[128px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
              >
                <Code2Icon className="h-8 w-8" />
                <span className="text-sm font-medium">Code</span>
              </button>
              {/* Button 4: Learn */}
              <button
                onClick={() => { setInputValue("Explain the concept of"); textareaRef.current?.focus(); }}
                className="flex flex-col items-center justify-center p-4 bg-transparent text-[var(--text-primary)] border border-[#3A3633] hover:bg-[#2A2726] hover:border-[##743A36] hover:text-white rounded-lg transition-colors duration-150 space-y-2 h-[96px] w-[128px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]"
              >
                <BookOpenCheckIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Learn</span>
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-3 max-w-md w-full text-left">
              <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-3">Or try these:</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); setInputValue("How fast is light?"); textareaRef.current?.focus(); }} className="block text-[var(--text-secondary)] hover:text-[##743A36] line-height-[1.5]">
                How fast is light?
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setInputValue("Are wormholes real?"); textareaRef.current?.focus(); }} className="block text-[var(--text-secondary)] hover:text-[##743A36] line-height-[1.5]">
                Are wormholes real?
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setInputValue("How many Rs are in the word \"Mississippi\"?"); textareaRef.current?.focus(); }} className="block text-[var(--text-secondary)] hover:text-[##743A36] line-height-[1.5]">
                How many Ss are in the word "Mississippi"?
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setInputValue("Is work-life balance a myth?"); textareaRef.current?.focus(); }} className="block text-[var(--text-secondary)] hover:text-[##743A36] line-height-[1.5]">
                Is work-life balance a myth?
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 animate-fade-in"> {/* This is the new Message List container */}
            {streamMessages.map((message, index) => (
              <div
                key={message.id || `message-${index}`}
                className={`${message.role === "user" ? "message-user" : "message-assistant"} animate-message-in`}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Enhanced Input Area - Fixed at bottom */}
        <div className="fixed bottom-6 left-6 right-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Outer translucent rectangle */}
              <div className="absolute inset-0 bg-[rgba(42,39,38,0.6)] rounded-xl blur-[2px] -m-1"></div>
              {/* Inner translucent rectangle */}
              <div className="chat-input-container bg-[rgba(42,39,38,0.8)] backdrop-blur-sm h-[96px] rounded-xl p-3 relative">
              {/* Text Input Area */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isStreaming}
                className="w-full bg-transparent border-none outline-none resize-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] p-3 max-h-[60px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-subtle)] scrollbar-track-transparent"
                rows={1}
                style={{
                  scrollbarWidth: inputValue.split('\n').length > 1 ? 'thin' : 'none',
                }}
              />
              
              {/* Controls Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3">
                  {/* Model Selector */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="font-bold text-[var(--text-primary)] bg-transparent border-none outline-none cursor-pointer"
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

                  {/* Quality Indicator Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:shadow-sm hover:bg-[rgba(255,255,255,0.1)]"
                    title="Quality settings"
                  >
                    <SparklesIcon className="h-4 w-4" />
                  </Button>

                  {/* Attachment Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:shadow-sm hover:bg-[rgba(255,255,255,0.1)]"
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
                      className="h-8 w-8 p-0 bg-error hover:bg-error/80 text-white border-0 flex items-center justify-center rounded-md"
                      title="Stop generation"
                    >
                      <StopCircleIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`h-8 w-8 p-0 border-0 flex items-center justify-center rounded-md ${
                        inputValue.trim()
                          ? "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          : "bg-transparent text-[var(--text-secondary)] opacity-50 cursor-not-allowed"
                      }`}
                      title="Send message"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {streamError && (
                <div className="px-3 pb-2">
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
    </div>
  );
}