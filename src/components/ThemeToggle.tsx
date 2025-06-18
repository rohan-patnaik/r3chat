"use client";

import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0 rounded-full"
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <MoonIcon className="h-4 w-4 text-[var(--text-primary)]" />
      ) : (
        <SunIcon className="h-4 w-4 text-[var(--text-primary)]" />
      )}
    </Button>
  );
}