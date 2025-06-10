// src/lib/supabase/server.ts

import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";

/**
 * Creates and returns a Supabase server-side client.
 * 
 * We await nextCookies() so we get a ReadonlyRequestCookies,
 * and then wrap it in an object matching Supabase's required
 * { get, set, remove } signature. Since writing cookies
 * in Server Components is unsupported, set/remove are no-ops.
 */
export async function createServerSupabaseClient() {
  const store = await nextCookies();

  const cookieStore = {
    get: (name: string): string | undefined => {
      return store.get(name)?.value ?? undefined;
    },
    set: (_name: string, _value: string, _options?: CookieOptions) => {
      // no-op in Server Components
    },
    remove: (_name: string, _options?: CookieOptions) => {
      // no-op in Server Components
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );
}