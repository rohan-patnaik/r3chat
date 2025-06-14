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
    <div className="min-h-screen bg-white"> {/* 1. Main page background to bg-white */}
      {/* Header */}
      <div className="border-b border-subtle bg-white px-6 py-4"> {/* Header bg also to white for consistency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0 text-text-primary hover:bg-surface-1"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="text-text-primary hover:bg-surface-1"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border-subtle bg-surface-1 p-6"> {/* Sidebar bg to surface-1 (light grey) */}
          {/* User Profile Card */}
          {/* 3.1. User Profile Card: bg-white, border-border-subtle, shadow-md */}
          <div className="mb-6 rounded-lg border border-border-subtle bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent-primary text-white">
              <span className="text-2xl font-bold">
                {profile?.display_name?.charAt(0)?.toUpperCase() ||
                  profile?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-text-primary">
              {profile?.display_name ||
                profile?.email?.split("@")[0] ||
                "User"}
            </h3>
            <p className="mb-3 text-sm text-text-secondary">
              {profile?.email || "No email"}
            </p>
            {/* 3.3. Plan Indicator Tag: bg-gray-800, text-white, px-2.5 py-0.5 */}
            <span className="inline-block rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-white">
              {profile?.account_type === "guest" ? "Free Plan" : "Pro Plan"}
            </span>
          </div>

          {/* Message Usage Card */}
          {/* 3.2. Message Usage Card: bg-white, border-border-subtle, shadow-md */}
          <div className="rounded-lg border border-border-subtle bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Message Usage
            </h3>
            <p className="mb-6 text-sm text-text-secondary">
              Resets on Jan 1, 2025
            </p>

            {/* Standard Usage */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  Standard
                </span>
                <span className="text-sm text-text-primary">
                  {`${
                    profile?.account_type === "guest"
                      ? 10 - (profile.credits_left ?? 10)
                      : 1500 - (profile?.credits_left ?? 1500)
                  } / ${profile?.account_type === "guest" ? 10 : 1500}`}
                </span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-border-subtle">
                <div
                  className="h-2 rounded-full bg-accent-primary"
                  style={{
                    width: `${
                      ((profile?.account_type === "guest"
                        ? 10 - (profile.credits_left ?? 10)
                        : 1500 - (profile?.credits_left ?? 1500)) /
                        (profile?.account_type === "guest" ? 10 : 1500)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-text-secondary">
                {`${
                  profile?.credits_left ??
                  (profile?.account_type === "guest" ? 10 : 1500)
                } messages remaining`}
              </p>
            </div>

            {/* Premium Usage */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium text-text-primary">
                    Premium
                  </span>
                  <InfoIcon className="h-4 w-4 text-text-secondary" />
                </div>
                <span className="text-sm text-text-primary">0 / 0</span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-border-subtle">
                <div className="h-2 w-0 rounded-full bg-accent-primary"></div>
              </div>
              <p className="text-xs text-text-secondary">0 messages remaining</p>
            </div>

            <Button
              onClick={() => window.open("https://example.com/billing", "_blank")}
              className="w-full bg-accent-primary text-white hover:bg-accent-hover"
            >
              Buy more premium credits
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6"> {/* Added p-6 here for overall padding for the main content area */}
          {/* 4. Settings Tab Navigation */}
          {/* 4.1. Container: bg-surface-1, rounded-lg, p-1, remove border-b */}
          <div className="mb-6 rounded-lg bg-surface-1 p-1">
            <nav className="flex space-x-1"> {/* 4. Tabs: space-x-1 for closer pill tabs */}
              {tabsConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none
                    ${
                      activeTab === tab.id
                        ? "bg-white text-text-primary border border-border-subtle shadow-sm" // 4.2. Active Tab Styling
                        : "bg-transparent text-text-secondary hover:bg-surface-2" // 4.2. Inactive Tab Styling
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 2. Main Content Area (Central Settings Panel) - Card Wrapper */}
          <div className="rounded-lg border border-border-subtle bg-white p-6 shadow-lg">
            {activeTab === "account" && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-text-primary">
                    Account
                  </h2>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium text-text-primary">
                    Account Settings
                  </h3>
                </div>

                <div>
                  <h4 className="mb-2 text-base font-medium text-text-primary">
                    Subscription
                  </h4>
                  <p className="mb-4 text-sm text-text-secondary">
                    You are currently on the{" "}
                    <span className="font-medium">
                      {profile?.account_type === "guest" ? "Free" : "Pro"} Plan
                    </span>
                    . Consider upgrading for more features.
                  </p>
                  <Button
                    onClick={handleManageSubscription}
                    className="bg-text-primary text-white hover:bg-gray-700" // Updated to dark solid button
                  >
                    Manage Subscription
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <h4 className="mb-2 text-base font-medium text-danger-warning">
                    Danger Zone
                  </h4>
                  <p className="mb-4 text-sm text-text-secondary">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive" // variant="destructive" likely handles appropriate red styling
                    onClick={() =>
                      alert("Account deletion initiated (placeholder). This is irreversible.")
                    }
                    className="bg-danger-warning text-white hover:bg-danger-warning/90" // Explicit classes ensuring solid red
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-text-primary">
                    Available Models
                  </h2>
                  <p className="text-text-secondary">
                    Choose which models appear in your model selector. This won't affect existing conversations.
                  </p>
                </div>

                {/* 1. Action Buttons: light-grey, bordered, pill-shaped */}
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-full border border-border-subtle bg-surface-1 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 hover:border-gray-400">
                    <ListFilterIcon className="mr-2 h-4 w-4" /> Filter by features
                  </Button>
                  <Button className="rounded-full border border-border-subtle bg-surface-1 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 hover:border-gray-400">
                    <SparklesIcon className="mr-2 h-4 w-4" /> Select Recommended Models
                  </Button>
                  <Button className="rounded-full border border-border-subtle bg-surface-1 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 hover:border-gray-400">
                    <XCircleIcon className="mr-2 h-4 w-4" /> Unselect All
                  </Button>
                </div>

                <div className="space-y-4">
                  {AVAILABLE_MODELS.map((model) => {
                    const modelState = modelSettings.find((m) => m.id === model.id);
                    const isEnabled = modelState?.enabled ?? model.enabled;
                    return (
                      // 2.1. Individual Model Cards: bg-white, border-border-subtle, shadow-md
                      <div
                        key={model.id}
                        className="rounded-lg border border-border-subtle bg-white p-4 shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center">
                              <span className="mr-3 text-2xl">
                                {model.provider === "OpenAI"
                                  ? "🤖"
                                  : model.provider === "Anthropic"
                                  ? "✨"
                                  : "🧠"}
                              </span>
                              <h3 className="text-lg font-semibold text-text-primary">
                                {model.name}
                              </h3>
                            </div>
                            <p className="mb-3 text-sm text-text-secondary">
                              {model.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {model.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="rounded-full border border-border-subtle bg-surface-1 px-2 py-1 text-xs text-text-secondary"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* 2.2. Toggle Switch */}
                          <div className="ml-4">
                            <button
                              type="button"
                              onClick={() => handleToggleModel(model.id)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
                                ${isEnabled ? "bg-accent-primary" : "bg-gray-300"}`}
                              role="switch"
                              aria-checked={isEnabled}
                            >
                              <span
                                aria-hidden="true"
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                  ${isEnabled ? "translate-x-5" : "translate-x-0"}`}
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "apikeys" && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-text-primary">
                    API Keys
                  </h2>
                  <p className="text-text-secondary">
                    Bring your own API keys for selected models. Messages sent using your API keys will not count towards your monthly limits.
                  </p>
                </div>

                {[
                  {
                    provider: "openai" as keyof typeof apiKeys,
                    name: "OpenAI API Key",
                    models: ["GPT-4o", "GPT-4o Mini"],
                    consoleLink: "https://platform.openai.com/api-keys",
                    placeholderPrefix: "sk-",
                  },
                  {
                    provider: "claude" as keyof typeof apiKeys,
                    name: "Anthropic API Key",
                    models: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku"],
                    consoleLink: "https://console.anthropic.com/settings/keys",
                    placeholderPrefix: "sk-ant-",
                  },
                  {
                    provider: "gemini" as keyof typeof apiKeys,
                    name: "Gemini API Key",
                    models: ["Gemini 1.5 Pro", "Gemini 1.5 Flash"],
                    consoleLink: "https://aistudio.google.com/app/apikey",
                    placeholderPrefix: "AIza",
                  },
                ].map((item) => (
                  // 1. API Provider Sub-cards: bg-surface-1, border-border-subtle, shadow-md
                  <div key={item.provider} className="rounded-lg border border-border-subtle bg-surface-1 p-6 shadow-md">
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">
                      {item.name}
                    </h3>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {item.models.map((modelName) => (
                        <span
                          key={modelName}
                          className="rounded-full border border-border-subtle bg-surface-1 px-2 py-1 text-xs text-text-secondary" // Model tags in API key card to surface-1
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
                        // 2. Input Fields: bg-white, border-border-subtle (already seems correct from previous diff)
                        className="w-full rounded-md border border-border-subtle bg-white p-3 pr-12 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKeyVisibility(item.provider)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
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
                        className="inline-flex items-center text-sm text-accent-primary hover:underline"
                      >
                        Get your API key from{" "}
                        {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)} Console
                        <ExternalLinkIcon className="ml-1 h-3 w-3" />
                      </a>
                      {/* 3. Save Button: bg-surface-2, text-text-primary, border-border-subtle */}
                      <Button
                        onClick={() => handleSaveApiKey(item.provider)}
                        disabled={isLoading || !apiKeys[item.provider]?.trim()}
                        className="border border-border-subtle bg-surface-2 px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-300 disabled:opacity-50"
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
              <div>
                <h2 className="mb-4 text-xl font-semibold text-text-primary">
                  {tabsConfig.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-text-secondary">This section is under construction.</p>
              </div>
            )}

            {activeTab === "contact" && (
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-text-primary">
                  We&apos;re here to help!
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Card 1: Feature Idea */}
                  <a
                    href="#" // Replace with actual link if available
                    className="block rounded-lg border border-border-subtle bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <SparklesIcon className="mt-1 h-8 w-8 flex-shrink-0 text-accent-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">
                          Have a cool feature idea?
                        </h4>
                        <p className="mt-1 text-sm text-text-secondary">
                          Vote on upcoming features or suggest your own.
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* Card 2: Non-critical Bug */}
                  <a
                    href="#" // Replace with actual link if available
                    className="block rounded-lg border border-border-subtle bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <BugIcon className="mt-1 h-8 w-8 flex-shrink-0 text-accent-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">
                          Found a non-critical bug?
                        </h4>
                        <p className="mt-1 text-sm text-text-secondary">
                          UI glitches or formatting issues? Report them here :)
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* Card 3: Account/Billing Issues */}
                  <a
                    href="mailto:support@ping.gg"
                    className="block rounded-lg border border-border-subtle bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <AlertCircleIcon className="mt-1 h-8 w-8 flex-shrink-0 text-accent-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">
                          Having account or billing issues?
                        </h4>
                        <p className="mt-1 text-sm text-text-secondary">
                          Email us for priority support - support@ping.gg
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* Card 4: Community/Discord */}
                  <a
                    href="#" // Replace with Discord server link
                    className="block rounded-lg border border-border-subtle bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <UsersIcon className="mt-1 h-8 w-8 flex-shrink-0 text-accent-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">
                          Want to join the community?
                        </h4>
                        <p className="mt-1 text-sm text-text-secondary">
                          Come hang out in our Discord! Chat with the team and other users.
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* Card 5: Privacy Policy */}
                  <a
                    href="#" // Replace with Privacy Policy link
                    className="block rounded-lg border border-border-subtle bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <ShieldIcon className="mt-1 h-8 w-8 flex-shrink-0 text-accent-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">
                          Privacy Policy
                        </h4>
                        <p className="mt-1 text-sm text-text-secondary">
                          Read our privacy policy and data handling practices.
                        </p>
                      </div>
                    </div>
                  </a>

                  {/* Card 6: Terms of Service */}
                  <a
                    href="#" // Replace with ToS link
                    className="block rounded-lg border border-border-subtle bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <FileTextIcon className="mt-1 h-8 w-8 flex-shrink-0 text-accent-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">
                          Terms of Service
                        </h4>
                        <p className="mt-1 text-sm text-text-secondary">
                          Review our terms of service and usage guidelines.
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}