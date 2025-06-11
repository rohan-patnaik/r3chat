import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProvider } from "@/lib/llm/providers";

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();
    
    const supabase = await createClient(); // ADD AWAIT HERE
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get API key
    const { data: providerKey } = await supabase
      .from("provider_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .single();

    if (!providerKey?.api_key) {
      return Response.json({ error: "No API key found" }, { status: 400 });
    }

    // Test simple API call
    const provider = createProvider("google", providerKey.api_key);
    
    console.log("Testing model:", model);
    console.log("API key exists:", !!providerKey.api_key);
    
    // Test non-streaming first
    try {
      const response = await provider.generateResponse({
        messages: [{ role: "user", content: "Say 'Hello'" }],
        model,
      });
      
      console.log("Non-streaming response:", response);
      return Response.json({ success: true, response });
    } catch (error) {
      console.error("Provider error:", error);
      return Response.json({ 
        error: error instanceof Error ? error.message : "Unknown error",
        model,
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Debug API error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}