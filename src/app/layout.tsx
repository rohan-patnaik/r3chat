import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsIcon, LogOutIcon } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "R3Chat - AI Chat Application",
  description: "Fast, beautiful, privacy-respecting AI chat for developers and data scientists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="relative min-h-screen">
            {/* Global header with brand and icons */}
            <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-[var(--surface-0)]/50 backdrop-blur-sm">
              {/* Left side - Brand */}
              <div className="flex items-center">
                <h1 className="text-base font-bold text-[var(--text-primary)]">R3.chat</h1>
              </div>
              
              {/* Right side - Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="/logout"
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:shadow-md transition text-[var(--text-primary)]"
                  title="Sign out"
                >
                  <LogOutIcon className="h-4 w-4" />
                </a>
                <ThemeToggle />
                <a
                  href="/settings"
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:shadow-md transition text-[var(--text-primary)]"
                  title="Settings"
                >
                  <SettingsIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}