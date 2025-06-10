"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquareIcon, SendIcon } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export default function ChatLayout({ children }: { children?: React.ReactNode }) {
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Getting started with AI",
      lastMessage: "How can I help you today?",
      timestamp: "2 hours ago",
    },
    {
      id: "2", 
      title: "Code review help",
      lastMessage: "Let me review that for you...",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      title: "Project planning",
      lastMessage: "Here's what I recommend...",
      timestamp: "3 days ago",
    },
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-border">
          <Button 
            className="w-full justify-start gap-2" 
            variant="outline"
            onClick={() => setSelectedConversation(null)}
          >
            <PlusIcon className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors hover:bg-accent ${
                  selectedConversation === conversation.id 
                    ? "bg-accent" 
                    : "bg-transparent"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquareIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.timestamp}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedConversation ? (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                    <p>Hello! How can I help you today?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                    <p>I'm looking for help with my React project.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                    <p>I'd be happy to help! What specific aspect of your React project would you like assistance with?</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquareIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Start a new conversation</h2>
                <p className="text-muted-foreground">
                  Select a conversation from the sidebar or start a new chat
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px] max-h-[200px]"
                  rows={2}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="icon"
                className="self-end mb-1"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}