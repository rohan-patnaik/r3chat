import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ChatLayout from "@/components/ChatLayout";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "R3Chat - AI Chat Application",
  description: "A fast, local-first AI chat web app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // If we're on the login page, don't redirect
  const isLoginPage = false; // We'll handle this in middleware instead

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {user ? (
          <ChatLayout>{children}</ChatLayout>
        ) : (
          children
        )}
      </body>
    </html>
  );
}