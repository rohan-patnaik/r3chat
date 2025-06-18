"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error logging in:", error.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center p-1">
      <div className="max-w-md w-full">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome to R3Chat</h1>
          <p className="text-[var(--text-secondary)]">Sign in to continue your conversations</p>
        </div>

        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] p-6 rounded-lg">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)]"
            size="lg"
          >
            {isLoading ? (
              // Option 1: Stack spinner and text vertically with a gap
              <div className="flex flex-col items-center justify-center py-1">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>


        </div>
        <div className="mt-8 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
      </div>
    </div>
  );
}