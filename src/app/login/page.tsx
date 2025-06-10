"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('Login error:', error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to R3Chat</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to start chatting with AI
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Signing in..." : "Sign in with GitHub"}
          </Button>
        </div>
        
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}