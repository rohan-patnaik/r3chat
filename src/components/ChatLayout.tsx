// src/components/ChatLayout.tsx

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
  StopCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  TrashIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useConversations } from "@/lib/hooks/useConversations";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
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
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-1.5-flash-latest",
    label: "Gemini 1.5 Flash",
    provider: "google",
  },
  { id: "gemini-1.5-pro-latest", label: "Gemini 1.5 Pro", provider: "google" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  {
    id: "claude-3-5-sonnet-20240620",
    label: "Claude 3.5 Sonnet",
    provider: "anthropic",
  },
  {
    id: "claude-3-haiku-20240307",
    label: "Claude 3 Haiku",
    provider: "anthropic",
  },
];

// This is a type predicate function. It tells TypeScript that if this function
// returns true, the object's `created_at` property is guaranteed to be a string.
function hasCreatedAt(
  c: ConversationWithLastMessage,
): c is ConversationWithLastMessage & { created_at: string } {
  return c.created_at != null;
}

export default function ChatLayout() {
  const router = useRouter();
  const {
    conversations,
    loading,
    error: convError,
    refetch,
    deleteConversation,
    renameConversation,
  } = useConversations();

  const { profile, loading: loadingProfile } = useUserProfile();

  const [chatState, setChatState] = useState<ChatState>({ type: "home" });
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    AVAILABLE_MODELS[0]?.id || "",
  );

  const {
    messages,
    setMessages,
    isStreaming,
    error: streamError,
    sendMessage,
    stopStreaming,
  } = useChatStream({
    onConversationCreated: (newConversationId) => {
      setChatState({ type: "existing", conversationId: newConversationId });
      refetch();
    },
    onMessageComplete: () => {
      refetch();
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatState.type === "new") {
      inputRef.current?.focus();
    }
  }, [chatState.type]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const prompt = input;
    setInput("");
    await sendMessage(
      prompt,
      chatState.type === "existing" ? chatState.conversationId : undefined,
      selectedModel,
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNewChat = () => {
    setChatState({ type: "new" });
    setMessages([]);
    router.push("/");
  };

  const handleConversationClick = async (
    conversation: ConversationWithLastMessage,
  ) => {
    setChatState({
      type: "existing",
      conversationId: conversation.id,
      conversation: conversation,
    });

    try {
      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`,
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      const fetchedMessages: Message[] = await response.json();
      const formattedMessages = fetchedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error(err);
      setMessages([
        {
          role: "assistant",
          content: "Error: Could not load conversation history.",
          isError: true,
        },
      ]);
    }
  };

  const handleBackToHome = () => {
    setChatState({ type: "home" });
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (chatState.conversationId === conversationId) {
        handleBackToHome();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleRenameStart = (conversation: ConversationWithLastMessage) => {
    setRenamingId(conversation.id);
    setRenameValue(conversation.title ?? "");
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const handleRenameSubmit = async (conversationId: string) => {
    if (!renameValue.trim()) return;
    try {
      await renameConversation(conversationId, renameValue);
      setRenamingId(null);
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // THE FIX: Use the type predicate function in the filter.
  // This tells TypeScript that the resulting array is safe to pass to the grouping function.
  const groupedConversations = groupConversationsByDate(
    filteredConversations.filter(hasCreatedAt),
  );

  const renderChatHeader = () => {
    if (chatState.type === "existing" && chatState.conversation) {
      return (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleBackToHome}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <MessageSquareIcon className="h-6 w-6 text-text-secondary" />
          <h2 className="text-lg font-semibold text-text-primary">
            {chatState.conversation.title}
          </h2>
        </div>
      );
    }
    if (chatState.type === "new") {
      return (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleBackToHome}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <PlusIcon className="h-6 w-6 text-text-secondary" />
          <h2 className="text-lg font-semibold text-text-primary">New Chat</h2>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen w-full bg-surface-0 text-text-primary">
      <aside
        className={`surface-1 border-r border-primary flex-col ${
          chatState.type !== "home" ? "hidden md:flex" : "flex"
        } w-full md:w-80`}
      >
        <div className="flex h-16 items-center justify-between border-b border-primary p-4">
          <h1 className="text-xl font-bold">R3Chat</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Button className="w-full bg-accent" onClick={handleNewChat}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="surface-0 w-full rounded-md border border-subtle pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p>Loading...</p>}
          {Object.entries(groupedConversations).map(([group, convs]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-text-secondary mb-2 px-2">
                {group}
              </h3>
              <ul className="space-y-1">
                {convs.map((conversation) => (
                  <li
                    key={conversation.id}
                    className={`group flex items-center justify-between rounded-md p-2 cursor-pointer hover:bg-surface-2 ${
                      chatState.conversationId === conversation.id
                        ? "bg-surface-2"
                        : ""
                    }`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    {renamingId === conversation.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleRenameSubmit(conversation.id);
                          if (e.key === "Escape") handleRenameCancel();
                        }}
                        onBlur={handleRenameCancel}
                        autoFocus
                        className="surface-0 w-full bg-transparent text-sm focus:outline-none"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 truncate">
                          <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-sm">
                            {conversation.title}
                          </span>
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameStart(conversation);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation.id);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <main
        className={`flex flex-1 flex-col ${
          chatState.type === "home" ? "hidden md:flex" : "flex"
        }`}
      >
        {chatState.type === "home" && (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold">R3Chat</h1>
            <p className="text-text-secondary">
              Select a conversation or start a new one.
            </p>
          </div>
        )}

        {(chatState.type === "new" || chatState.type === "existing") && (
          <>
            <div className="flex h-16 items-center border-b border-primary p-4">
              {renderChatHeader()}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-accent text-white"
                        : "surface-1"
                    } ${message.isError ? "border border-red-500" : ""}`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-primary p-4">
              {streamError && (
                <p className="text-center text-sm text-red-500 mb-2">
                  Error: {streamError}
                </p>
              )}
              <p className="text-center text-xs text-text-secondary mb-2">
                Credits Left:{" "}
                {loadingProfile ? "..." : profile?.credits_left ?? 0}
              </p>
              <div className="surface-1 relative mx-auto max-w-3xl rounded-lg border border-subtle">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="surface-1 w-full resize-none rounded-lg bg-transparent p-4 pr-20 focus:outline-none"
                  rows={1}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="surface-0 rounded border border-subtle px-2 py-1 text-xs"
                  >
                    {AVAILABLE_MODELS.map((model) => (
                      <option
                        key={model.id}
                        value={model.id}
                        disabled={model.provider !== "google"}
                        className={
                          model.provider !== "google"
                            ? "text-text-tertiary"
                            : ""
                        }
                      >
                        {model.label}{" "}
                        {model.provider !== "google" && "(Coming Soon)"}
                      </option>
                    ))}
                  </select>
                  {isStreaming ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={stopStreaming}
                    >
                      <StopCircleIcon className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      className="bg-accent"
                      onClick={handleSendMessage}
                      disabled={
                        !profile || (profile && profile.credits_left <= 0)
                      }
                    >
                      <SendIcon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}