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
      className="h-10 w-10 rounded-full hover:bg-surface-2 icon-hover bg-surface-1/80 backdrop-blur-sm border border-subtle/50"
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5 text-secondary" />
      ) : (
        <SunIcon className="h-5 w-5 text-secondary" />
      )}
    </Button>
  );
}