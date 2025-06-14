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
  LogOutIcon,
  WrenchIcon,
  HistoryIcon,
  PaperclipIcon,
  MailIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/hooks/useTheme";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 md:px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              Settings
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-72 lg:w-80 border-r bg-background p-4 space-y-4">
          {/* User Profile Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center space-y-2">
              <Avatar className="mx-auto h-20 w-20">
                {/* <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || 'User'} /> */}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {profile?.display_name?.charAt(0)?.toUpperCase() ||
                    profile?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground">
                {profile?.display_name ||
                  profile?.email?.split("@")[0] ||
                  "User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile?.email || "No email available"}
              </p>
              <Badge
                variant={
                  profile?.account_type === "guest" ? "outline" : "default"
                }
                className="py-1 px-3 text-xs"
              >
                {profile?.account_type === "guest" ? "Free Plan" : "Pro Plan"}
              </Badge>
            </CardContent>
          </Card>

          {/* Message Usage Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Message Usage</CardTitle>
              <CardDescription>Resets on Jan 1, 2025</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              {/* Standard Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Standard
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {`${
                      profile?.account_type === "guest"
                        ? 10 - (profile.credits_left ?? 10)
                        : 1500 - (profile?.credits_left ?? 1500)
                    } / ${profile?.account_type === "guest" ? 10 : 1500}`}
                  </span>
                </div>
                <Progress
                  value={
                    ((profile?.account_type === "guest"
                      ? 10 - (profile.credits_left ?? 10)
                      : 1500 - (profile?.credits_left ?? 1500)) /
                      (profile?.account_type === "guest" ? 10 : 1500)) *
                    100
                  }
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {`${
                    profile?.credits_left ??
                    (profile?.account_type === "guest" ? 10 : 1500)
                  } messages remaining`}
                </p>
              </div>

              {/* Premium Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium text-foreground">
                      Premium
                    </span>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">0 / 0</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground">0 messages remaining</p>
              </div>

              <Button
                onClick={() => window.open("https://example.com/billing", "_blank")}
                className="w-full"
                variant="default"
              >
                Buy more premium credits
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as Tab)}
            className="w-full"
          >
            <div className="border-b bg-background sticky top-[61px] z-30">
              <TabsList className="px-6 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
                {tabsConfig.map((tab) => (
                  <TabsTrigger
                    value={tab.id}
                    key={tab.id}
                    className="py-3 sm:py-4 text-xs sm:text-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="account" className="p-4 md:p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6 sm:text-left">
                    Account
                  </h2>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                      You are currently on the{" "}
                      <span className="font-semibold text-foreground">
                        {profile?.account_type === "guest" ? "Free" : "Pro"} Plan
                      </span>
                      .
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Consider upgrading for more features and benefits.
                    </p>
                    <Button
                      onClick={handleManageSubscription}
                      variant="outline"
                    >
                      Manage Subscription
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone and is irreversible.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        alert("Account deletion initiated (placeholder). This is irreversible.")
                      }
                    >
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customization" className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
              <div className="text-center p-8 sm:p-10 rounded-lg bg-card border shadow-sm max-w-md sm:max-w-lg w-full">
                <WrenchIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/60 mx-auto mb-4" />
                <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold text-foreground">
                  {tabsConfig.find((t) => t.id === "customization")?.label}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  This section is under construction. We're working on it!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
              <div className="text-center p-8 sm:p-10 rounded-lg bg-card border shadow-sm max-w-md sm:max-w-lg w-full">
                <HistoryIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/60 mx-auto mb-4" />
                <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold text-foreground">
                  {tabsConfig.find((t) => t.id === "history")?.label}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  This section is under construction. We're working on it!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="models" className="p-4 md:p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-foreground">
                    Available Models
                  </h2>
                  <p className="text-muted-foreground">
                    Choose which models appear in your model selector. This won't affect existing conversations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="text-muted-foreground">
                    <ListFilterIcon className="mr-2 h-4 w-4" /> Filter by features
                  </Button>
                  <Button variant="outline" className="text-muted-foreground">
                    <SparklesIcon className="mr-2 h-4 w-4" /> Select Recommended Models
                  </Button>
                  <Button variant="outline" className="text-muted-foreground">
                    <XCircleIcon className="mr-2 h-4 w-4" /> Unselect All
                  </Button>
                </div>

                <div className="grid gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {AVAILABLE_MODELS.map((model) => {
                    const modelState = modelSettings.find((m) => m.id === model.id);
                    const isEnabled = modelState?.enabled ?? model.enabled;
                    return (
                      <Card
                        key={model.id}
                        className={`flex flex-col ${
                          isEnabled ? "border-primary shadow-md" : "shadow-sm"
                        }`}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <span className="text-xl">
                                {model.provider === "OpenAI"
                                  ? "🤖"
                                  : model.provider === "Anthropic"
                                  ? "✨"
                                  : "🧠"}
                              </span>
                              {model.name}
                            </CardTitle>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleModel(model.id)}
                              id={`model-toggle-${model.id}`}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-grow">
                          <p className="mb-3 text-xs leading-relaxed">
                            {model.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {model.features.map((feature) => (
                              <Badge
                                variant="secondary"
                                key={feature}
                                className="font-normal text-xs px-1.5 py-0.5"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="apikeys" className="p-4 md:p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-foreground">
                    API Keys
                  </h2>
                  <p className="text-muted-foreground">
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
                  <Card key={item.provider}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.models.map((modelName) => (
                          <Badge
                            variant="secondary"
                            key={modelName}
                            className="font-normal text-xs px-1.5 py-0.5"
                          >
                            {modelName}
                          </Badge>
                        ))}
                      </div>
                      <div className="relative flex items-center">
                        <Input
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
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleApiKeyVisibility(item.provider)}
                          className="absolute right-1 h-7 w-7"
                        >
                          {showApiKeys[item.provider] ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showApiKeys[item.provider] ? "Hide API key" : "Show API key"}
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/50">
                      <a
                        href={item.consoleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-center"
                      >
                        Get API key from{" "}
                        {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}{" "}
                        Console
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </a>
                      <Button
                        onClick={() => handleSaveApiKey(item.provider)}
                        disabled={isLoading || !apiKeys[item.provider]?.trim()}
                        variant="default"
                        size="sm"
                        className="self-end sm:self-center"
                      >
                        {isLoading ? "Saving..." : "Save Key"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
              <div className="text-center p-8 sm:p-10 rounded-lg bg-card border shadow-sm max-w-md sm:max-w-lg w-full">
                <PaperclipIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/60 mx-auto mb-4" />
                <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold text-foreground">
                  {tabsConfig.find((t) => t.id === "attachments")?.label}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  This section is under construction. We're working on it!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-280px)]">
              <div className="text-center p-8 sm:p-10 rounded-lg bg-card border shadow-sm max-w-md sm:max-w-lg w-full">
                <MailIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/60 mx-auto mb-4" />
                <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-semibold text-foreground">
                  {tabsConfig.find((t) => t.id === "contact")?.label}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  This section is under construction. We're working on it!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}