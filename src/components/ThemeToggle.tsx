"use client";

import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon" // Using "icon" size for better consistency if defined in Button component
      onClick={toggleTheme}
      className="h-10 w-10 rounded-full p-0 flex items-center justify-center btn-ghost"
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5 text-text-primary" />
      ) : (
        <SunIcon className="h-5 w-5 text-text-primary" />
      )}
    </Button>
  );
}