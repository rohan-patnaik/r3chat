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
      className="h-9 w-9 rounded-full hover:bg-surface-2 border-0 transition-colors"
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <MoonIcon className="h-4 w-4 text-secondary" />
      ) : (
        <SunIcon className="h-4 w-4 text-secondary" />
      )}
    </Button>
  );
}