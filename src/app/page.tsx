import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatLayout from "@/components/ChatLayout";

export default async function HomePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ChatLayout />;
}