// src/lib/hooks/useUserProfile.ts

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { RealtimeChannel } from "@supabase/supabase-js";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function setupProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Step 1: Fetch the initial profile data on load
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data);
        }

        // Step 2: Set up a real-time subscription to listen for changes
        channel = supabase
          .channel("profile-changes")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${user.id}`, // Only listen for changes to THIS user's profile
            },
            (payload) => {
              // When an update is received, update the local state with the new data
              console.log("Realtime profile update received:", payload.new);
              setProfile(payload.new as Profile);
            },
          )
          .subscribe();
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    setupProfile();

    // Step 3: Clean up the subscription when the component unmounts
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []); // This effect still only runs once, but it sets up a persistent listener

  return { profile, loading, error };
}