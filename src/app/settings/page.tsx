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
    description: "Most capable multimodal model with advanced reasoning and vision capabilities",
    features: ["Vision", "Code", "Reasoning", "Web"],
    enabled: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI", 
    description: "Faster, cost-effective version perfect for everyday tasks and quick responses",
    features: ["Code", "Reasoning", "Speed"],
    enabled: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Advanced reasoning with excellent code generation and analysis capabilities",
    features: ["Vision", "Code", "Reasoning", "Analysis"],
    enabled: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Fast, intelligent model for everyday conversations with quick response times",
    features: ["Speed", "Reasoning", "Efficiency"],
    enabled: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Powerful AI with exceptional long context understanding and multimodal capabilities",
    features: ["Vision", "Code", "Long Context", "Multimodal"],
    enabled: false,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Ultra-fast responses with multimodal capabilities and efficient processing",
    features: ["Speed", "Vision", "Multimodal", "Efficiency"],
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
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full hover:bg-surface-2 icon-hover"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2 sticky top-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-5 py-4 rounded-xl text-left transition-all duration-200 font-medium ${
                      activeTab === tab.id
                        ? "bg-accent-primary text-white shadow-lg"
                        : "text-secondary hover:bg-surface-2 hover:text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeTab === "account" && (
              <div className="space-y-8">
                <div className="settings-section">
                  <h2 className="text-2xl font-bold text-primary mb-8">
                    Account Settings
                  </h2>

                  {/* Profile Section */}
                  <div className="settings-form-group">
                    <h3 className="text-xl font-semibold text-primary mb-6">
                      Profile
                    </h3>
                    
                    <div className="flex items-start space-x-8">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-3 border-subtle bg-surface-2 shadow-lg">
                          {profile?.email ? (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.email)}&background=D2691E&color=fff&size=128`}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-12 w-12 text-tertiary" />
                            </div>
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent-primary hover:bg-accent-hover text-white flex items-center justify-center transition-all icon-hover shadow-lg">
                          <UploadIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                        <div>
                          <label className="settings-label">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder={profile?.email || "Enter your name"}
                            className="input-field text-lg"
                          />
                        </div>
                        <div>
                          <label className="settings-label">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profile?.email || ""}
                            disabled
                            className="input-field text-lg bg-surface-2 text-tertiary"
                          />
                          <p className="text-sm text-tertiary mt-2">
                            Email address cannot be changed as it's linked to your Google account.
                          </p>
                        </div>
                        <Button
                          onClick={handleSaveProfile}
                          className="btn-pill px-8 py-3"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Section */}
                  <div className="settings-form-group pt-8 border-t border-subtle">
                    <h3 className="text-xl font-semibold text-primary mb-6">
                      Subscription
                    </h3>
                    <div className="flex items-center justify-between p-8 bg-surface-2 rounded-2xl border border-subtle shadow-sm">
                      <div>
                        <p className="font-bold text-primary text-xl">
                          Current Plan: {profile?.account_type === "guest" ? "Free" : "Pro"}
                        </p>
                        <p className="text-secondary mt-2 text-lg">
                          {profile?.credits_left} credits remaining
                        </p>
                        <p className="text-tertiary text-sm mt-1">
                          {profile?.account_type === "guest" 
                            ? "Upgrade to Pro for unlimited credits and premium features"
                            : "Thank you for being a Pro subscriber!"
                          }
                        </p>
                      </div>
                      <Button
                        onClick={handleManageSubscription}
                        className="btn-pill flex items-center space-x-2 px-6 py-3"
                      >
                        <CreditCardIcon className="h-5 w-5" />
                        <span>Manage Subscription</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="settings-section">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    Available Models
                  </h2>
                  <p className="settings-description text-lg">
                    Choose from our selection of cutting-edge AI models. Each model has unique capabilities and strengths for different use cases.
                  </p>
                </div>

                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                  {AVAILABLE_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={`model-card ${model.enabled ? 'enabled' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="font-bold text-primary text-xl">
                              {model.name}
                            </h3>
                            <span className="px-4 py-1 text-sm font-semibold bg-accent-primary text-white rounded-full">
                              {model.provider}
                            </span>
                            {model.enabled && (
                              <CheckIcon className="h-6 w-6 text-green-500" />
                            )}
                          </div>
                          <p className="text-secondary leading-relaxed mb-4 text-base">
                            {model.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {model.features.map((feature) => (
                              <span 
                                key={feature}
                                className="px-3 py-1 text-sm font-medium bg-surface-1 text-tertiary rounded-lg border border-subtle"
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    API Keys
                  </h2>
                  <p className="settings-description text-lg">
                    Add your API keys to use your own credits and bypass rate limits. Your keys are encrypted and stored securely using industry-standard encryption.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* OpenAI */}
                  <div className="settings-form-group">
                    <label className="settings-label text-lg">
                      OpenAI API Key
                    </label>
                    <p className="text-sm text-tertiary mb-4">
                      Used for GPT-4o and GPT-4o Mini models. Get your API key from the OpenAI dashboard.
                    </p>
                    <div className="flex space-x-4">
                      <input
                        type="password"
                        value={apiKeys.openai}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, openai: e.target.value }))
                        }
                        placeholder="sk-..."
                        className="input-field flex-1 text-lg"
                      />
                      <Button
                        onClick={() => handleSaveApiKey("openai")}
                        className="btn-pill px-8"
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Claude */}
                  <div className="settings-form-group">
                    <label className="settings-label text-lg">
                      Claude API Key
                    </label>
                    <p className="text-sm text-tertiary mb-4">
                      Used for Claude 3.5 Sonnet and Haiku models. Get your API key from the Anthropic console.
                    </p>
                    <div className="flex space-x-4">
                      <input
                        type="password"
                        value={apiKeys.claude}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, claude: e.target.value }))
                        }
                        placeholder="sk-ant-..."
                        className="input-field flex-1 text-lg"
                      />
                      <Button
                        onClick={() => handleSaveApiKey("claude")}
                        className="btn-pill px-8"
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Gemini */}
                  <div className="settings-form-group">
                    <label className="settings-label text-lg">
                      Gemini API Key
                    </label>
                    <p className="text-sm text-tertiary mb-4">
                      Used for Gemini 1.5 Pro and Flash models. Get your API key from Google AI Studio.
                    </p>
                    <div className="flex space-x-4">
                      <input
                        type="password"
                        value={apiKeys.gemini}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, gemini: e.target.value }))
                        }
                        placeholder="AIza..."
                        className="input-field flex-1 text-lg"
                      />
                      <Button
                        onClick={() => handleSaveApiKey("gemini")}
                        className="btn-pill px-8"
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    Message Usage
                  </h2>
                  <p className="settings-description text-lg">
                    Track your API usage across different tiers and manage your subscription to ensure uninterrupted access.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Usage Panel */}
                  <div className="p-8 bg-surface-2 rounded-2xl border border-subtle shadow-sm">
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-primary text-lg">
                            Standard Messages
                          </span>
                          <span className="text-base text-secondary font-mono">
                            {10 - (profile?.credits_left || 0)}/10
                          </span>
                        </div>
                        <div className="progress-bar h-3">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${((10 - (profile?.credits_left || 0)) / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-tertiary mt-2">
                          Free tier includes basic models like GPT-4o Mini and Claude Haiku
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-primary text-lg">
                            Premium Messages
                          </span>
                          <span className="text-base text-secondary font-mono">0/5</span>
                        </div>
                        <div className="progress-bar h-3">
                          <div className="progress-fill" style={{ width: "0%" }} />
                        </div>
                        <p className="text-sm text-tertiary mt-2">
                          Premium models like GPT-4o and Claude Sonnet (Pro subscription required)
                        </p>
                      </div>

                      <div className="pt-6 border-t border-subtle text-center space-y-4">
                        <div>
                          <p className="text-lg font-medium text-primary">
                            Buy more creds
                          </p>
                          <p className="text-lg font-medium text-primary">
                            coz AI ain't cheap
                          </p>
                        </div>
                        <Button
                          onClick={handleManageSubscription}
                          className="btn-pill px-8 py-3"
                        >
                          <CreditCardIcon className="h-5 w-5" />
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