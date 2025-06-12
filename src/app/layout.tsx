import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/hooks/useTheme";

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}