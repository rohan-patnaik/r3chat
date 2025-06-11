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
  LogOutIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export default function ChatLayout() {
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Weight loss strategy for 5'8...",
      lastMessage: "Thanks for the detailed plan!",
      timestamp: "2h ago",
    },
    {
      id: "2", 
      title: "Workout Plan",
      lastMessage: "Perfect routine breakdown",
      timestamp: "1d ago",
    },
    {
      id: "3",
      title: "Machine Learning 6 Hours",
      lastMessage: "Excellent explanation of neural networks",
      timestamp: "2d ago",
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      console.log("Sending message:", currentMessage);
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen surface-0">
      {/* Left Sidebar */}
      <div className="w-80 surface-1 border-r border-subtle flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-primary">T3.chat</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <SettingsIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-secondary hover:text-primary"
              >
                {isLoggingOut ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOutIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* New Chat Button */}
          <Button className="w-full bg-accent hover:bg-accent-hover text-white border-0">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-subtle">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search your threads..."
              className="w-full pl-10 pr-4 py-2 surface-2 border border-subtle rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="mb-4">
              <h3 className="text-xs font-medium text-secondary uppercase tracking-wider px-2 py-1">
                Pinned
              </h3>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xs font-medium text-secondary uppercase tracking-wider px-2 py-1">
                Today
              </h3>
              
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    selectedConversation === conversation.id
                      ? "surface-2 border border-subtle"
                      : "hover:surface-2"
                  }`}
                >
                  <div className="flex items-start">
                    <MessageSquareIcon className="w-4 h-4 text-secondary mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-primary truncate">
                        {conversation.title}
                      </h4>
                      <p className="text-xs text-secondary truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      <span className="text-xs text-tertiary">
                        {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-subtle">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">R</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-primary">Rohan Patnaik</p>
              <div className="flex items-center">
                <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedConversation ? (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                {/* Chat messages would go here */}
                <div className="text-center text-secondary">
                  <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-semibold text-primary mb-6">
                  How can I help you, Rohan?
                </h1>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <Button variant="outline" className="border-subtle hover:surface-2">
                    Create
                  </Button>
                  <Button variant="outline" className="border-subtle hover:surface-2">
                    Explore
                  </Button>
                  <Button variant="outline" className="border-subtle hover:surface-2">
                    Code
                  </Button>
                  <Button variant="outline" className="border-subtle hover:surface-2">
                    Learn
                  </Button>
                </div>

                {/* Example Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 surface-1 border border-subtle rounded-lg text-left hover:surface-2 transition-colors">
                    <p className="text-primary font-medium">How does AI work?</p>
                  </button>
                  <button className="p-4 surface-1 border border-subtle rounded-lg text-left hover:surface-2 transition-colors">
                    <p className="text-primary font-medium">Are black holes real?</p>
                  </button>
                  <button className="p-4 surface-1 border border-subtle rounded-lg text-left hover:surface-2 transition-colors">
                    <p className="text-primary font-medium">How many Rs are in the word "strawberry"?</p>
                  </button>
                  <button className="p-4 surface-1 border border-subtle rounded-lg text-left hover:surface-2 transition-colors">
                    <p className="text-primary font-medium">What is the meaning of life?</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-subtle surface-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              {/* Model Selector */}
              <div className="flex-shrink-0">
                <select className="surface-2 border border-subtle rounded-lg px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent-500">
                  <option>Gemini Flash</option>
                  <option>GPT-4</option>
                  <option>Claude</option>
                </select>
              </div>

              {/* Message Input */}
              <div className="flex-1 relative">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full surface-2 border border-subtle rounded-lg px-4 py-3 text-primary placeholder-text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: "48px", maxHeight: "200px" }}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-accent hover:bg-accent-hover text-white border-0 px-4 py-3"
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}