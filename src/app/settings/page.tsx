"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import {
  UserIcon,
  CpuIcon,
  KeyIcon,
  CreditCardIcon,
  BarChart3Icon,
  ArrowLeftIcon,
  UploadIcon,
  CheckIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Tab = "account" | "models" | "apikeys" | "usage";

const AVAILABLE_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable multimodal model with advanced reasoning",
    features: ["Vision", "Code", "Reasoning", "Web"],
    enabled: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI", 
    description: "Faster, cost-effective version perfect for everyday tasks",
    features: ["Code", "Reasoning"],
    enabled: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Advanced reasoning with excellent code generation",
    features: ["Vision", "Code", "Reasoning", "Analysis"],
    enabled: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Fast, intelligent model for everyday conversations",
    features: ["Speed", "Reasoning"],
    enabled: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Powerful AI with exceptional long context understanding",
    features: ["Vision", "Code", "Long Context"],
    enabled: false,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Ultra-fast responses with multimodal capabilities",
    features: ["Speed", "Vision", "Multimodal"],
    enabled: true,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [displayName, setDisplayName] = useState("");
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    claude: "",
    gemini: "",
  });
  const { profile } = useUserProfile();
  const router = useRouter();

  const tabs = [
    { id: "account" as Tab, label: "Account", icon: UserIcon },
    { id: "models" as Tab, label: "Models", icon: CpuIcon },
    { id: "apikeys" as Tab, label: "API Keys", icon: KeyIcon },
    { id: "usage" as Tab, label: "Usage", icon: BarChart3Icon },
  ];

  const handleSaveProfile = () => {
    console.log("Saving profile:", { displayName });
  };

  const handleSaveApiKey = (provider: keyof typeof apiKeys) => {
    console.log(`Saving ${provider} API key`);
  };

  const handleManageSubscription = () => {
    window.open("https://example.com/billing", "_blank");
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="border-b border-subtle bg-surface-1">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full hover:bg-surface-2 icon-hover"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-accent-primary text-white shadow-sm"
                        : "text-secondary hover:bg-surface-2 hover:text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="settings-section">
                  <h2 className="text-xl font-bold text-primary mb-6">
                    Account Settings
                  </h2>

                  {/* Profile Section */}
                  <div className="settings-form-group">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Profile
                    </h3>
                    
                    <div className="flex items-start space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-subtle bg-surface-2">
                          {profile?.email ? (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.email)}&background=D2691E&color=fff&size=96`}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-10 w-10 text-tertiary" />
                            </div>
                          )}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent-primary hover:bg-accent-hover text-white flex items-center justify-center transition-colors icon-hover">
                          <UploadIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="settings-label">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder={profile?.email || "Enter your name"}
                            className="input-field"
                          />
                        </div>
                        <Button
                          onClick={handleSaveProfile}
                          className="btn-pill"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Section */}
                  <div className="settings-form-group pt-6 border-t border-subtle">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Subscription
                    </h3>
                    <div className="flex items-center justify-between p-6 bg-surface-2 rounded-xl border border-subtle">
                      <div>
                        <p className="font-semibold text-primary text-lg">
                          Current Plan: {profile?.account_type === "guest" ? "Free" : "Pro"}
                        </p>
                        <p className="text-sm text-secondary mt-1">
                          {profile?.credits_left} credits remaining
                        </p>
                      </div>
                      <Button
                        onClick={handleManageSubscription}
                        className="btn-pill flex items-center space-x-2"
                      >
                        <CreditCardIcon className="h-4 w-4" />
                        <span>Manage Subscription</span>
                        <ExternalLinkIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="settings-section">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary mb-2">
                    Available Models
                  </h2>
                  <p className="settings-description">
                    Choose from our selection of cutting-edge AI models. Each model has unique capabilities and strengths.
                  </p>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {AVAILABLE_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={`p-6 bg-surface-2 rounded-xl border transition-all duration-200 ${
                        model.enabled 
                          ? "border-accent-primary shadow-sm" 
                          : "border-subtle hover:border-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-primary text-lg">
                              {model.name}
                            </h3>
                            <span className="px-3 py-1 text-xs font-medium bg-accent-primary text-white rounded-full">
                              {model.provider}
                            </span>
                            {model.enabled && (
                              <CheckIcon className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-secondary leading-relaxed mb-3">
                            {model.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {model.features.map((feature) => (
                              <span 
                                key={feature}
                                className="px-2 py-1 text-xs font-medium bg-surface-1 text-tertiary rounded-md border border-subtle"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "apikeys" && (
              <div className="settings-section">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary mb-2">
                    API Keys
                  </h2>
                  <p className="settings-description">
                    Add your API keys to use your own credits and bypass rate limits. Your keys are encrypted and stored securely.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* OpenAI */}
                  <div className="settings-form-group">
                    <label className="settings-label">
                      OpenAI API Key
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="password"
                        value={apiKeys.openai}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, openai: e.target.value }))
                        }
                        placeholder="sk-..."
                        className="input-field flex-1"
                      />
                      <Button
                        onClick={() => handleSaveApiKey("openai")}
                        className="btn-pill"
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Claude */}
                  <div className="settings-form-group">
                    <label className="settings-label">
                      Claude API Key
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="password"
                        value={apiKeys.claude}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, claude: e.target.value }))
                        }
                        placeholder="sk-ant-..."
                        className="input-field flex-1"
                      />
                      <Button
                        onClick={() => handleSaveApiKey("claude")}
                        className="btn-pill"
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Gemini */}
                  <div className="settings-form-group">
                    <label className="settings-label">
                      Gemini API Key
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="password"
                        value={apiKeys.gemini}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, gemini: e.target.value }))
                        }
                        placeholder="AIza..."
                        className="input-field flex-1"
                      />
                      <Button
                        onClick={() => handleSaveApiKey("gemini")}
                        className="btn-pill"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="settings-section">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary mb-2">
                    Message Usage
                  </h2>
                  <p className="settings-description">
                    Track your API usage across different tiers and manage your subscription.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Usage Panel */}
                  <div className="p-6 bg-surface-2 rounded-xl border border-subtle">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-primary">
                            Standard Messages
                          </span>
                          <span className="text-sm text-secondary font-mono">
                            {10 - (profile?.credits_left || 0)}/10
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${((10 - (profile?.credits_left || 0)) / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-primary">
                            Premium Messages
                          </span>
                          <span className="text-sm text-secondary font-mono">0/5</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: "0%" }} />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-subtle text-center space-y-3">
                        <p className="text-sm text-secondary leading-relaxed">
                          Buy more creds<br />
                          coz AI ain't cheap
                        </p>
                        <Button
                          onClick={handleManageSubscription}
                          className="btn-pill"
                        >
                          <CreditCardIcon className="h-4 w-4" />
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}