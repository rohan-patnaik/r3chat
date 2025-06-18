import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsIcon } from "lucide-react";

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
            {/* Global header with theme/settings buttons */}
            <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-4">
              <ThemeToggle />
              <a
                href="/settings"
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-primary)]/10 transition"
                title="Settings"
              >
                <SettingsIcon className="h-5 w-5 text-[var(--text-primary)]" />
              </a>
            </div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}