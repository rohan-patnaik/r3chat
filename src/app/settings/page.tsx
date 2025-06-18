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
  InfoIcon,
  ArrowRightIcon,
  ListFilterIcon,
  SparklesIcon,
  XCircleIcon,
  LinkIcon,
  ShieldIcon,
  BellIcon,
  HelpCircleIcon,
  SettingsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/hooks/useTheme";

type Tab =
  | "account"
  | "customization"
  | "history"
  | "models"
  | "apikeys"
  | "attachments"
  | "contact";

const AVAILABLE_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description:
      "Most capable multimodal model with advanced reasoning and vision capabilities",
    features: ["Vision", "Code", "Reasoning", "Web"],
    enabled: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description:
      "Faster, cost-effective version perfect for everyday tasks and quick responses",
    features: ["Code", "Reasoning", "Speed"],
    enabled: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description:
      "Advanced reasoning with excellent code generation and analysis capabilities",
    features: ["Vision", "Code", "Reasoning", "Analysis"],
    enabled: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description:
      "Fast, intelligent model for everyday conversations with quick response times",
    features: ["Speed", "Reasoning", "Efficiency"],
    enabled: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description:
      "Powerful AI with exceptional long context understanding and multimodal capabilities",
    features: ["Vision", "Code", "Long Context", "Multimodal"],
    enabled: false,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description:
      "Ultra-fast responses with multimodal capabilities and efficient processing",
    features: ["Speed", "Vision", "Multimodal", "Efficiency"],
    enabled: true,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [modelSettings, setModelSettings] = useState(
    AVAILABLE_MODELS.map((m) => ({ id: m.id, enabled: m.enabled }))
  );
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
  const { theme } = useTheme();

  useEffect(() => {
    if (profile?.email && !displayName) {
      setDisplayName(profile.email.split("@")[0]);
    }
  }, [profile, displayName]);

  const tabsConfig: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "Account", icon: <UserIcon className="h-4 w-4" /> },
    { id: "customization", label: "Customization", icon: <SettingsIcon className="h-4 w-4" /> },
    { id: "history", label: "History & Sync", icon: <BarChart3Icon className="h-4 w-4" /> },
    { id: "models", label: "Models", icon: <CpuIcon className="h-4 w-4" /> },
    { id: "apikeys", label: "API Keys", icon: <KeyIcon className="h-4 w-4" /> },
    { id: "attachments", label: "Attachments", icon: <LinkIcon className="h-4 w-4" /> },
    { id: "contact", label: "Contact Us", icon: <HelpCircleIcon className="h-4 w-4" /> },
  ];

  const handleToggleModel = (modelId: string) => {
    setModelSettings((prev) =>
      prev.map((m) =>
        m.id === modelId ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", profile?.id);

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
      const { error } = await supabase.from("provider_keys").upsert({
        user_id: profile?.id,
        provider: provider,
        api_key: key.trim(),
      });

      if (error) throw error;

      setSavedApiKeys((prev) => ({ ...prev, [provider]: true }));
      setShowApiKeys((prev) => ({ ...prev, [provider]: false }));
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
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Modern Header */}
      <div className="sticky top-0 z-40 bg-surface-0/80 backdrop-blur-lg border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-10 w-10 p-0 rounded-full hover:bg-surface-1 transition-all duration-200"
                title="Back to Chat"
              >
                <ArrowLeftIcon className="h-5 w-5 text-text-primary" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
                <p className="text-sm text-text-secondary">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                className="text-text-secondary hover:text-text-primary transition-colors"
                title="Sign out"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - User Profile & Usage */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-surface-1 rounded-2xl p-6 border border-subtle shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-accent-primary bg-surface-2 mx-auto flex items-center justify-center">
                    {profile?.email ? (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          profile.display_name ||
                            profile.email.split("@")[0]
                        )}&background=${encodeURIComponent(
                          theme === "dark" ? "#8a6d5f" : "#6b4f41"
                        )}&color=fff&size=80&font-size=0.33&bold=true`}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-10 w-10 text-text-secondary" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {profile?.display_name ||
                    profile?.email?.split("@")[0] ||
                    "User"}
                </h3>
                <p className="text-sm text-text-secondary mb-3 truncate">
                  {profile?.email || "No email"}
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                    profile?.account_type === "guest"
                      ? "bg-surface-2 text-text-secondary"
                      : "bg-accent-primary text-white"
                  }`}
                >
                  {profile?.account_type === "guest" ? "Free Plan" : "Pro Plan"}
                </span>
              </div>
            </div>

            {/* Message Usage Card */}
            <div className="bg-surface-1 rounded-2xl p-6 border border-subtle shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Message Usage</h3>
                <InfoIcon className="h-4 w-4 text-text-secondary" />
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Resets on Jan 1, 2025
              </p>
              
              {/* Standard Usage */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    Standard
                  </span>
                  <span className="text-sm text-text-primary font-mono">
                    {`${
                      profile?.account_type === "guest"
                        ? 10 - (profile.credits_left ?? 10)
                        : 1500 - (profile?.credits_left ?? 1500)
                    } / ${
                      profile?.account_type === "guest" ? 10 : 1500
                    }`}
                  </span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        ((profile?.account_type === "guest"
                          ? 10 - (profile.credits_left ?? 10)
                          : 1500 - (profile?.credits_left ?? 1500)) /
                          (profile?.account_type === "guest"
                            ? 10
                            : 1500)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {`${
                    profile?.credits_left ??
                    (profile?.account_type === "guest" ? 10 : 1500)
                  } messages remaining`}
                </p>
              </div>

              {/* Premium Usage */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-text-primary mr-2">
                      Premium
                    </span>
                    <InfoIcon className="h-3 w-3 text-text-secondary" />
                  </div>
                  <span className="text-sm text-text-primary font-mono">
                    {`${
                      profile?.account_type === "pro" ? 0 : 0
                    } / ${profile?.account_type === "pro" ? 100 : 0}`}
                  </span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${profile?.account_type === "pro" ? 0 : 0}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {`${
                    profile?.account_type === "pro" ? 100 : 0
                  } messages remaining`}
                </p>
              </div>

              <Button
                onClick={() =>
                  window.open("https://example.com/billing", "_blank")
                }
                className="w-full bg-accent-primary hover:bg-accent-hover text-white rounded-xl py-3 font-medium transition-all duration-200 hover:shadow-lg"
              >
                Buy more premium credits
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Keyboard Shortcuts Card */}
            <div className="bg-surface-1 rounded-2xl p-6 border border-subtle shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Search</span>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">Ctrl</kbd>
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">K</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">New Chat</span>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">Ctrl</kbd>
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">Shift</kbd>
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">O</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Toggle Sidebar</span>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">Ctrl</kbd>
                    <kbd className="px-2 py-1 text-xs bg-surface-2 rounded border border-subtle">B</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-subtle">
                <nav className="flex justify-between space-x-1 pb-px">
                  {tabsConfig.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-0 h-[32px] text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-opacity-50 ${
                        activeTab === tab.id
                          ? "bg-[#8a6d5f] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "account" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Pro Plan Benefits */}
                  {profile?.account_type === "pro" && (
                    <div className="bg-surface-1 rounded-2xl p-8 border border-subtle shadow-sm hover:shadow-md transition-all duration-300">
                      <h2 className="text-2xl font-bold text-text-primary mb-6">Pro Plan Benefits</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-surface-2 rounded-xl border border-subtle hover:border-accent-primary transition-all duration-200">
                          <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚀</span>
                          </div>
                          <h4 className="text-lg font-semibold text-text-primary mb-2">
                            Access to All Models
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Utilize our most powerful AI models without restrictions.
                          </p>
                        </div>
                        <div className="text-center p-6 bg-surface-2 rounded-xl border border-subtle hover:border-accent-primary transition-all duration-200">
                          <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💰</span>
                          </div>
                          <h4 className="text-lg font-semibold text-text-primary mb-2">
                            Generous Limits
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Enjoy higher message quotas and usage allowances.
                          </p>
                        </div>
                        <div className="text-center p-6 bg-surface-2 rounded-xl border border-subtle hover:border-accent-primary transition-all duration-200">
                          <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🎧</span>
                          </div>
                          <h4 className="text-lg font-semibold text-text-primary mb-2">
                            Priority Support
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Get faster assistance from our dedicated support team.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Management */}
                  <div className="bg-surface-1 rounded-2xl p-8 border border-subtle shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Subscription Management
                    </h3>
                    <p className="text-text-secondary mb-6">
                      You are currently on the{" "}
                      <span className="font-semibold text-accent-primary">
                        {profile?.account_type === "guest" ? "Free Plan" : "Pro Plan"}
                      </span>
                      .{" "}
                      {profile?.account_type === "guest" &&
                        "Consider upgrading for more features and higher limits."}
                    </p>
                    <Button
                      onClick={() =>
                        window.open("https://example.com/billing", "_blank")
                      }
                      className="bg-accent-primary hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                    >
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Manage Subscription
                      <ExternalLinkIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-surface-1 rounded-2xl p-8 border border-error shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <ShieldIcon className="h-6 w-6 text-error mr-3" />
                      <h3 className="text-xl font-semibold text-error">Danger Zone</h3>
                    </div>
                    <p className="text-text-secondary mb-6">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        alert("Account deletion initiated (placeholder). This is irreversible.")
                      }
                      className="bg-error hover:bg-error/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "models" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Header Card */}
                  <div className="bg-surface-1 rounded-2xl p-8 border border-subtle shadow-sm">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                      Available Models
                    </h2>
                    <p className="text-text-secondary mb-6">
                      Choose which models appear in your model selector. This won't affect existing conversations.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary border-subtle rounded-xl"
                      >
                        <ListFilterIcon className="h-4 w-4 mr-2" /> Filter by features
                      </Button>
                      <Button
                        variant="outline"
                        className="text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary border-subtle rounded-xl"
                      >
                        <SparklesIcon className="h-4 w-4 mr-2" /> Select Recommended
                      </Button>
                      <Button
                        variant="outline"
                        className="text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary border-subtle rounded-xl"
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" /> Unselect All
                      </Button>
                    </div>
                  </div>

                  {/* Models Grid */}
                  <div className="grid gap-6">
                    {AVAILABLE_MODELS.map((model) => {
                      const modelState = modelSettings.find((m) => m.id === model.id);
                      const isEnabled = modelState?.enabled ?? model.enabled;
                      return (
                        <div
                          key={model.id}
                          className={`bg-surface-1 rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                            isEnabled
                              ? "border-accent-primary shadow-md bg-gradient-to-r from-surface-1 to-accent-primary/5"
                              : "border-subtle shadow-sm hover:border-accent-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center mr-4">
                                  <span className="text-xl">
                                    {model.provider === "OpenAI"
                                      ? "🤖"
                                      : model.provider === "Anthropic"
                                      ? "✨"
                                      : "🧠"}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-text-primary">
                                    {model.name}
                                  </h3>
                                  <p className="text-sm text-text-secondary">{model.provider}</p>
                                </div>
                              </div>
                              <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                                {model.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {model.features.map((feature) => (
                                  <span
                                    key={feature}
                                    className="px-3 py-1 text-xs font-medium bg-surface-2 text-text-secondary rounded-full border border-subtle"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="ml-6 flex flex-col items-end space-y-3">
                              <label
                                htmlFor={`toggle-${model.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    id={`toggle-${model.id}`}
                                    className="sr-only"
                                    checked={isEnabled}
                                    onChange={() => handleToggleModel(model.id)}
                                  />
                                  <div
                                    className={`block w-12 h-6 rounded-full transition-all duration-200 ${
                                      isEnabled ? "bg-[#743A36]" : "bg-[var(--surface-2)]"
                                    }`}
                                  ></div>
                                  <div
                                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                                      isEnabled ? "translate-x-6" : ""
                                    }`}
                                  ></div>
                                </div>
                              </label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-accent-primary hover:bg-accent-primary/10 rounded-lg"
                              >
                                <LinkIcon className="h-4 w-4 mr-1" />
                                Search URL
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "apikeys" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Header Card */}
                  <div className="bg-surface-1 rounded-2xl p-8 border border-subtle shadow-sm">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">API Keys</h2>
                    <p className="text-text-secondary">
                      Bring your own API keys for selected models. Messages sent using your API keys will not count towards your monthly limits. Your keys are encrypted and stored securely.
                    </p>
                  </div>

                  {/* API Keys */}
                  {[
                    {
                      provider: "openai" as keyof typeof apiKeys,
                      name: "OpenAI API Key",
                      models: ["GPT-4o", "GPT-4o Mini"],
                      consoleLink: "https://platform.openai.com/api-keys",
                      placeholderPrefix: "sk-",
                      color: "bg-green-500",
                    },
                    {
                      provider: "claude" as keyof typeof apiKeys,
                      name: "Anthropic API Key",
                      models: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku"],
                      consoleLink: "https://console.anthropic.com/settings/keys",
                      placeholderPrefix: "sk-ant-",
                      color: "bg-orange-500",
                    },
                    {
                      provider: "gemini" as keyof typeof apiKeys,
                      name: "Google API Key",
                      models: ["Gemini 1.5 Pro", "Gemini 1.5 Flash"],
                      consoleLink: "https://aistudio.google.com/app/apikey",
                      placeholderPrefix: "AIza",
                      color: "bg-blue-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.provider}
                      className="bg-surface-1 rounded-2xl p-8 border border-subtle shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mr-4`}>
                          <KeyIcon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary">{item.name}</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-sm text-text-secondary mr-2">Used for:</span>
                        {item.models.map((modelName) => (
                          <span
                            key={modelName}
                            className="px-3 py-1 text-xs bg-surface-2 text-text-secondary rounded-full border border-subtle"
                          >
                            {modelName}
                          </span>
                        ))}
                      </div>
                      
                      <div className="relative mb-4">
                        <input
                          type={showApiKeys[item.provider] ? "text" : "password"}
                          value={apiKeys[item.provider]}
                          onChange={(e) =>
                            setApiKeys((prev) => ({
                              ...prev,
                              [item.provider]: e.target.value,
                            }))
                          }
                          placeholder={
                            savedApiKeys[item.provider]
                              ? "••••••••••••••••"
                              : `${item.placeholderPrefix}...`
                          }
                          className="w-full p-4 border border-subtle rounded-xl bg-surface-2 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary pr-12 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility(item.provider)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {showApiKeys[item.provider] ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <a
                          href={item.consoleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent-primary hover:underline inline-flex items-center transition-colors"
                        >
                          Get your API key from{" "}
                          {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)} Console
                          <ExternalLinkIcon className="h-3.5 w-3.5 ml-1.5" />
                        </a>
                        <Button
                          onClick={() => handleSaveApiKey(item.provider)}
                          disabled={isLoading || !apiKeys[item.provider]?.trim()}
                          className="bg-accent-primary hover:bg-accent-hover text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                        >
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(activeTab === "customization" ||
                activeTab === "history" ||
                activeTab === "attachments" ||
                activeTab === "contact") && (
                <div className="bg-surface-1 rounded-2xl p-12 border border-subtle shadow-sm text-center">
                  <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SettingsIcon className="h-8 w-8 text-text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Coming Soon</h3>
                  <p className="text-text-secondary">
                    This section is under construction. We're working hard to bring you new features!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}