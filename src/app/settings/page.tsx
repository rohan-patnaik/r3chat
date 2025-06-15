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
  SunIcon,
  RocketIcon,
  HeadphonesIcon,
  StarIcon,
  BugIcon,
  AlertCircleIcon,
  UsersIcon,
  ShieldIcon,
  FileTextIcon,
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

const NEW_AVAILABLE_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's flagship model, known for speed and accuracy (and also web search!).",
    capabilities: ["Vision", "PDFs", "Search"],
    initialToggleState: false, // New property
    actionLink: "Search URL" // New property
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    description: "Similar to 2.0 Flash, but even faster.",
    capabilities: ["Fast", "Vision", "PDFs"],
    initialToggleState: false,
    actionLink: "Search URL"
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Google's latest fast model, known for speed and accuracy (and also web search!).",
    capabilities: ["Vision", "PDFs", "Search"],
    initialToggleState: true, // This one is ON
    actionLink: "Search URL"
  },
  {
    id: "gemini-2.5-flash-thinking",
    name: "Gemini 2.5 Flash (Thinking)",
    description: "Google's latest fast model, but now it can think!",
    capabilities: ["Vision", "PDFs", "Search", "Effort Control"],
    initialToggleState: false,
    actionLink: "Search URL"
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [modelSettings, setModelSettings] = useState(
    NEW_AVAILABLE_MODELS.map(m => ({ id: m.id, enabled: m.initialToggleState }))
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

  const API_KEY_CONFIG = [
    {
      provider: "claude" as keyof typeof apiKeys,
      name: "Anthropic API Key",
      models: ["Claude 3.5 Sonnet", "Claude 3.7 Sonnet", "Claude 3.7 Sonnet (Reasoning)", "Claude 4 Opus", "Claude 4 Sonnet"],
      inputPlaceholder: { saved: "••••••••••••••••", unsaved: "Enter your Anthropic API key" },
      consoleLinkText: "Get your API key from Anthropic's Console",
      consoleLink: "https://console.anthropic.com/settings/keys",
    },
    {
      provider: "openai" as keyof typeof apiKeys,
      name: "OpenAI API Key",
      models: ["GPT-4.5", "g3", "g3 Pro"],
      inputPlaceholder: "sk-...",
      consoleLinkText: "Get your API key from OpenAI's Dashboard",
      consoleLink: "https://platform.openai.com/api-keys",
    },
    {
      provider: "gemini" as keyof typeof apiKeys,
      name: "Google API Key",
      models: ["Gemini 2.0 Flash", "Gemini 2.0 Flash Lite", "Gemini 2.5 Flash", "Gemini 2.5 Flash (Thinking)", "Gemini 2.5 Pro"],
      inputPlaceholder: "Alza...",
      consoleLinkText: "Get your API key from Google Cloud Console",
      consoleLink: "https://aistudio.google.com/app/apikey",
    },
  ];

  useEffect(() => {
    if (profile?.email && !displayName) {
      setDisplayName(profile.email.split("@")[0]);
    }
  }, [profile, displayName]);

  const tabsConfig: { id: Tab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "customization", label: "Customization" },
    { id: "history", label: "History & Sync" },
    { id: "models", label: "Models" },
    { id: "apikeys", label: "API Keys" },
    { id: "attachments", label: "Attachments" },
    { id: "contact", label: "Contact Us" },
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
      {/* Header */}
      <div className="settings-header flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 btn-ghost icon-hover text-text-primary"
            title="Back to Chat"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1
            className="text-3xl font-bold text-text-primary cursor-pointer"
            onClick={() => router.back()}
          >
            Back to Chat
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <SunIcon className="h-6 w-6 text-text-primary" />
          <ThemeToggle />
          <Button
            variant="link"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-text-primary hover:underline"
            title="Sign out"
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="settings-container">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="lg:w-1/3 xl:w-1/4 space-y-6">
            {/* User Profile Card */}
            <div className="p-6 bg-surface-1 rounded-lg border border-subtle text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-primary bg-surface-2 mx-auto mb-4 flex items-center justify-center">
                <img
                  src={`https://ui-avatars.com/api/?name=C&background=ec4899&color=fff&size=96&font-size=0.33&bold=true`}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-text-primary truncate">
                Charles
              </h3>
              <p className="text-sm text-text-secondary truncate mb-3">
                charles@gmail.com
              </p>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full bg-pink-500 text-white`}
              >
                Pro Plan
              </span>
            </div>

            {/* Message Usage Card */}
            <div className="p-6 bg-surface-1 rounded-lg border border-subtle">
              <h3 className="text-xl font-semibold text-text-primary mb-1">
                Message Usage
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Resets on 07/11/2025
              </p>
              {/* Standard Usage */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    Standard
                  </span>
                  <span className="text-sm text-text-primary">
                    185/1500
                  </span>
                </div>
                <div className="w-full bg-border-subtle rounded-full h-2.5">
                  <div
                    className="bg-accent-primary h-2.5 rounded-full"
                    style={{
                      width: `12.33%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-1.5">
                  1315 messages remaining
                </p>
              </div>
              {/* Premium Usage */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-text-primary mr-1.5">
                      Premium
                    </span>
                    <span title="Premium models for Pro plan users">
                      <InfoIcon className="h-3.5 w-3.5 text-text-secondary" />
                    </span>
                  </div>
                  <span className="text-sm text-text-primary">
                    99/100
                  </span>
                </div>
                <div className="w-full bg-border-subtle rounded-full h-2.5">
                  <div
                    className="bg-accent-primary h-2.5 rounded-full"
                    style={{
                      width: `99%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-1.5">
                  1 messages remaining
                </p>
              </div>
              <Button
                onClick={() =>
                  window.open("https://example.com/billing", "_blank")
                }
                className="w-full btn-primary"
              >
                Buy more premium credits
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Keyboard Shortcuts Card */}
            <div className="p-6 bg-surface-1 rounded-lg border border-subtle">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Keyboard Shortcuts
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-sm text-text-primary">Search</span>
                  <kbd className="px-2 py-1.5 text-xs font-semibold text-text-primary bg-surface-2 border border-subtle rounded-md">Ctrl K</kbd>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm text-text-primary">New Chat</span>
                  <kbd className="px-2 py-1.5 text-xs font-semibold text-text-primary bg-surface-2 border border-subtle rounded-md">Ctrl Shift O</kbd>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm text-text-primary">Toggle Sidebar</span>
                  <kbd className="px-2 py-1.5 text-xs font-semibold text-text-primary bg-surface-2 border border-subtle rounded-md">Ctrl B</kbd>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            <div className="mb-6 border-b border-subtle">
              <nav className="flex space-x-1 overflow-x-auto pb-px">
                {tabsConfig.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-opacity-50
                      ${
                        activeTab === tab.id
                          ? "bg-accent-primary text-[var(--btn-primary-text)] border-b-2 border-accent-primary pb-2"
                          : "text-text-secondary hover:bg-surface-1 hover:text-text-primary pb-[calc(0.625rem-2px)] pt-2.5"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-6 bg-surface-1 rounded-lg border border-subtle min-h-[400px]">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {tabsConfig.find((t) => t.id === activeTab)?.label ||
                  "Content Area"}
              </h2>
              {activeTab === "account" && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-text-primary">
                    Pro Plan Benefits
                  </h2>
                  {/* Assuming Pro Plan for display purposes as per previous modifications */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-surface-1 rounded-lg border border-subtle text-center">
                      <RocketIcon className="h-10 w-10 mx-auto mb-3 text-pink-500" />
                      <h4 className="text-lg font-semibold text-text-primary mb-1">
                        Access to All Models
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Get access to our full suite of models including Claude, o3-mini-high, and more!
                      </p>
                    </div>
                    <div className="p-6 bg-surface-1 rounded-lg border border-subtle text-center">
                      <SparklesIcon className="h-10 w-10 mx-auto mb-3 text-pink-500" />
                      <h4 className="text-lg font-semibold text-text-primary mb-1">
                        Generous Limits
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Receive 1500 standard credits per month, plus 100 premium credits* per month.
                      </p>
                    </div>
                    <div className="p-6 bg-surface-1 rounded-lg border border-subtle text-center">
                      <HeadphonesIcon className="h-10 w-10 mx-auto mb-3 text-pink-500" />
                      <h4 className="text-lg font-semibold text-text-primary mb-1">
                        Priority Support
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Get faster responses and dedicated assistance from the R3 team whenever you need help!
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-surface-1 rounded-lg border border-subtle">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Subscription
                    </h3>
                    <p className="text-text-secondary mb-4">
                      You are currently on the{" "}
                      <span className="font-semibold">
                        Pro Plan
                      </span>
                      .
                      {/* Removed " Consider upgrading for more features." */}
                    </p>
                    <Button
                      onClick={() =>
                        window.open("https://example.com/billing", "_blank")
                      }
                      className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white inline-flex items-center justify-center"
                    >
                      Manage Subscription
                      <ExternalLinkIcon className="h-4 w-4 ml-2" />
                    </Button>
                    <p className="text-xs text-text-secondary mt-2">
                      *Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok 3. Additional Premium credits can be purchased separately.
                    </p>
                  </div>
                  <div className="p-6 bg-surface-1 rounded-lg border border-subtle">
                    <h3 className="text-xl font-semibold text-danger-warning mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <Button
                      onClick={() =>
                        alert(
                          "Account deletion initiated (placeholder). This is irreversible."
                        )
                      }
                      className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
              {activeTab === "models" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-semibold text-text-primary mb-1">
                      Available Models
                    </h2>
                    <p className="text-text-secondary">
                      Choose which models appear in your model selector. This
                      won't affect existing conversations.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary"
                    >
                      <ListFilterIcon className="h-4 w-4 mr-2" /> Filter by
                      features
                    </Button>
                    <Button
                      variant="outline"
                      className="text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" /> Select
                      Recommended Models
                    </Button>
                    <Button
                      variant="outline"
                      className="text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" /> Unselect All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {NEW_AVAILABLE_MODELS.map((model) => {
                      const modelState = modelSettings.find(
                        (m) => m.id === model.id
                      );
                      const isEnabled =
                        modelState?.enabled ?? model.initialToggleState;
                      return (
                        <div
                          key={model.id}
                          className={`p-5 bg-surface-1 rounded-lg border ${
                            isEnabled
                              ? "border-pink-500 shadow-md"
                              : "border-subtle"
                          } transition-all`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-text-primary mb-1">{model.name}</h3>
                              <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                {model.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {model.capabilities.map((capability) => (
                                  <span
                                    key={capability}
                                    className="px-2.5 py-0.5 text-xs font-medium bg-surface-0 text-text-secondary rounded-full border border-subtle"
                                  >
                                    {capability}
                                  </span>
                                ))}
                              </div>
                              <a
                                href="#" // Placeholder link
                                className="text-sm text-accent-primary hover:underline inline-flex items-center"
                              >
                                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                                {model.actionLink}
                              </a>
                            </div>
                            <div className="ml-4 flex flex-col items-end space-y-2">
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
                                    onChange={() =>
                                      handleToggleModel(model.id)
                                    }
                                  />
                                  <div
                                    className={`block w-10 h-6 rounded-full ${
                                      isEnabled
                                        ? "bg-pink-500"
                                        : "bg-border-subtle"
                                    }`}
                                  ></div>
                                  <div
                                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                      isEnabled ? "translate-x-4" : ""
                                    }`}
                                  ></div>
                                </div>
                              </label>
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
                  <div>
                    <h2 className="text-2xl font-semibold text-text-primary mb-1">
                      API Keys
                    </h2>
                    <p className="text-text-secondary">
                      Bring your own API keys for selected models. Messages sent
                      using your API keys will not count towards your monthly
                      limits. Your keys are encrypted and stored securely.
                    </p>
                  </div>
                  {API_KEY_CONFIG.map((item) => (
                    <div
                      key={item.provider}
                      className="p-6 bg-surface-1 rounded-lg border border-subtle"
                    >
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.models.map((modelName) => (
                          <span
                            key={modelName}
                            className="px-2 py-0.5 text-xs bg-surface-0 text-text-secondary rounded-full border border-subtle"
                          >
                            {modelName}
                          </span>
                        ))}
                      </div>
                      <div className="relative mb-2">
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
                            typeof item.inputPlaceholder === 'object'
                              ? (savedApiKeys[item.provider] ? item.inputPlaceholder.saved : item.inputPlaceholder.unsaved)
                              : item.inputPlaceholder
                          }
                          className="w-full p-3 border border-subtle rounded-md bg-surface-0 text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility(item.provider)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
                        >
                          {showApiKeys[item.provider] ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <a
                          href={item.consoleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent-primary hover:underline inline-flex items-center"
                        >
                          {item.consoleLinkText}
                          <ExternalLinkIcon className="h-3.5 w-3.5 ml-1.5" />
                        </a>
                        <Button
                          onClick={() => handleSaveApiKey(item.provider)}
                          disabled={isLoading || !apiKeys[item.provider]?.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
                activeTab === "attachments") && (
                <p className="mt-4 text-text-secondary">
                  This section is under construction.
                </p>
              )}
              {activeTab === "contact" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold text-text-primary mb-6">We're here to help!</h2>
                  <div className="space-y-4">
                    {/* Item 1: Feature idea */}
                    <div className="p-4 bg-surface-2 rounded-lg border border-subtle flex items-center space-x-4 cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                      <StarIcon className="h-6 w-6 text-pink-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">Have a cool feature idea?</p>
                        <p className="text-sm text-text-secondary">Vote on upcoming features or suggest your own</p>
                      </div>
                    </div>
                    {/* Item 2: Non-critical bug */}
                    <div className="p-4 bg-surface-2 rounded-lg border border-subtle flex items-center space-x-4 cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                      <BugIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">Found a non-critical bug?</p>
                        <p className="text-sm text-text-secondary">UI glitches or formatting issues? Report them here :)</p>
                      </div>
                    </div>
                    {/* Item 3: Account/billing issues */}
                    <div className="p-4 bg-surface-2 rounded-lg border border-subtle flex items-center space-x-4 cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                      <AlertCircleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">Having account or billing issues?</p>
                        <p className="text-sm text-text-secondary">Email us for priority support - support@ping.gg</p>
                      </div>
                    </div>
                    {/* Item 4: Join community */}
                    <div className="p-4 bg-surface-2 rounded-lg border border-subtle flex items-center space-x-4 cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                      <UsersIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">Want to join the community?</p>
                        <p className="text-sm text-text-secondary">Come hang out in our Discord! Chat with the team and other users</p>
                      </div>
                    </div>
                    {/* Item 5: Privacy Policy */}
                    <div className="p-4 bg-surface-2 rounded-lg border border-subtle flex items-center space-x-4 cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                      <ShieldIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">Privacy Policy</p>
                        <p className="text-sm text-text-secondary">Read our privacy policy and data handling practices</p>
                      </div>
                    </div>
                    {/* Item 6: Terms of Service */}
                    <div className="p-4 bg-surface-2 rounded-lg border border-subtle flex items-center space-x-4 cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                      <FileTextIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">Terms of Service</p>
                        <p className="text-sm text-text-secondary">Review our terms of service and usage guidelines</p>
                      </div>
                    </div>
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