"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import {
  UserIcon,
  CpuIcon,
  KeyIcon,
  BarChart3Icon,
  ArrowLeftIcon,
  UploadIcon,
  CheckIcon,
  ExternalLinkIcon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const [savedApiKeys, setSavedApiKeys] = useState({
    openai: false,
    claude: false,
    gemini: false,
  });
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    claude: false,
    gemini: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { profile } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();

  // Set display name to email by default
  useEffect(() => {
    if (profile?.email && !displayName) {
      setDisplayName(profile.email.split("@")[0]);
    }
  }, [profile, displayName]);

  const tabs = [
    { id: "account" as Tab, label: "Account", icon: UserIcon },
    { id: "models" as Tab, label: "Models", icon: CpuIcon },
    { id: "apikeys" as Tab, label: "API Keys", icon: KeyIcon },
    { id: "usage" as Tab, label: "Usage", icon: BarChart3Icon },
  ];

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    
    setIsLoading(true);
    try {
      // Update display name in database
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', profile?.id);
        
      if (error) throw error;
      
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async (provider: keyof typeof apiKeys) => {
    const key = apiKeys[provider];
    if (!key.trim()) return;
    
    setIsLoading(true);
    try {
      // Save API key to database
      const { error } = await supabase
        .from('provider_keys')
        .upsert({
          user_id: profile?.id,
          provider: provider,
          api_key: key.trim(),
        });
        
      if (error) throw error;
      
      setSavedApiKeys(prev => ({ ...prev, [provider]: true }));
      setShowApiKeys(prev => ({ ...prev, [provider]: false }));
      console.log(`${provider} API key saved successfully`);
    } catch (error) {
      console.error(`Error saving ${provider} API key:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = () => {
    window.open("https://example.com/billing", "_blank");
  };

  const toggleApiKeyVisibility = (provider: keyof typeof showApiKeys) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="settings-header">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 btn-ghost icon-hover"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Settings</h1>
        </div>
      </div>

      <div className="settings-container">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="settings-nav sticky top-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
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
              <div className="settings-section animate-fade-in">
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
                          placeholder="Enter your display name"
                          className="input-field"
                        />
                        <p className="text-xs text-muted mt-2">
                          This name will be displayed in your profile section.
                        </p>
                      </div>
                      <div>
                        <label className="settings-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          className="input-field"
                        />
                        <p className="text-xs text-muted mt-2">
                          Email address cannot be changed as it's linked to your Google account.
                        </p>
                      </div>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isLoading || !displayName.trim()}
                        className="btn-primary"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
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
                      <p className="text-muted text-sm mt-1">
                        {profile?.account_type === "guest" 
                          ? "Upgrade to Pro for unlimited credits and premium features"
                          : "Thank you for being a Pro subscriber!"
                        }
                      </p>
                    </div>
                    <Button
                      onClick={handleManageSubscription}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CreditCardIcon className="h-5 w-5" />
                      <span>Manage Subscription</span>
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="settings-section animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    Available Models
                  </h2>
                  <p className="settings-description">
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
                              <CheckIcon className="h-6 w-6 text-success" />
                            )}
                          </div>
                          <p className="text-secondary leading-relaxed mb-4">
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
              <div className="settings-section animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    API Keys
                  </h2>
                  <p className="settings-description">
                    Add your API keys to use your own credits and bypass rate limits. Your keys are encrypted and stored securely using industry-standard encryption.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* OpenAI */}
                  <div className="settings-form-group">
                    <label className="settings-label">
                      OpenAI API Key
                    </label>
                    <p className="text-sm text-muted mb-4">
                      Used for GPT-4o and GPT-4o Mini models. Get your API key from the OpenAI dashboard.
                    </p>
                    <div className="flex space-x-4">
                      <div className="relative flex-1">
                        <input
                          type={showApiKeys.openai ? "text" : "password"}
                          value={apiKeys.openai}
                          onChange={(e) =>
                            setApiKeys((prev) => ({ ...prev, openai: e.target.value }))
                          }
                          placeholder={savedApiKeys.openai ? "••••••••••••••••" : "sk-..."}
                          className="input-field pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility("openai")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-ghost p-1"
                        >
                          {showApiKeys.openai ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        onClick={() => handleSaveApiKey("openai")}
                        disabled={isLoading || !apiKeys.openai.trim()}
                        className="btn-primary"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>

                  {/* Claude */}
                  <div className="settings-form-group">
                    <label className="settings-label">
                      Claude API Key
                    </label>
                    <p className="text-sm text-muted mb-4">
                      Used for Claude 3.5 Sonnet and Haiku models. Get your API key from the Anthropic console.
                    </p>
                    <div className="flex space-x-4">
                      <div className="relative flex-1">
                        <input
                          type={showApiKeys.claude ? "text" : "password"}
                          value={apiKeys.claude}
                          onChange={(e) =>
                            setApiKeys((prev) => ({ ...prev, claude: e.target.value }))
                          }
                          placeholder={savedApiKeys.claude ? "••••••••••••••••" : "sk-ant-..."}
                          className="input-field pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility("claude")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-ghost p-1"
                        >
                          {showApiKeys.claude ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        onClick={() => handleSaveApiKey("claude")}
                        disabled={isLoading || !apiKeys.claude.trim()}
                        className="btn-primary"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>

                  {/* Gemini */}
                  <div className="settings-form-group">
                    <label className="settings-label">
                      Gemini API Key
                    </label>
                    <p className="text-sm text-muted mb-4">
                      Used for Gemini 1.5 Pro and Flash models. Get your API key from Google AI Studio.
                    </p>
                    <div className="flex space-x-4">
                      <div className="relative flex-1">
                        <input
                          type={showApiKeys.gemini ? "text" : "password"}
                          value={apiKeys.gemini}
                          onChange={(e) =>
                            setApiKeys((prev) => ({ ...prev, gemini: e.target.value }))
                          }
                          placeholder={savedApiKeys.gemini ? "••••••••••••••••" : "AIza..."}
                          className="input-field pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility("gemini")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-ghost p-1"
                        >
                          {showApiKeys.gemini ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        onClick={() => handleSaveApiKey("gemini")}
                        disabled={isLoading || !apiKeys.gemini.trim()}
                        className="btn-primary"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "usage" && (
              <div className="settings-section animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    Message Usage
                  </h2>
                  <p className="settings-description">
                    Track your API usage across different tiers and manage your subscription to ensure uninterrupted access.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Usage Panel */}
                  <div className="p-8 bg-surface-2 rounded-2xl border border-subtle shadow-sm">
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-primary text-lg">
                              Standard Messages
                            </h4>
                            <p className="text-sm text-muted">
                              Free tier includes basic models like GPT-4o Mini and Claude Haiku
                            </p>
                          </div>
                          <span className="text-lg text-secondary font-mono">
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
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-primary text-lg">
                              Premium Messages
                            </h4>
                            <p className="text-sm text-muted">
                              Premium models like GPT-4o and Claude Sonnet (Pro subscription required)
                            </p>
                          </div>
                          <span className="text-lg text-secondary font-mono">0/5</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: "0%" }} />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-subtle text-center space-y-4">
                        <div>
                          <p className="text-lg font-semibold text-primary">
                            Buy more creds
                          </p>
                        </div>
                        <Button
                          onClick={handleManageSubscription}
                          className="btn-primary"
                        >
                          <CreditCardIcon className="h-5 w-5 mr-2" />
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